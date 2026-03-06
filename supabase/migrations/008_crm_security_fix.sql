-- ============================================
-- CRM SECURITY & RPC REPAIR
-- Migration: 008_crm_security_fix.sql
-- ============================================

-- 1. Helper function for non-recursive admin check
-- SECURITY DEFINER bypasses RLS on the profiles table
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Repair Profiles RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- 3. Repair Proposals RLS
ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can manage proposals" ON public.proposals;
CREATE POLICY "Admins can manage proposals" ON public.proposals
  FOR ALL USING (public.is_admin());

-- 4. Repair Contracts RLS
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can manage contracts" ON public.contracts;
CREATE POLICY "Admins can manage contracts" ON public.contracts
  FOR ALL USING (public.is_admin());

-- 5. Repair Contact Submissions (Leads) RLS
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can manage leads" ON public.contact_submissions;
DROP POLICY IF EXISTS "Authenticated users can manage lead activities" ON public.lead_activities;

CREATE POLICY "Admins can manage leads" ON public.contact_submissions
  FOR ALL USING (public.is_admin());

CREATE POLICY "Admins can manage lead activities" ON public.lead_activities
  FOR ALL USING (public.is_admin());

-- Allow public inserts for the landing page form
DROP POLICY IF EXISTS "Public can submit contact form" ON public.contact_submissions;
CREATE POLICY "Public can submit contact form" ON public.contact_submissions
  FOR INSERT WITH CHECK (true);

-- 6. Repair Proposal Sub-tables
-- Proposal Items
ALTER TABLE public.proposal_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can manage proposal_items" ON public.proposal_items;
CREATE POLICY "Admins can manage proposal_items" ON public.proposal_items
  FOR ALL USING (public.is_admin());

-- Proposal Signatures
ALTER TABLE public.proposal_signatures ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can view signatures" ON public.proposal_signatures;
CREATE POLICY "Admins can view signatures" ON public.proposal_signatures
  FOR SELECT USING (public.is_admin());

-- Proposal Activities
ALTER TABLE public.proposal_activities ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can view activities" ON public.proposal_activities;
CREATE POLICY "Admins can view activities" ON public.proposal_activities
  FOR SELECT USING (public.is_admin());

-- 7. Repair Projects module (Recursive fixed)
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can all projects" ON public.projects;
CREATE POLICY "Admins can all projects" ON public.projects
  FOR ALL USING (public.is_admin());

ALTER TABLE public.deliverables ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can all deliverables" ON public.deliverables;
CREATE POLICY "Admins can all deliverables" ON public.deliverables
  FOR ALL USING (public.is_admin());

ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can all tickets" ON public.tickets;
CREATE POLICY "Admins can all tickets" ON public.tickets
  FOR ALL USING (public.is_admin());

-- 8. Re-deploy RPC with explicit permissions
-- Grant execution to authenticated users (admins)
CREATE OR REPLACE FUNCTION public.get_leads_needing_attention()
RETURNS TABLE(id uuid, name text, days_inactive int) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cs.id,
    cs.name,
    EXTRACT(DAY FROM now() - COALESCE(
      (SELECT MAX(created_at) FROM lead_activities WHERE lead_id = cs.id),
      cs.created_at
    ))::int as days_inactive
  FROM contact_submissions cs
  WHERE cs.pipeline_status NOT IN ('cerrado', 'perdido')
  AND (
    EXTRACT(DAY FROM now() - COALESCE(
      (SELECT MAX(created_at) FROM lead_activities WHERE lead_id = cs.id),
      cs.created_at
    )) >= 3
    OR cs.next_action_date < now()
  )
  ORDER BY days_inactive DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.get_leads_needing_attention() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_leads_needing_attention() TO anon; -- Allow for consistency check, but usually just authenticated

-- 7. Helper for request_id generation if missing
CREATE OR REPLACE FUNCTION public.get_next_request_id()
RETURNS bigint AS $$
BEGIN
  -- Create sequence if it doesn't exist (safety)
  CREATE SEQUENCE IF NOT EXISTS contact_request_id_seq START 1;
  RETURN nextval('contact_request_id_seq');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.get_next_request_id() TO anon, authenticated;
