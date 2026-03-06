-- Profitability Additions

-- 1. Add fields to projects table
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS budget numeric(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS hourly_rate numeric(10, 2) DEFAULT 800,
ADD COLUMN IF NOT EXISTS total_hours numeric(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_expenses numeric(10, 2) DEFAULT 0;

-- 2. Create project_time_logs table
CREATE TABLE IF NOT EXISTS public.project_time_logs (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE,
    description text NOT NULL,
    hours numeric(10, 2) NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create project_expenses table
CREATE TABLE IF NOT EXISTS public.project_expenses (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE,
    concept text NOT NULL,
    amount numeric(10, 2) NOT NULL,
    expense_date date DEFAULT CURRENT_DATE,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS Policies for time logs
ALTER TABLE public.project_time_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read for authenticated users" ON public.project_time_logs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable insert for authenticated users" ON public.project_time_logs FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Enable update for authenticated users" ON public.project_time_logs FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Enable delete for authenticated users" ON public.project_time_logs FOR DELETE TO authenticated USING (true);

-- RLS Policies for expenses
ALTER TABLE public.project_expenses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read for authenticated users" ON public.project_expenses FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable insert for authenticated users" ON public.project_expenses FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Enable update for authenticated users" ON public.project_expenses FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Enable delete for authenticated users" ON public.project_expenses FOR DELETE TO authenticated USING (true);
