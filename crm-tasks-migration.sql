-- ============================================================
-- Noctra CRM – crm_tasks table migration
-- Run this in the Supabase SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS crm_tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  due_date DATE,
  assigned_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  entity_type TEXT CHECK (entity_type IN ('lead', 'client', 'project', 'proposal', 'contract')),
  entity_id TEXT,
  completed BOOLEAN DEFAULT false NOT NULL,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Index for fast entity lookups
CREATE INDEX IF NOT EXISTS crm_tasks_entity_idx 
  ON crm_tasks (entity_type, entity_id);

CREATE INDEX IF NOT EXISTS crm_tasks_workspace_idx 
  ON crm_tasks (workspace_id);

-- RLS: Enable row-level security
ALTER TABLE crm_tasks ENABLE ROW LEVEL SECURITY;

-- Policy: authenticated workspace members can view/edit their tasks
CREATE POLICY "workspace_members_tasks" ON crm_tasks
  FOR ALL
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
    )
  );
