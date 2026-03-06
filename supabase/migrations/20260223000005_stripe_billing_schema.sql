-- Migration for Stripe Billing Integration

-- 1. Extend the workspaces table
ALTER TABLE public.workspaces 
  ADD COLUMN IF NOT EXISTS ai_credits_balance integer DEFAULT 1000 NOT NULL,
  ADD COLUMN IF NOT EXISTS is_ai_unlimited boolean DEFAULT false NOT NULL,
  ADD COLUMN IF NOT EXISTS tier text DEFAULT 'standard' NOT NULL;

-- 2. Create the customers table (Stripe Mapping)
CREATE TABLE IF NOT EXISTS public.customers (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  stripe_customer_id text UNIQUE NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for customers table
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- Create policy for customers
CREATE POLICY "Users can view customers for their workspaces" ON public.customers
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.workspace_members wu 
            WHERE wu.workspace_id = customers.workspace_id 
            AND wu.user_id = auth.uid()
        )
    );

-- 3. Create the subscriptions table
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id text PRIMARY KEY, -- Maps to stripe_subscription_id
  workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  status text NOT NULL, -- e.g., 'active', 'canceled', 'past_due'
  price_id text NOT NULL,
  quantity integer DEFAULT 1 NOT NULL,
  cancel_at_period_end boolean DEFAULT false NOT NULL,
  current_period_start timestamp with time zone NOT NULL,
  current_period_end timestamp with time zone NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for subscriptions table
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Create policy for subscriptions
CREATE POLICY "Users can view subscriptions for their workspaces" ON public.subscriptions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.workspace_members wu 
            WHERE wu.workspace_id = subscriptions.workspace_id 
            AND wu.user_id = auth.uid()
        )
    );

-- Function to handle incrementing tokens safely
CREATE OR REPLACE FUNCTION public.increment_workspace_tokens(
  workspacecode uuid,
  amount integer
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.workspaces
  SET ai_credits_balance = ai_credits_balance + amount,
      updated_at = now()
  WHERE id = workspacecode;
END;
$$;
