-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. PROFILES (Users)
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  role text check (role in ('admin', 'client')) not null default 'client',
  company_name text,
  created_at timestamptz default now()
);

-- 2. PROJECTS (The Contract)
create table projects (
  id uuid default uuid_generate_v4() primary key,
  client_id uuid references profiles(id) on delete cascade not null,
  name text not null,
  status text check (status in ('discovery', 'build', 'launch')) not null default 'discovery',
  staging_url text,
  created_at timestamptz default now()
);

-- 3. DELIVERABLES (The Items to Review)
create table deliverables (
  id uuid default uuid_generate_v4() primary key,
  project_id uuid references projects(id) on delete cascade not null,
  title text not null,
  url text not null,
  status text check (status in ('pending_review', 'approved', 'changes_requested')) not null default 'pending_review',
  submitted_at timestamptz default now(),
  approved_at timestamptz
);

-- 4. TICKETS (The Feedback Loop)
create table tickets (
  id uuid default uuid_generate_v4() primary key,
  project_id uuid references projects(id) on delete cascade not null,
  deliverable_id uuid references deliverables(id) on delete set null,
  title text not null,
  description text,
  priority text check (priority in ('low', 'medium', 'high')) not null default 'medium',
  status text check (status in ('open', 'in_progress', 'resolved')) not null default 'open',
  assignee_id uuid references profiles(id), -- Defaults to Admin
  eta timestamptz,
  created_at timestamptz default now()
);

-- Enable Row Level Security
alter table profiles enable row level security;
alter table projects enable row level security;
alter table deliverables enable row level security;
alter table tickets enable row level security;

-- POLICIES

-- PROFILES
-- Admins can view all profiles
create policy "Admins can view all profiles" on profiles
  for select using (auth.uid() in (select id from profiles where role = 'admin'));

-- Users can view their own profile
create policy "Users can view own profile" on profiles
  for select using (auth.uid() = id);

-- PROJECTS
-- Admins can do everything
create policy "Admins can all projects" on projects
  for all using (auth.uid() in (select id from profiles where role = 'admin'));

-- Clients can view their own projects
create policy "Clients can view own projects" on projects
  for select using (client_id = auth.uid());

-- DELIVERABLES
-- Admins can do everything
create policy "Admins can all deliverables" on deliverables
  for all using (auth.uid() in (select id from profiles where role = 'admin'));

-- Clients can view deliverables for their projects
create policy "Clients can view own deliverables" on deliverables
  for select using (
    project_id in (select id from projects where client_id = auth.uid())
  );

-- Clients can update status of their deliverables
create policy "Clients can update own deliverables" on deliverables
  for update using (
    project_id in (select id from projects where client_id = auth.uid())
  );

-- TICKETS
-- Admins can do everything
create policy "Admins can all tickets" on tickets
  for all using (auth.uid() in (select id from profiles where role = 'admin'));

-- Clients can view tickets for their projects
create policy "Clients can view own tickets" on tickets
  for select using (
    project_id in (select id from projects where client_id = auth.uid())
  );

-- Clients can create tickets for their projects
create policy "Clients can create tickets" on tickets
  for insert with check (
    project_id in (select id from projects where client_id = auth.uid())
  );
