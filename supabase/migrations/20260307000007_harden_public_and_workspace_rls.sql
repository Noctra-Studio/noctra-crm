-- ============================================
-- HARDEN PUBLIC TOKEN ACCESS AND WORKSPACE RLS
-- Migration: 20260307000007_harden_public_and_workspace_rls.sql
-- ============================================

-- Helper: authenticated workspace membership check
CREATE OR REPLACE FUNCTION public.is_workspace_member(target_workspace_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.workspace_members wm
    WHERE wm.workspace_id = target_workspace_id
      AND wm.user_id = auth.uid()
  );
$$;

REVOKE ALL ON FUNCTION public.is_workspace_member(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_workspace_member(uuid) TO authenticated;

-- Helper: project access inherited from project.workspace_id
CREATE OR REPLACE FUNCTION public.can_access_project(target_project_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.projects p
    WHERE p.id = target_project_id
      AND public.is_workspace_member(p.workspace_id)
  );
$$;

REVOKE ALL ON FUNCTION public.can_access_project(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.can_access_project(uuid) TO authenticated;

-- Helper: lead access inherited from lead.workspace_id
CREATE OR REPLACE FUNCTION public.can_access_lead(target_lead_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.contact_submissions cs
    WHERE cs.id = target_lead_id
      AND public.is_workspace_member(cs.workspace_id)
  );
$$;

REVOKE ALL ON FUNCTION public.can_access_lead(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.can_access_lead(uuid) TO authenticated;

-- Remove public token/report policies. Public access is now server-side only.
DROP POLICY IF EXISTS "Public can view contracts via token" ON public.contracts;
DROP POLICY IF EXISTS "Public can read contracts by token" ON public.contracts;
DROP POLICY IF EXISTS "Public read contracts by token" ON public.contracts;

DROP POLICY IF EXISTS "Public can view project report via token" ON public.projects;
DROP POLICY IF EXISTS "Public can view tasks via project report token" ON public.project_tasks;
DROP POLICY IF EXISTS "Public can view deliverables via project report token" ON public.project_deliverables;

DROP POLICY IF EXISTS "Read access for clients via token" ON public.project_deliverables;
DROP POLICY IF EXISTS "Update access for clients via token" ON public.project_deliverables;
DROP POLICY IF EXISTS "Public read deliverables by token" ON public.project_deliverables;

DROP POLICY IF EXISTS "Public can read proposals by token" ON public.proposals;
DROP POLICY IF EXISTS "Public can view proposals via token" ON public.proposals;
DROP POLICY IF EXISTS "Public read proposals by token" ON public.proposals;

-- Workspace-scoped policies for internal CRM data
DROP POLICY IF EXISTS "Admins can manage proposals" ON public.proposals;
DROP POLICY IF EXISTS "Authenticated can manage proposals" ON public.proposals;
DROP POLICY IF EXISTS "Authenticated full access to proposals" ON public.proposals;
CREATE POLICY "Workspace members can manage proposals"
ON public.proposals
FOR ALL
TO authenticated
USING (public.is_workspace_member(workspace_id))
WITH CHECK (public.is_workspace_member(workspace_id));

DROP POLICY IF EXISTS "Admins can manage proposal_items" ON public.proposal_items;
CREATE POLICY "Workspace members can manage proposal_items"
ON public.proposal_items
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.proposals p
    WHERE p.id = proposal_items.proposal_id
      AND public.is_workspace_member(p.workspace_id)
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.proposals p
    WHERE p.id = proposal_items.proposal_id
      AND public.is_workspace_member(p.workspace_id)
  )
);

DROP POLICY IF EXISTS "Admins can manage contracts" ON public.contracts;
DROP POLICY IF EXISTS "Authenticated can manage contracts" ON public.contracts;
DROP POLICY IF EXISTS "Authenticated full access to contracts" ON public.contracts;
CREATE POLICY "Workspace members can manage contracts"
ON public.contracts
FOR ALL
TO authenticated
USING (public.is_workspace_member(workspace_id))
WITH CHECK (public.is_workspace_member(workspace_id));

DROP POLICY IF EXISTS "Admins can manage leads" ON public.contact_submissions;
DROP POLICY IF EXISTS "Authenticated manage contact_submissions" ON public.contact_submissions;
DROP POLICY IF EXISTS "Authenticated full access to contact_submissions" ON public.contact_submissions;
CREATE POLICY "Workspace members can manage contact submissions"
ON public.contact_submissions
FOR ALL
TO authenticated
USING (public.is_workspace_member(workspace_id))
WITH CHECK (public.is_workspace_member(workspace_id));

DROP POLICY IF EXISTS "Authenticated users can manage lead activities" ON public.lead_activities;
DROP POLICY IF EXISTS "Admins can manage lead activities" ON public.lead_activities;
DROP POLICY IF EXISTS "Authenticated manage lead_activities" ON public.lead_activities;
DROP POLICY IF EXISTS "Authenticated full access to lead_activities" ON public.lead_activities;
CREATE POLICY "Workspace members can manage lead activities"
ON public.lead_activities
FOR ALL
TO authenticated
USING (public.can_access_lead(lead_id))
WITH CHECK (public.can_access_lead(lead_id));

DROP POLICY IF EXISTS "Authenticated manage project_tasks" ON public.project_tasks;
DROP POLICY IF EXISTS "Authenticated full access to project_tasks" ON public.project_tasks;
CREATE POLICY "Workspace members can manage project tasks"
ON public.project_tasks
FOR ALL
TO authenticated
USING (public.can_access_project(project_id))
WITH CHECK (public.can_access_project(project_id));

DROP POLICY IF EXISTS "Enable read for authenticated users" ON public.project_time_logs;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.project_time_logs;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON public.project_time_logs;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON public.project_time_logs;
DROP POLICY IF EXISTS "Authenticated manage project_time_logs" ON public.project_time_logs;
DROP POLICY IF EXISTS "Authenticated full access to project_time_logs" ON public.project_time_logs;
CREATE POLICY "Workspace members can manage project time logs"
ON public.project_time_logs
FOR ALL
TO authenticated
USING (public.can_access_project(project_id))
WITH CHECK (public.can_access_project(project_id));

DROP POLICY IF EXISTS "Enable read for authenticated users" ON public.project_expenses;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.project_expenses;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON public.project_expenses;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON public.project_expenses;
DROP POLICY IF EXISTS "Authenticated manage project_expenses" ON public.project_expenses;
DROP POLICY IF EXISTS "Authenticated full access to project_expenses" ON public.project_expenses;
CREATE POLICY "Workspace members can manage project expenses"
ON public.project_expenses
FOR ALL
TO authenticated
USING (public.can_access_project(project_id))
WITH CHECK (public.can_access_project(project_id));

DROP POLICY IF EXISTS "Full access for authenticated users" ON public.project_deliverables;
DROP POLICY IF EXISTS "Authenticated manage project_deliverables" ON public.project_deliverables;
DROP POLICY IF EXISTS "Authenticated full access to project_deliverables" ON public.project_deliverables;
CREATE POLICY "Workspace members can manage project deliverables"
ON public.project_deliverables
FOR ALL
TO authenticated
USING (public.can_access_project(project_id))
WITH CHECK (public.can_access_project(project_id));

-- If the optional deliverable_items table exists, remove broad internal access.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_tables
    WHERE schemaname = 'public' AND tablename = 'deliverable_items'
  ) THEN
    EXECUTE 'DROP POLICY IF EXISTS "Authenticated manage deliverable_items" ON public.deliverable_items';
    EXECUTE 'DROP POLICY IF EXISTS "Authenticated full access to deliverable_items" ON public.deliverable_items';
  END IF;
