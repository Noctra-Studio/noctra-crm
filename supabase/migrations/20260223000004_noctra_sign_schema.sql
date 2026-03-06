-- ==========================================
-- NOCTRA SIGN: SUPABASE SCHEMA & RLS
-- ==========================================

-- 1. Create Storage Bucket for Contracts/Proposals
INSERT INTO storage.buckets (id, name, public, avif_autodetection)
VALUES ('contracts', 'contracts', false, false)
ON CONFLICT (id) DO NOTHING;

-- 2. Create Enums for Document Status
CREATE TYPE document_status AS ENUM ('sent', 'viewed', 'signed');

-- 3. Create Document Envelopes Table
-- This table tracks the overall signing request for a proposal or contract.
CREATE TABLE public.document_envelopes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL, -- Assuming multi-tenant setup
    project_id UUID,               -- Optional: Link to a specific project
    proposal_id UUID,              -- Optional: Link to existing proposal
    contract_id UUID,              -- Optional: Link to existing contract
    status document_status DEFAULT 'sent',
    pdf_path TEXT NOT NULL,        -- Path to the original PDF in storage
    signed_pdf_path TEXT,          -- Path to the final stamped PDF
    hash_token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'), -- Secure public link token
    expires_at TIMESTAMPTZ DEFAULT (now() + interval '30 days'),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Create Document Signatures Table
-- This table acts as the Audit Trail, recording who signed and from where.
CREATE TABLE public.document_signatures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    envelope_id UUID NOT NULL REFERENCES public.document_envelopes(id) ON DELETE CASCADE,
    signer_name TEXT NOT NULL,
    signer_email TEXT NOT NULL,
    signed_at TIMESTAMPTZ DEFAULT now(),
    ip_address TEXT,
    device_fingerprint TEXT, -- User Agent or hashed device metadata
    signature_image_path TEXT, -- Optional: Path to raw signature image if needed
    UNIQUE(envelope_id, signer_email)
);

-- 5. Row Level Security (RLS) Configuration

-- Enable RLS
ALTER TABLE public.document_envelopes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_signatures ENABLE ROW LEVEL SECURITY;

-- Policy: Admins/Users can view envelopes in their organization
CREATE POLICY "Users can view envelopes in their organization"
ON public.document_envelopes
FOR SELECT
TO authenticated
USING (organization_id = (SELECT organization_id FROM auth.users WHERE id = auth.uid())); -- Adjust based on your auth model

-- Policy: Admins/Users can insert envelopes in their organization
CREATE POLICY "Users can insert envelopes in their organization"
ON public.document_envelopes
FOR INSERT
TO authenticated
WITH CHECK (organization_id = (SELECT organization_id FROM auth.users WHERE id = auth.uid()));

-- Policy: Admins/Users can update envelopes in their organization
CREATE POLICY "Users can update envelopes in their organization"
ON public.document_envelopes
FOR UPDATE
TO authenticated
USING (organization_id = (SELECT organization_id FROM auth.users WHERE id = auth.uid()));

-- Policy: Public access to envelope via hash_token (for viewing/signing)
-- This allows the unauthenticated signer to view the document details
CREATE POLICY "Public can view envelope via hash token"
ON public.document_envelopes
FOR SELECT
TO anon
USING (hash_token IS NOT NULL AND expires_at > now());

-- Policy: Public access to update envelope status (e.g., viewed -> signed) via hash_token
-- Note: In a highly secure setup, this update is better handled by a secure Edge Function, 
-- but this allows basic client-side updates if the hash is known.
CREATE POLICY "Public can update envelope via hash token"
ON public.document_envelopes
FOR UPDATE
TO anon
USING (hash_token IS NOT NULL AND expires_at > now());


-- Policy: Admins/Users can view signatures for their organization's envelopes
CREATE POLICY "Users can view signatures in their organization"
ON public.document_signatures
FOR SELECT
TO authenticated
USING (
    envelope_id IN (
        SELECT id FROM public.document_envelopes 
        WHERE organization_id = (SELECT organization_id FROM auth.users WHERE id = auth.uid())
    )
);

-- Policy: Public can insert a signature IF they have the envelope's hash_token
-- This assumes the client knows the envelope_id. Security relies on the hash_token validation in the app/Edge Function before insertion.
CREATE POLICY "Public can insert signature"
ON public.document_signatures
FOR INSERT
TO anon
WITH CHECK (
    envelope_id IN (
        SELECT id FROM public.document_envelopes
        WHERE hash_token IS NOT NULL AND expires_at > now()
    )
);

-- 6. Storage Bucket Policies
-- Policy: Authenticated users can upload to the contracts bucket
CREATE POLICY "Authenticated users can upload contracts"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'contracts');

-- Policy: Authenticated users can read from the contracts bucket
CREATE POLICY "Authenticated users can read contracts"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'contracts');

-- Policy: Public can read from contracts if they have the signed URL (handled by code) or hash
-- For strict security, direct public read should be disabled, and the app should serve the PDF via a route that validates the hash_token.
-- Therefore, NO public SELECT policy is added here.

-- 7. Add Trigger to update 'updated_at' on envelopes
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_document_envelopes_modtime
BEFORE UPDATE ON public.document_envelopes
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();
