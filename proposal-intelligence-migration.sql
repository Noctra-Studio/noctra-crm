-- ============================================================
-- Noctra CRM – Proposal Intelligence migration
-- Run this in the Supabase SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS proposal_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  proposal_id UUID REFERENCES proposals(id) ON DELETE CASCADE,
  event_type TEXT CHECK (event_type IN ('view', 'heartbeat', 'scroll', 'click')),
  metadata JSONB DEFAULT '{}'::jsonB,
  visitor_id TEXT, -- Anonymous ID to distinguish sessions
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Index for analytics queries
CREATE INDEX IF NOT EXISTS proposal_events_proposal_id_idx ON proposal_events (proposal_id);
CREATE INDEX IF NOT EXISTS proposal_events_created_at_idx ON proposal_events (created_at);

-- RLS: Enable row-level security
ALTER TABLE proposal_events ENABLE ROW LEVEL SECURITY;

-- Policy: Only workspace members can view events for their proposals
CREATE POLICY "workspace_members_view_proposal_events" ON proposal_events
  FOR SELECT
  USING (
    proposal_id IN (
      SELECT p.id FROM proposals p
      JOIN workspace_members wm ON wm.workspace_id = p.workspace_id
      WHERE wm.user_id = auth.uid()
    )
  );

-- Policy: Public can insert events (needed for tracking)
-- We use a limited policy to only allow inserts
CREATE POLICY "public_track_proposal_events" ON proposal_events
  FOR INSERT
  WITH CHECK (true);