END $$;

-- Employee costs should never be globally readable/writable by all authenticated users.
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON public.employee_costs;
CREATE POLICY "Users can manage own employee costs"
ON public.employee_costs
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Re-scope the alerts RPC to the caller workspace and revoke anonymous execution.
CREATE OR REPLACE FUNCTION public.get_leads_needing_attention()
RETURNS TABLE(id uuid, name text, days_inactive int)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    cs.id,
    cs.name,
    EXTRACT(DAY FROM now() - COALESCE(
      (SELECT MAX(la.created_at) FROM public.lead_activities la WHERE la.lead_id = cs.id),
      cs.created_at
    ))::int AS days_inactive
  FROM public.contact_submissions cs
  WHERE public.is_workspace_member(cs.workspace_id)
    AND cs.pipeline_status NOT IN ('cerrado', 'perdido')
    AND (
      EXTRACT(DAY FROM now() - COALESCE(
        (SELECT MAX(la.created_at) FROM public.lead_activities la WHERE la.lead_id = cs.id),
        cs.created_at
      )) >= 3
      OR cs.next_action_date < now()
    )
  ORDER BY days_inactive DESC;
END;
$$;

REVOKE ALL ON FUNCTION public.get_leads_needing_attention() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_leads_needing_attention() TO authenticated;

