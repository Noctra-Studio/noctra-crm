-- ==========================================
-- FINANCE SYNC: SUPABASE SCHEMA MIGRATION
-- ==========================================

-- 1. Enum for Accounting Sync Status
DO $$ BEGIN
    CREATE TYPE accounting_sync_status AS ENUM ('pending', 'synced', 'error');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Alter 'contracts' table
ALTER TABLE public.contracts
ADD COLUMN IF NOT EXISTS accounting_sync_status accounting_sync_status DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS accounting_external_id TEXT,
ADD COLUMN IF NOT EXISTS accounting_sync_error TEXT,
ADD COLUMN IF NOT EXISTS accounting_synced_at TIMESTAMPTZ;

-- 3. Create 'tax_profiles' table (Per Client/Lead)
CREATE TABLE IF NOT EXISTS public.tax_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
    rfc_vat_id TEXT NOT NULL, -- Tax ID (RFC, CUIT, VAT, etc.)
    legal_name TEXT NOT NULL,
    tax_address TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(lead_id) -- One tax profile per lead
);

-- 4. Row Level Security for tax_profiles
ALTER TABLE public.tax_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their organization's tax profiles"
ON public.tax_profiles
FOR ALL
TO authenticated
USING (organization_id = (SELECT organization_id FROM auth.users WHERE id = auth.uid()))
WITH CHECK (organization_id = (SELECT organization_id FROM auth.users WHERE id = auth.uid()));

-- 5. Trigger for updated_at on tax_profiles
CREATE TRIGGER update_tax_profiles_modtime
BEFORE UPDATE ON public.tax_profiles
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();
