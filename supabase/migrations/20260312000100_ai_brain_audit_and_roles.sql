-- ============================================
-- CENTRAL BRAIN AUDIT LOGS AND ROLE HELPERS
-- Migration: 20260312000100_ai_brain_audit_and_roles.sql
-- ============================================

CREATE OR REPLACE FUNCTION public.has_workspace_role(
  target_workspace_id uuid,
  allowed_roles text[]
)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.workspace_members wm
    WHERE wm.workspace_id = target_workspace_id
      AND wm.user_id = auth.uid()
      AND wm.role = ANY(allowed_roles)
  );
$$;

REVOKE ALL ON FUNCTION public.has_workspace_role(uuid, text[]) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_workspace_role(uuid, text[]) TO authenticated;

CREATE TABLE IF NOT EXISTS public.ai_brain_audit_logs (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id uuid,
  route text NOT NULL,
  provider text,
  model text,
  complexity text,
  mode text,
  success boolean NOT NULL DEFAULT true,
  response_status integer,
  workspace_state text,
  input_chars integer NOT NULL DEFAULT 0,
  message_count integer NOT NULL DEFAULT 0,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ai_brain_audit_logs_workspace_created_idx
  ON public.ai_brain_audit_logs(workspace_id, created_at DESC);

CREATE INDEX IF NOT EXISTS ai_brain_audit_logs_provider_created_idx
  ON public.ai_brain_audit_logs(provider, created_at DESC);

ALTER TABLE public.ai_brain_audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owners and admins can read AI brain audit logs"
  ON public.ai_brain_audit_logs;
CREATE POLICY "Owners and admins can read AI brain audit logs"
ON public.ai_brain_audit_logs
FOR SELECT
TO authenticated
USING (public.has_workspace_role(workspace_id, ARRAY['owner', 'admin']));

DROP POLICY IF EXISTS "Workspace members can insert AI brain audit logs"
  ON public.ai_brain_audit_logs;
CREATE POLICY "Workspace members can insert AI brain audit logs"
ON public.ai_brain_audit_logs
FOR INSERT
TO authenticated
WITH CHECK (public.is_workspace_member(workspace_id));