-- Lock profitability RPC to callers who belong to the project workspace.
CREATE OR REPLACE FUNCTION public.calculate_project_profitability(target_project_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  project_workspace_id uuid;
  total_rev decimal(12,2) := 0;
  time_cost decimal(12,2) := 0;
  direct_exp decimal(12,2) := 0;
  tot_cost decimal(12,2) := 0;
  gross_marg decimal(12,2) := 0;
  marg_pct decimal(5,2) := 0;
BEGIN
  SELECT p.workspace_id
  INTO project_workspace_id
  FROM public.projects p
  WHERE p.id = target_project_id;

  IF project_workspace_id IS NULL THEN
    RAISE EXCEPTION 'Project not found';
  END IF;

  IF NOT public.is_workspace_member(project_workspace_id) THEN
    RAISE EXCEPTION 'Insufficient privileges';
  END IF;

  SELECT COALESCE(SUM(c.total_price), 0)
  INTO total_rev
  FROM public.contracts c
  JOIN public.proposals p ON c.proposal_id = p.id
  WHERE p.created_project_id = target_project_id
    AND c.status NOT IN ('cancelled', 'draft');

  IF total_rev = 0 THEN
    SELECT COALESCE(budget, 0)
    INTO total_rev
    FROM public.projects
    WHERE id = target_project_id;
  END IF;

  SELECT COALESCE(SUM(
    tl.hours * COALESCE(ec.hourly_cost, 0)
  ), 0)
  INTO time_cost
  FROM public.project_time_logs tl
  LEFT JOIN public.employee_costs ec
    ON tl.user_id = ec.user_id
    AND DATE(tl.created_at) >= ec.valid_from
    AND DATE(tl.created_at) < COALESCE(ec.valid_to, 'infinity'::date)
  WHERE tl.project_id = target_project_id;

  SELECT COALESCE(SUM(amount), 0)
  INTO direct_exp
  FROM public.project_expenses
  WHERE project_id = target_project_id;

  tot_cost := time_cost + direct_exp;
  gross_marg := total_rev - tot_cost;

  IF total_rev > 0 THEN
    marg_pct := ROUND((gross_marg / total_rev) * 100, 2);
  ELSE
    marg_pct := 0;
  END IF;

  RETURN jsonb_build_object(
    'project_id', target_project_id,
    'total_revenue', total_rev,
    'time_cost', time_cost,
    'direct_expenses', direct_exp,
    'total_cost', tot_cost,
    'gross_margin', gross_marg,
    'margin_percentage', marg_pct
  );
END;
$$;

REVOKE ALL ON FUNCTION public.calculate_project_profitability(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.calculate_project_profitability(uuid) TO authenticated;
