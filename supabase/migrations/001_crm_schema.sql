-- ============================================
-- NOCTRA STUDIO CRM SCHEMA
-- Migration: 001_crm_schema.sql
-- ============================================

-- ============================================
-- 1. PROSPECTS (Leads)
-- ============================================
create table prospects (
  id uuid default uuid_generate_v4() primary key,

  -- Contact info
  email text unique not null,
  name text not null,
  company_name text,
  phone text,

  -- Lead tracking
  source text check (source in ('website', 'referral', 'linkedin', 'cold_outreach', 'other')) default 'website',
  status text check (status in ('new', 'contacted', 'qualified', 'proposal_sent', 'negotiating', 'won', 'lost')) not null default 'new',

  -- Notes and metadata
  notes text,
  tags text[] default '{}',

  -- When converted to client
  converted_to_profile_id uuid references profiles(id) on delete set null,
  converted_at timestamptz,

  -- Timestamps
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Index for faster lookups
create index prospects_email_idx on prospects(email);
create index prospects_status_idx on prospects(status);

-- ============================================
-- 2. PROPOSALS
-- ============================================
create table proposals (
  id uuid default uuid_generate_v4() primary key,
  prospect_id uuid references prospects(id) on delete cascade not null,

  -- Proposal info
  title text not null,
  description text,

  -- Status workflow
  status text check (status in ('draft', 'sent', 'viewed', 'accepted', 'rejected', 'expired')) not null default 'draft',

  -- Validity
  valid_until date,

  -- Pricing
  currency text default 'USD',
  subtotal numeric(12,2) default 0,
  discount_type text check (discount_type in ('percentage', 'fixed')) default 'percentage',
  discount_value numeric(12,2) default 0,
  tax_percentage numeric(5,2) default 0,
  total numeric(12,2) default 0,

  -- Payment terms
  payment_terms text, -- e.g., "50% upfront, 50% on delivery"
  estimated_duration text, -- e.g., "4-6 weeks"

  -- Public access (for /p/[uuid])
  public_uuid uuid default uuid_generate_v4() unique not null,

  -- Tracking
  sent_at timestamptz,
  viewed_at timestamptz,
  accepted_at timestamptz,
  rejected_at timestamptz,

  -- Project creation reference
  created_project_id uuid references projects(id) on delete set null,

  -- Timestamps
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Index for public access
create index proposals_public_uuid_idx on proposals(public_uuid);
create index proposals_status_idx on proposals(status);

-- ============================================
-- 3. PROPOSAL ITEMS (Line items / Services)
-- ============================================
create table proposal_items (
  id uuid default uuid_generate_v4() primary key,
  proposal_id uuid references proposals(id) on delete cascade not null,

  -- Service details
  name text not null,
  description text,

  -- Pricing
  quantity integer default 1,
  unit_price numeric(12,2) not null,
  total numeric(12,2) generated always as (quantity * unit_price) stored,

  -- Optional categorization
  category text, -- e.g., "Design", "Development", "Marketing"

  -- Ordering
  sort_order integer default 0,

  -- Timestamps
  created_at timestamptz default now()
);

create index proposal_items_proposal_id_idx on proposal_items(proposal_id);

-- ============================================
-- 4. PROPOSAL SIGNATURES
-- ============================================
create table proposal_signatures (
  id uuid default uuid_generate_v4() primary key,
  proposal_id uuid references proposals(id) on delete cascade unique not null,

  -- Signer info
  signer_name text not null,
  signer_email text not null,
  signer_title text, -- e.g., "CEO", "Marketing Director"

  -- Signature data (base64 encoded image or typed name)
  signature_type text check (signature_type in ('drawn', 'typed')) not null default 'drawn',
  signature_data text not null, -- base64 for drawn, plain text for typed

  -- Legal audit trail
  ip_address inet,
  user_agent text,

  -- Acceptance
  terms_accepted boolean default false,
  signed_at timestamptz default now()
);

create index proposal_signatures_proposal_id_idx on proposal_signatures(proposal_id);

-- ============================================
-- 5. PROPOSAL ACTIVITY LOG (Audit trail)
-- ============================================
create table proposal_activities (
  id uuid default uuid_generate_v4() primary key,
  proposal_id uuid references proposals(id) on delete cascade not null,

  -- Activity details
  action text check (action in (
    'created', 'updated', 'sent', 'viewed', 'downloaded',
    'signed', 'accepted', 'rejected', 'expired', 'comment'
  )) not null,

  -- Who performed the action (null for prospect actions)
  performed_by uuid references profiles(id) on delete set null,

  -- Additional context
  metadata jsonb default '{}',
  ip_address inet,

  -- Timestamp
  created_at timestamptz default now()
);

create index proposal_activities_proposal_id_idx on proposal_activities(proposal_id);

-- ============================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================
alter table prospects enable row level security;
alter table proposals enable row level security;
alter table proposal_items enable row level security;
alter table proposal_signatures enable row level security;
alter table proposal_activities enable row level security;

-- ============================================
-- RLS POLICIES
-- ============================================

-- PROSPECTS
-- Only admins can manage prospects
create policy "Admins can manage prospects" on prospects
  for all using (auth.uid() in (select id from profiles where role = 'admin'));

-- PROPOSALS
-- Admins can manage all proposals
create policy "Admins can manage proposals" on proposals
  for all using (auth.uid() in (select id from profiles where role = 'admin'));

-- Public can view proposals by public_uuid (handled via service role in API)
-- No policy needed - we'll use service role for public access

-- PROPOSAL ITEMS
-- Admins can manage all items
create policy "Admins can manage proposal_items" on proposal_items
  for all using (
    proposal_id in (
      select id from proposals
      where auth.uid() in (select id from profiles where role = 'admin')
    )
  );

-- PROPOSAL SIGNATURES
-- Admins can view signatures
create policy "Admins can view signatures" on proposal_signatures
  for select using (auth.uid() in (select id from profiles where role = 'admin'));

-- Public can insert signatures (handled via service role in API)

-- PROPOSAL ACTIVITIES
-- Admins can view all activities
create policy "Admins can view activities" on proposal_activities
  for select using (auth.uid() in (select id from profiles where role = 'admin'));

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to update proposal totals when items change
create or replace function update_proposal_totals()
returns trigger as $$
declare
  v_subtotal numeric(12,2);
  v_discount numeric(12,2);
  v_total numeric(12,2);
  v_proposal proposals%rowtype;
begin
  -- Get current proposal
  select * into v_proposal from proposals where id = coalesce(new.proposal_id, old.proposal_id);

  -- Calculate subtotal
  select coalesce(sum(total), 0) into v_subtotal
  from proposal_items
  where proposal_id = v_proposal.id;

  -- Calculate discount
  if v_proposal.discount_type = 'percentage' then
    v_discount := v_subtotal * (v_proposal.discount_value / 100);
  else
    v_discount := v_proposal.discount_value;
  end if;

  -- Calculate total with tax
  v_total := (v_subtotal - v_discount) * (1 + v_proposal.tax_percentage / 100);

  -- Update proposal
  update proposals
  set subtotal = v_subtotal,
      total = v_total,
      updated_at = now()
  where id = v_proposal.id;

  return coalesce(new, old);
end;
$$ language plpgsql security definer;

-- Trigger for auto-updating totals
create trigger update_proposal_totals_on_item_change
  after insert or update or delete on proposal_items
  for each row execute function update_proposal_totals();

-- Function to update updated_at timestamp
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Triggers for updated_at
create trigger update_prospects_updated_at
  before update on prospects
  for each row execute function update_updated_at();

create trigger update_proposals_updated_at
  before update on proposals
  for each row execute function update_updated_at();

-- ============================================
-- FUNCTION: Convert prospect to client
-- Called when proposal is signed/accepted
-- ============================================
create or replace function convert_prospect_to_client(
  p_proposal_id uuid,
  p_signature_id uuid
)
returns jsonb as $$
declare
  v_proposal proposals%rowtype;
  v_prospect prospects%rowtype;
  v_signature proposal_signatures%rowtype;
  v_user_id uuid;
  v_project_id uuid;
  v_temp_password text;
begin
  -- Get proposal
  select * into v_proposal from proposals where id = p_proposal_id;
  if not found then
    return jsonb_build_object('success', false, 'error', 'Proposal not found');
  end if;

  -- Get prospect
  select * into v_prospect from prospects where id = v_proposal.prospect_id;
  if not found then
    return jsonb_build_object('success', false, 'error', 'Prospect not found');
  end if;

  -- Get signature
  select * into v_signature from proposal_signatures where id = p_signature_id;
  if not found then
    return jsonb_build_object('success', false, 'error', 'Signature not found');
  end if;

  -- Check if prospect already converted
  if v_prospect.converted_to_profile_id is not null then
    return jsonb_build_object(
      'success', false,
      'error', 'Prospect already converted',
      'profile_id', v_prospect.converted_to_profile_id
    );
  end if;

  -- Generate temp password (will be overwritten by invite link)
  v_temp_password := encode(gen_random_bytes(16), 'hex');

  -- Note: User creation should be done via Supabase Admin API in the application
  -- This function prepares the data and creates profile/project after user is created

  -- Create project for the new client (profile will be created by trigger on auth.users)
  insert into projects (client_id, name, status)
  values (
    v_prospect.converted_to_profile_id, -- Will be set after user creation
    v_proposal.title,
    'discovery'
  )
  returning id into v_project_id;

  -- Update proposal with created project reference
  update proposals
  set status = 'accepted',
      accepted_at = now(),
      created_project_id = v_project_id,
      updated_at = now()
  where id = p_proposal_id;

  -- Update prospect as converted
  update prospects
  set status = 'won',
      converted_at = now(),
      updated_at = now()
  where id = v_prospect.id;

  -- Log activity
  insert into proposal_activities (proposal_id, action, metadata)
  values (p_proposal_id, 'accepted', jsonb_build_object(
    'signature_id', p_signature_id,
    'project_id', v_project_id
  ));

  return jsonb_build_object(
    'success', true,
    'project_id', v_project_id,
    'prospect_email', v_prospect.email,
    'prospect_name', v_prospect.name
  );
end;
$$ language plpgsql security definer;

-- ============================================
-- COMMENTS (Documentation)
-- ============================================
comment on table prospects is 'CRM leads/prospects before they become clients';
comment on table proposals is 'Proposals sent to prospects with pricing and terms';
comment on table proposal_items is 'Line items (services) included in a proposal';
comment on table proposal_signatures is 'E-signatures when prospects accept proposals';
comment on table proposal_activities is 'Audit log of all proposal-related activities';

comment on column proposals.public_uuid is 'UUID used for public portal access at /p/[uuid]';
comment on column proposals.created_project_id is 'Reference to project created when proposal is accepted';
comment on column prospects.converted_to_profile_id is 'Reference to profile when prospect becomes client';
