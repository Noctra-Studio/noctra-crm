-- ============================================
-- NOCTRA STUDIO CONTRACTS SCHEMA
-- Migration: 006_contracts_schema.sql
-- ============================================

-- 1. Create a sequence for contract numbers
CREATE SEQUENCE IF NOT EXISTS contract_number_seq START 1;

-- 2. Create the contracts table
CREATE TABLE IF NOT EXISTS contracts (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  contract_number text UNIQUE,
  proposal_id uuid REFERENCES proposals(id) ON DELETE SET NULL,
  
  -- Client Info
  client_name text NOT NULL,
  client_email text NOT NULL,
  client_company text,
  client_rfc text,
  client_address text,
  
  -- Project Details
  total_price numeric(12,2) DEFAULT 0,
  payment_terms text,
  start_date date,
  estimated_weeks integer DEFAULT 1,
  items jsonb DEFAULT '[]', -- Array of {name, description}
  clauses jsonb DEFAULT '[]', -- Array of {id, name, text, included}
  
  -- Tracking & Status
  status text CHECK (status IN ('draft', 'sent', 'signed', 'cancelled')) NOT NULL DEFAULT 'draft',
  client_token uuid DEFAULT uuid_generate_v4() UNIQUE NOT NULL,
  
  -- Noctra Signature (Internal)
  noctra_signed boolean DEFAULT false,
  noctra_signed_at timestamptz,
  noctra_signature_data text, -- base64 image
  
  -- Client Signature (Public)
  signed_by_client boolean DEFAULT false,
  client_signed_at timestamptz,
  client_signature_data text, -- base64 image
  client_signature_ip inet,
  client_signature_hash text,
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 3. Function to generate the next contract number
CREATE OR REPLACE FUNCTION get_next_contract_number()
RETURNS text AS $$
DECLARE
    next_val int;
BEGIN
    SELECT nextval('contract_number_seq') INTO next_val;
    RETURN 'NOC-C-' || LPAD(next_val::text, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- 4. Trigger to auto-assign contract number
CREATE OR REPLACE FUNCTION set_contract_number()
RETURNS trigger AS $$
BEGIN
    IF NEW.contract_number IS NULL THEN
        NEW.contract_number := get_next_contract_number();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_set_contract_number ON contracts;
CREATE TRIGGER tr_set_contract_number
    BEFORE INSERT ON contracts
    FOR EACH ROW
    EXECUTE FUNCTION set_contract_number();

-- 5. RLS Policies
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;

-- Admins: Full access
DROP POLICY IF EXISTS "Admins can manage contracts" ON contracts;
CREATE POLICY "Admins can manage contracts" ON contracts
  FOR ALL USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));

-- Public: Select by token (handled in application logic with .eq('client_token', token))
DROP POLICY IF EXISTS "Public can view contracts via token" ON contracts;
CREATE POLICY "Public can view contracts via token" ON contracts
  FOR SELECT USING (true);

-- 6. Indexes
CREATE INDEX IF NOT EXISTS contracts_client_token_idx ON contracts(client_token);
CREATE INDEX IF NOT EXISTS contracts_status_idx ON contracts(status);
CREATE INDEX IF NOT EXISTS contracts_proposal_id_idx ON contracts(proposal_id);

COMMENT ON COLUMN contracts.contract_number IS 'Padded contract number (e.g., NOC-C-0001)';
COMMENT ON COLUMN contracts.items IS 'Deliverables and services included in the contract';
COMMENT ON COLUMN contracts.clauses IS 'Legal clauses with their toggle status and custom text';
