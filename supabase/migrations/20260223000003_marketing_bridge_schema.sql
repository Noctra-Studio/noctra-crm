-- ==========================================
-- MARKETING BRIDGE: SUPABASE SCHEMA & TRIGGERS
-- ==========================================

-- 1. Enum for Integration Providers
CREATE TYPE integration_provider AS ENUM ('mailchimp', 'hubspot', 'zapier');

-- 2. Create integrations_config Table
CREATE TABLE public.integrations_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL, -- Ties config to a specific organization/workspace
    provider integration_provider NOT NULL,
    api_key TEXT NOT NULL,         -- Submitting as plain text for simplicity here; in production, consider Vault
    audience_id TEXT,              -- Specific to Mailchimp (List ID)
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Ensure only one active config per provider per organization
CREATE UNIQUE INDEX unique_active_provider_per_org 
ON public.integrations_config (organization_id, provider) 
WHERE is_active = true;

-- 3. Row Level Security for integrations_config
ALTER TABLE public.integrations_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their organization's integration config"
ON public.integrations_config
FOR ALL
TO authenticated
USING (organization_id = (SELECT organization_id FROM auth.users WHERE id = auth.uid()))
WITH CHECK (organization_id = (SELECT organization_id FROM auth.users WHERE id = auth.uid()));

-- Policy: Edge Functions (Service Role) need to read this
CREATE POLICY "Service Role can read all integration configs"
ON public.integrations_config
FOR SELECT
TO service_role
USING (true);


-- 4. Create Postgres Function (Webhook) to trigger Edge Function
-- This uses the built-in HTTP extension if available, OR we can use net.http_post via pg_net
-- We will use the standard pg_net extension method for Supabase Webhooks

-- Ensure pg_net is enabled
CREATE EXTENSION IF NOT EXISTS pg_net;

CREATE OR REPLACE FUNCTION trigger_sync_contact_function()
RETURNS TRIGGER AS $$
DECLARE
  webhook_url TEXT;
  auth_header TEXT;
  service_role_key TEXT;
  payload JSONB;
BEGIN
  -- Only trigger if the status CHANGED to 'won'
  IF NEW.status = 'won' AND (TG_OP = 'INSERT' OR OLD.status IS DISTINCT FROM NEW.status) THEN
    
    -- In Supabase, you usually pass the Service Role key to self-call Edge Functions
    -- Ideally, store this in Vault, but for now we construct it from env or pass a known header
    -- We assume the Edge Function accepts an ANON key but validates internal payload, 
    -- or we grab it if available. Usually, webhooks in Supabase Dashboard handle this securely.
    -- Here we script a raw pg_net call:
    
    -- Determine the current project URL (you may need to replace this if hardcoding is required)
    -- As a robust fallback, we send the entire NEW record to a generic endpoint path
    -- that the user configures in their SUPABASE_URL.
    
    webhook_url := current_setting('app.settings.edge_function_base_url', true) || '/sync-contact';
    
    -- If URL isn't set in postgres config, this fails silently or we skip.
    -- Alternatively, users configure triggers via dashboard.
    -- For completeness, here is the raw construction:
    
    IF webhook_url IS NOT NULL THEN
        payload := jsonb_build_object(
            'type', TG_OP,
            'table', TG_TABLE_NAME,
            'schema', TG_TABLE_SCHEMA,
            'record', row_to_json(NEW),
            'old_record', CASE WHEN TG_OP = 'UPDATE' THEN row_to_json(OLD) ELSE null END
        );

        PERFORM net.http_post(
            url := webhook_url,
            body := payload,
            headers := '{"Content-Type": "application/json"}'::jsonb
        );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Attach Trigger to 'leads' Table
-- We assume a table named 'leads' exists with a 'status' column
DROP TRIGGER IF EXISTS on_lead_won_sync_contact ON public.leads;

CREATE TRIGGER on_lead_won_sync_contact
AFTER INSERT OR UPDATE OF status ON public.leads
FOR EACH ROW
EXECUTE FUNCTION trigger_sync_contact_function();

-- 6. Trigger for updated_at
CREATE TRIGGER update_integrations_config_modtime
BEFORE UPDATE ON public.integrations_config
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();
