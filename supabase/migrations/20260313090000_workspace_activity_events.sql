CREATE TABLE IF NOT EXISTS public.workspace_activity_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  actor_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL DEFAULT auth.uid(),
  entity_type TEXT NOT NULL CHECK (
    entity_type IN (
      'lead',
      'proposal',
      'contract',
      'project',
      'client',
      'migration',
      'document',
      'system'
    )
  ),
  entity_id UUID,
  event_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS workspace_activity_events_workspace_created_at_idx
  ON public.workspace_activity_events (workspace_id, created_at DESC);

CREATE INDEX IF NOT EXISTS workspace_activity_events_workspace_event_type_idx
  ON public.workspace_activity_events (workspace_id, event_type);

ALTER TABLE public.workspace_activity_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Workspace members can read activity events"
  ON public.workspace_activity_events;
CREATE POLICY "Workspace members can read activity events"
  ON public.workspace_activity_events
  FOR SELECT
  USING (public.is_workspace_member(workspace_id));

DROP POLICY IF EXISTS "Workspace members can create activity events"
  ON public.workspace_activity_events;
CREATE POLICY "Workspace members can create activity events"
  ON public.workspace_activity_events
  FOR INSERT
  WITH CHECK (public.is_workspace_member(workspace_id));
