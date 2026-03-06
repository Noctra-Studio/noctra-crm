-- Migration: Project Tasks & Service Type
-- Adds the project_tasks table and the service_type column to the projects table.

-- 1. Add service_type to projects
ALTER TABLE projects ADD COLUMN IF NOT EXISTS service_type TEXT DEFAULT 'web_presence';

-- 2. Create project_tasks table
CREATE TABLE IF NOT EXISTS project_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    phase TEXT NOT NULL,
    title TEXT NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMPTZ,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Enable RLS
ALTER TABLE project_tasks ENABLE ROW LEVEL SECURITY;

-- 4. Create Policies for project_tasks
CREATE POLICY "Enable all access for authenticated users on project_tasks"
    ON project_tasks FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Optional: If you need granular policies instead of ALL, you can use these:
-- CREATE POLICY "Enable read access for authenticated users on project_tasks" ON project_tasks FOR SELECT TO authenticated USING (true);
-- CREATE POLICY "Enable insert access for authenticated users on project_tasks" ON project_tasks FOR INSERT TO authenticated WITH CHECK (true);
-- CREATE POLICY "Enable update access for authenticated users on project_tasks" ON project_tasks FOR UPDATE TO authenticated USING (true);
-- CREATE POLICY "Enable delete access for authenticated users on project_tasks" ON project_tasks FOR DELETE TO authenticated USING (true);
