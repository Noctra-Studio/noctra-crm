-- ============================================
-- DASHBOARD MULTITENANCY FIX
-- Migration: 20260413123000_dashboard_multitenancy_fix.sql
-- ============================================

-- 1. Rename existing preferences table to match application layer
ALTER TABLE public.user_dashboard_preferences RENAME TO dashboard_preferences;

-- 2. Rename columns to match application layer
ALTER TABLE public.dashboard_preferences RENAME COLUMN widget_preferences TO filters;

-- 3. Update the trigger function name and trigger if necessary (optional but good for consistency)
ALTER FUNCTION public.set_user_dashboard_preferences_updated_at() RENAME TO set_dashboard_preferences_updated_at;
ALTER TRIGGER user_dashboard_preferences_set_updated_at ON public.dashboard_preferences RENAME TO dashboard_preferences_set_updated_at;

-- 4. Create the missing filters table with multitenant-safe composite primary key
CREATE TABLE IF NOT EXISTS public.user_dashboard_filters (
    workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    widget_key text NOT NULL,
    filter_key text NOT NULL,
    filter_value jsonb NOT NULL DEFAULT 'null'::jsonb,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT user_dashboard_filters_pkey PRIMARY KEY (
        workspace_id,
        user_id,
        widget_key,
        filter_key
    )
);

-- 5. Add index for performance on filtering
CREATE INDEX IF NOT EXISTS user_dashboard_filters_user_idx
    ON public.user_dashboard_filters(user_id, workspace_id, widget_key);

-- 6. Add updated_at trigger for the new table
CREATE OR REPLACE FUNCTION public.set_user_dashboard_filters_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS user_dashboard_filters_set_updated_at
  ON public.user_dashboard_filters;

CREATE TRIGGER user_dashboard_filters_set_updated_at
BEFORE UPDATE ON public.user_dashboard_filters
FOR EACH ROW
EXECUTE FUNCTION public.set_user_dashboard_filters_updated_at();

-- 7. Enable RLS and add policies
ALTER TABLE public.user_dashboard_filters ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own dashboard filters"
  ON public.user_dashboard_filters;

CREATE POLICY "Users manage own dashboard filters"
ON public.user_dashboard_filters
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
