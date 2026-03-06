
-- Tables for Data Migration Module

-- Main migration tracking table
CREATE TABLE IF NOT EXISTS migrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  source TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  config JSONB NOT NULL DEFAULT '{}',
  stats JSONB NOT NULL DEFAULT '{
    "total": 0,
    "processed": 0,
    "succeeded": 0,
    "failed": 0,
    "warnings": 0
  }',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  
  CONSTRAINT valid_status CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
  CONSTRAINT valid_source CHECK (source IN ('hubspot', 'zoho', 'pipedrive', 'odoo', 'salesforce', 'freshsales', 'bitrix24', 'csv', 'excel', 'json'))
);

-- Detailed logs for each migration
CREATE TABLE IF NOT EXISTS migration_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  migration_id UUID NOT NULL REFERENCES migrations(id) ON DELETE CASCADE,
  level TEXT NOT NULL,
  row_number INTEGER,
  external_id TEXT,
  message TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT valid_level CHECK (level IN ('info', 'warning', 'error'))
);

-- Indexing for performance
CREATE INDEX IF NOT EXISTS idx_migrations_workspace_id ON migrations(workspace_id);
CREATE INDEX IF NOT EXISTS idx_migration_logs_migration_id ON migration_logs(migration_id);

-- Enable RLS
ALTER TABLE migrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE migration_logs ENABLE ROW LEVEL SECURITY;

-- Policies for migrations
CREATE POLICY "Users can view migrations of their workspace" ON migrations
  FOR SELECT USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create migrations for their workspace" ON migrations
  FOR INSERT WITH CHECK (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
    )
  );

-- Policies for migration logs
CREATE POLICY "Users can view logs of their migrations" ON migration_logs
  FOR SELECT USING (
    migration_id IN (
      SELECT id FROM migrations WHERE workspace_id IN (
        SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
      )
    )
  );

-- Function to handle rollback (conceptual for now, will be implemented via edge functions/workers)
-- This usually involves marking records imported by a specific migration_id and deleting them.
