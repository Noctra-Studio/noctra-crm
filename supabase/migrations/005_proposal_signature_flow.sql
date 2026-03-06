-- ============================================
-- PROPOSAL SIGNATURE FLOW ENHANCEMENTS
-- Migration: 005_proposal_signature_flow.sql
-- ============================================

-- 1. Rename public_uuid to client_token to match user request
ALTER TABLE proposals RENAME COLUMN public_uuid TO client_token;

-- 2. Add tracking and content columns
ALTER TABLE proposals 
ADD COLUMN view_count integer DEFAULT 0,
ADD COLUMN problem_statement text,
ADD COLUMN proposed_solution text;

-- 3. Add signature columns for unified flow
ALTER TABLE proposals
ADD COLUMN signed boolean DEFAULT false,
ADD COLUMN signed_at timestamptz,
ADD COLUMN signed_name text,
ADD COLUMN signature_data text, -- base64 image
ADD COLUMN signature_ip inet,
ADD COLUMN signature_hash text;

-- 4. Update status check to include potentially missing states
-- First, drop the existing constraint if it exists (it's named proposals_status_check in some setups, but we should find it)
-- Based on 001_crm_schema.sql it's an inline check. We'll just update it.
ALTER TABLE proposals DROP CONSTRAINT IF EXISTS proposals_status_check;
ALTER TABLE proposals ADD CONSTRAINT proposals_status_check 
CHECK (status in ('draft', 'sent', 'viewed', 'accepted', 'rejected', 'expired'));

-- 5. Comments for clarity
COMMENT ON COLUMN proposals.client_token IS 'Secure token for public access to the proposal';
COMMENT ON COLUMN proposals.signature_hash IS 'Audit trail hash: SHA-256(proposal_id + client_name + signature_base64 + timestamp)';
