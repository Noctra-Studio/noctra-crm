-- Create table for storing quiz submissions
create table if not exists public.quiz_submissions (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text,
  email text,
  phone text,
  company text,
  service_id text, -- 'professional', 'ecommerce', 'custom', 'optimization'
  score integer,
  answers jsonb,   -- Full dump of quiz answers for analytics
  status text default 'new' -- 'new', 'contacted', 'closed'
);

-- Enable RLS
alter table public.quiz_submissions enable row level security;

-- Create policy to allow inserting rows (public/anon submission)
create policy "Enable insert for everyone" 
on public.quiz_submissions 
for insert 
to anon, authenticated 
with check (true);

-- Create policy to allow viewing only by authenticated users (admins)
create policy "Enable select for authenticated users only" 
on public.quiz_submissions 
for select 
to authenticated 
using (true);
