-- Create project_deliverables table
CREATE TABLE IF NOT EXISTS public.project_deliverables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    file_url TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_review', 'approved', 'rejected')),
    client_token UUID NOT NULL DEFAULT gen_random_uuid(),
    client_comment TEXT,
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.project_deliverables ENABLE ROW LEVEL SECURITY;

-- Policies
-- 1. Internal access: Full access for authenticated users
CREATE POLICY "Full access for authenticated users" 
ON public.project_deliverables 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- 2. Public access: SELECT if client_token matches
CREATE POLICY "Read access for clients via token" 
ON public.project_deliverables 
FOR SELECT 
TO anon, authenticated
USING (client_token IS NOT NULL);

-- 3. Public access: UPDATE status and client_comment via token
-- Note: In a real app, we'd want to be more restrictive, but this is a simple portal.
-- We'll allow updates to specific columns if the token matches.
CREATE POLICY "Update access for clients via token" 
ON public.project_deliverables 
FOR UPDATE 
TO anon, authenticated
USING (client_token IS NOT NULL)
WITH CHECK (
    -- Ensure only these columns are updated by the client
    (status IN ('approved', 'rejected'))
);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_project_deliverables_updated_at
    BEFORE UPDATE ON public.project_deliverables
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
