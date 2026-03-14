-- ============================================
-- USER DASHBOARD PREFERENCES
-- Migration: 20260313110000_user_dashboard_preferences.sql
-- ============================================

CREATE TABLE IF NOT EXISTS public.user_dashboard_preferences (
  workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  widget_key text NOT NULL,
  visible boolean NOT NULL DEFAULT true,
  order_index integer NOT NULL DEFAULT 0,
  size_variant text NOT NULL DEFAULT 'default',
  widget_preferences jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT user_dashboard_preferences_pkey PRIMARY KEY (
    workspace_id,
    user_id,
    widget_key
  ),
  CONSTRAINT user_dashboard_preferences_size_variant_check CHECK (
    size_variant IN ('compact', 'default', 'expanded')
  )
);

CREATE INDEX IF NOT EXISTS user_dashboard_preferences_user_idx
  ON public.user_dashboard_preferences(user_id, workspace_id, order_index);

CREATE OR REPLACE FUNCTION public.set_user_dashboard_preferences_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS user_dashboard_preferences_set_updated_at
  ON public.user_dashboard_preferences;

CREATE TRIGGER user_dashboard_preferences_set_updated_at
BEFORE UPDATE ON public.user_dashboard_preferences
FOR EACH ROW
EXECUTE FUNCTION public.set_user_dashboard_preferences_updated_at();

ALTER TABLE public.user_dashboard_preferences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own dashboard preferences"
  ON public.user_dashboard_preferences;

CREATE POLICY "Users manage own dashboard preferences"
ON public.user_dashboard_preferences
FOR ALL
TO authenticated
USING (
  user_id = auth.uid()
  AND public.is_workspace_member(workspace_id)
)
WITH CHECK (
  user_id = auth.uid()
  AND public.is_workspace_member(workspace_id)
);
