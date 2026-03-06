-- ==========================================
-- AI PROFITABILITY: SUPABASE SCHEMA MIGRATION
-- ==========================================

-- 1. Employee Costs (Historical Rates)
CREATE TABLE IF NOT EXISTS public.employee_costs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    hourly_cost DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    valid_from DATE NOT NULL DEFAULT CURRENT_DATE,
    valid_to DATE, -- Null means current active rate
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Ensure project_time_logs has user_id
ALTER TABLE public.project_time_logs ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid();

-- RLS for employee_costs
ALTER TABLE public.employee_costs ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated access for simplicity in internal dashboard
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON public.employee_costs;
CREATE POLICY "Enable all access for authenticated users" ON public.employee_costs FOR ALL TO authenticated USING (true);

-- 2. Complex RPC: calculate_project_profitability
-- Returns aggregated financial data for a specific project
CREATE OR REPLACE FUNCTION calculate_project_profitability(target_project_id UUID)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    total_rev DECIMAL(12,2) := 0;
    time_cost DECIMAL(12,2) := 0;
    direct_exp DECIMAL(12,2) := 0;
    tot_cost DECIMAL(12,2) := 0;
    gross_marg DECIMAL(12,2) := 0;
    marg_pct DECIMAL(5,2) := 0;
BEGIN
    -- 1. Calculate Total Revenue from Contracts (Total price of non-cancelled contracts)
    SELECT COALESCE(SUM(c.total_price), 0)
    INTO total_rev
    FROM contracts c
    JOIN proposals p ON c.proposal_id = p.id
    WHERE p.created_project_id = target_project_id 
      AND c.status NOT IN ('cancelled', 'draft');

    -- Fallback: If no signed contracts are linked via proposal, use the project's set budget
    IF total_rev = 0 THEN
      SELECT COALESCE(budget, 0) INTO total_rev FROM projects WHERE id = target_project_id;
    END IF;

    -- 2. Calculate Time Cost (Hours * Historical Hourly Rate)
    -- Joins time_logs with employee_costs based on who logged it and WHEN they logged it.
    SELECT COALESCE(SUM(
        tl.hours * COALESCE(ec.hourly_cost, 0)
    ), 0)
    INTO time_cost
    FROM project_time_logs tl
    LEFT JOIN employee_costs ec 
      ON tl.user_id = ec.user_id
      AND DATE(tl.created_at) >= ec.valid_from 
      AND DATE(tl.created_at) < COALESCE(ec.valid_to, 'infinity'::date)
    WHERE tl.project_id = target_project_id;

    -- 3. Calculate Direct Expenses
    SELECT COALESCE(SUM(amount), 0)
    INTO direct_exp
    FROM project_expenses
    WHERE project_id = target_project_id;

    -- 4. Final Math
    tot_cost := time_cost + direct_exp;
    gross_marg := total_rev - tot_cost;

    IF total_rev > 0 THEN
        marg_pct := ROUND((gross_marg / total_rev) * 100, 2);
    ELSE
        marg_pct := 0;
    END IF;

    -- Return as JSON object for easy API consumption
    RETURN jsonb_build_object(
        'project_id', target_project_id,
        'total_revenue', total_rev,
        'time_cost', time_cost,
        'direct_expenses', direct_exp,
        'total_cost', tot_cost,
        'gross_margin', gross_marg,
        'margin_percentage', marg_pct
    );
END;
$$;
