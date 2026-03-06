-- ============================================
-- NOCTRA STUDIO CRM ALERTS RPC
-- Migration: 003_alerts_rpc.sql
-- ============================================

CREATE OR REPLACE FUNCTION get_leads_needing_attention()
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

COMMENT ON FUNCTION get_leads_needing_attention() IS 'Returns leads with no activity in >=3 days or with overdue next actions';
