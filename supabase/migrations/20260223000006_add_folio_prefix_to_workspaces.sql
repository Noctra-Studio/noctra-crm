-- Add folio_prefix to workspaces
ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS folio_prefix TEXT DEFAULT 'NOC-' NOT NULL;
