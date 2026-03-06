-- ============================================
-- RLS SECURITY UPDATE - SIMPLIFIED FOR ADMINS
-- Migration: 011_rls_security_update.sql
-- ============================================

-- 1. PROPOSALS
DROP POLICY IF EXISTS "Authenticated can manage proposals" ON proposals;
DROP POLICY IF EXISTS "Admins can manage proposals" ON proposals;
DROP POLICY IF EXISTS "Authenticated full access to proposals" ON proposals;

CREATE POLICY "Authenticated full access to proposals"
ON proposals FOR ALL TO authenticated
USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public can read proposals by token" ON proposals;
DROP POLICY IF EXISTS "Public can view proposals via token" ON proposals;
DROP POLICY IF EXISTS "Public read proposals by token" ON proposals;

CREATE POLICY "Public read proposals by token"
ON proposals FOR SELECT TO anon
USING (client_token IS NOT NULL);

-- 2. CONTRACTS
DROP POLICY IF EXISTS "Authenticated can manage contracts" ON contracts;
DROP POLICY IF EXISTS "Admins can manage contracts" ON contracts;
DROP POLICY IF EXISTS "Authenticated full access to contracts" ON contracts;

CREATE POLICY "Authenticated full access to contracts"
ON contracts FOR ALL TO authenticated
USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public can read contracts by token" ON contracts;
DROP POLICY IF EXISTS "Public can view contracts via token" ON contracts;
DROP POLICY IF EXISTS "Public read contracts by token" ON contracts;

CREATE POLICY "Public read contracts by token"
ON contracts FOR SELECT TO anon
USING (client_token IS NOT NULL);

-- 3. CRM TABLES (Leads & Submissions)
DROP POLICY IF EXISTS "Admins can manage leads" ON contact_submissions;
DROP POLICY IF EXISTS "Authenticated manage contact_submissions" ON contact_submissions;

CREATE POLICY "Authenticated full access to contact_submissions"
ON contact_submissions FOR ALL TO authenticated
USING (true) WITH CHECK (true);

-- 4. LEAD ACTIVITIES
DROP POLICY IF EXISTS "Admins can manage lead activities" ON lead_activities;
DROP POLICY IF EXISTS "Authenticated manage lead_activities" ON lead_activities;

CREATE POLICY "Authenticated full access to lead_activities"
ON lead_activities FOR ALL TO authenticated
USING (true) WITH CHECK (true);

-- 5. PROJECTS MODULE
-- project_tasks
DROP POLICY IF EXISTS "Authenticated manage project_tasks" ON project_tasks;
CREATE POLICY "Authenticated full access to project_tasks"
ON project_tasks FOR ALL TO authenticated
USING (true) WITH CHECK (true);

-- project_time_logs  
DROP POLICY IF EXISTS "Authenticated manage project_time_logs" ON project_time_logs;
CREATE POLICY "Authenticated full access to project_time_logs"
ON project_time_logs FOR ALL TO authenticated
USING (true) WITH CHECK (true);

-- project_expenses
DROP POLICY IF EXISTS "Authenticated manage project_expenses" ON project_expenses;
CREATE POLICY "Authenticated full access to project_expenses"
ON project_expenses FOR ALL TO authenticated
USING (true) WITH CHECK (true);

-- project_deliverables
DROP POLICY IF EXISTS "Authenticated manage project_deliverables" ON project_deliverables;
CREATE POLICY "Authenticated full access to project_deliverables" ON project_deliverables
FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public read deliverables by token" ON project_deliverables;
CREATE POLICY "Public read deliverables by token"
ON project_deliverables FOR SELECT TO anon
USING (client_token IS NOT NULL);

-- deliverable_items (if exists)
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'deliverable_items') THEN
        ALTER TABLE public.deliverable_items ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Authenticated manage deliverable_items" ON deliverable_items;
        CREATE POLICY "Authenticated full access to deliverable_items" ON deliverable_items
        FOR ALL TO authenticated USING (true) WITH CHECK (true);
    END IF;
END $$;
