-- Migration: 004_proposals_numbering.sql
-- Add proposal_number column and automatic sequence

-- 1. Create a sequence for proposal numbers
CREATE SEQUENCE IF NOT EXISTS proposal_number_seq START 1;

-- 2. Add the column to proposals table
ALTER TABLE proposals 
ADD COLUMN IF NOT EXISTS proposal_number text UNIQUE;

-- 2.5 Re-point to contact_submissions instead of prospects
-- (Dropping original prospect_id and adding lead_id)
ALTER TABLE proposals DROP COLUMN IF EXISTS prospect_id;
ALTER TABLE proposals ADD COLUMN IF NOT EXISTS lead_id uuid REFERENCES contact_submissions(id) ON DELETE CASCADE;

-- 3. Function to generate the next proposal number
CREATE OR REPLACE FUNCTION get_next_proposal_number()
RETURNS text AS $$
DECLARE
    next_val int;
BEGIN
    SELECT nextval('proposal_number_seq') INTO next_val;
    RETURN 'NOC-P-' || LPAD(next_val::text, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- 4. Trigger to auto-assign proposal number on insert if not provided
CREATE OR REPLACE FUNCTION set_proposal_number()
RETURNS trigger AS $$
BEGIN
    IF NEW.proposal_number IS NULL THEN
        NEW.proposal_number := get_next_proposal_number();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_set_proposal_number ON proposals;
CREATE TRIGGER tr_set_proposal_number
    BEFORE INSERT ON proposals
    FOR EACH ROW
    EXECUTE FUNCTION set_proposal_number();

COMMENT ON COLUMN proposals.proposal_number IS 'Padded proposal number (e.g., NOC-P-0001)';
