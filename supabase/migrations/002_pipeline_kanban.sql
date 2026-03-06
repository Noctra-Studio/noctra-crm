-- ============================================
-- NOCTRA STUDIO CRM PIPELINE SCHEMA
-- Migration: 002_pipeline_kanban.sql
-- ============================================

-- 1. Update contact_submissions with pipeline columns
ALTER TABLE contact_submissions
ADD COLUMN IF NOT EXISTS pipeline_status text DEFAULT 'nuevo',
ADD COLUMN IF NOT EXISTS estimated_value numeric,
ADD COLUMN IF NOT EXISTS lost_reason text,
ADD COLUMN IF NOT EXISTS next_action text,
ADD COLUMN IF NOT EXISTS next_action_date timestamptz,
ADD COLUMN IF NOT EXISTS closed_at timestamptz;

-- 2. Create lead_activities for interaction history
CREATE TABLE IF NOT EXISTS lead_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid REFERENCES contact_submissions(id) ON DELETE CASCADE,
  type text CHECK (type IN ('note', 'call', 'email', 'meeting', 'status_change')),
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE lead_activities ENABLE ROW LEVEL SECURITY;

-- Security Policies
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'lead_activities' AND policyname = 'Authenticated users can manage lead activities'
    ) THEN
        CREATE POLICY "Authenticated users can manage lead activities"
        ON lead_activities FOR ALL
        USING (auth.role() = 'authenticated');
    END IF;
END
$$;

-- Index for faster activity lookups
CREATE INDEX IF NOT EXISTS lead_activities_lead_id_idx ON lead_activities(lead_id);

-- Documentation
COMMENT ON COLUMN contact_submissions.pipeline_status IS 'Current funnel stage: nuevo, contactado, propuesta_enviada, en_negociacion, cerrado, perdido';
COMMENT ON COLUMN contact_submissions.estimated_value IS 'Estimated project budget in MXN';
COMMENT ON COLUMN contact_submissions.lost_reason IS 'Reason if lead status is changed to perdido';
COMMENT ON TABLE lead_activities IS 'Audit trail and manual notes for sales lead progression';
