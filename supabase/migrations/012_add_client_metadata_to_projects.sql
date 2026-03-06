-- Add client metadata columns to projects table
ALTER TABLE projects ADD COLUMN IF NOT EXISTS client_name TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS client_email TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS client_company TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS lead_id UUID REFERENCES contact_submissions(id) ON DELETE SET NULL;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS contract_id UUID REFERENCES contracts(id) ON DELETE SET NULL;

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_projects_client_email ON projects(client_email);
