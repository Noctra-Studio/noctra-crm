-- ============================================
-- CONTRACTS REFINEMENTS
-- Migration: 007_contracts_refinements.sql
-- ============================================

-- 1. Add 'viewed' to status constraint
ALTER TABLE contracts DROP CONSTRAINT IF EXISTS contracts_status_check;
ALTER TABLE contracts ADD CONSTRAINT contracts_status_check CHECK (status IN ('draft', 'sent', 'viewed', 'signed', 'cancelled'));

-- 2. Add service_type to contracts
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS service_type text;
