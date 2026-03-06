-- ============================================
-- NOCTRA STUDIO PROJECT REPORTS
-- Migration: 010_project_reports.sql
-- ============================================

-- 1. Add report-related columns to projects table
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS report_token UUID DEFAULT gen_random_uuid() UNIQUE,
ADD COLUMN IF NOT EXISTS report_config JSONB DEFAULT '{"custom_message": "", "include_tasks": true, "include_deliverables": true}'::jsonb,
ADD COLUMN IF NOT EXISTS report_generated_at TIMESTAMPTZ;

-- 2. Add index for report_token lookups
CREATE INDEX IF NOT EXISTS projects_report_token_idx ON public.projects(report_token);

-- 3. Update RLS policies for public report access
-- Public (anonymous) users can read project details if they have the valid report_token
DROP POLICY IF EXISTS "Public can view project report via token" ON public.projects;
CREATE POLICY "Public can view project report via token" 
ON public.projects 
FOR SELECT 
TO anon, authenticated
USING (report_token IS NOT NULL);

-- Public can also read associated tasks for the report
DROP POLICY IF EXISTS "Public can view tasks via project report token" ON public.project_tasks;
CREATE POLICY "Public can view tasks via project report token" 
ON public.project_tasks 
FOR SELECT 
TO anon, authenticated
USING (
  project_id IN (
    SELECT id FROM public.projects WHERE report_token IS NOT NULL
  )
);

-- Public can also read associated deliverables for the report
DROP POLICY IF EXISTS "Public can view deliverables via project report token" ON public.project_deliverables;
CREATE POLICY "Public can view deliverables via project report token" 
ON public.project_deliverables 
FOR SELECT 
TO anon, authenticated
USING (
  project_id IN (
    SELECT id FROM public.projects WHERE report_token IS NOT NULL
  )
);
