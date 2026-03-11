-- ============================================
-- CRM SPLIT: POSTFLIGHT VALIDATION
-- Run this on the NEW dedicated CRM Supabase project after schema + data import.
-- ============================================

-- 1. Confirm critical tables exist.
with expected_tables(table_name) as (
  values
    ('profiles'),
    ('workspaces'),
    ('workspace_members'),
    ('workspace_config'),
    ('contact_submissions'),
    ('lead_activities'),
    ('proposals'),
    ('proposal_items'),
    ('contracts'),
    ('projects'),
    ('project_tasks'),
    ('project_time_logs'),
    ('project_expenses'),
    ('project_deliverables'),
    ('customers'),
    ('subscriptions'),
    ('document_envelopes'),
    ('document_signatures')
)
select
  e.table_name,
  (to_regclass(format('public.%I', e.table_name)) is not null) as exists_in_db
from expected_tables e
order by e.table_name;

-- 2. Confirm hardening policies are present.
select
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
from pg_policies
where schemaname = 'public'
  and (
    policyname ilike '%Workspace members can manage%'
    or policyname = 'Users can manage own employee costs'
  )
order by tablename, policyname;

-- 3. Confirm dangerous public policies are gone.
select
  schemaname,
  tablename,
  policyname
from pg_policies
where schemaname = 'public'
  and policyname in (
    'Public can view contracts via token',
    'Public can read contracts by token',
    'Public read contracts by token',
    'Public can view project report via token',
    'Public can view tasks via project report token',
    'Public can view deliverables via project report token',
    'Read access for clients via token',
    'Update access for clients via token',
    'Public read deliverables by token',
    'Public can read proposals by token',
    'Public can view proposals via token',
    'Public read proposals by token',
    'Authenticated full access to proposals',
    'Authenticated full access to contracts',
    'Authenticated full access to contact_submissions',
    'Authenticated full access to lead_activities',
    'Authenticated full access to project_tasks',
    'Authenticated full access to project_time_logs',
    'Authenticated full access to project_expenses',
    'Authenticated full access to project_deliverables'
  );

-- 4. Confirm critical functions exist in the hardened form.
select
  p.proname as function_name,
  pg_get_function_identity_arguments(p.oid) as args,
  p.prosecdef as is_security_definer
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.proname in (
    'is_workspace_member',
    'can_access_project',
    'can_access_lead',
    'get_leads_needing_attention',
    'calculate_project_profitability'
  )
order by p.proname;

-- 5. Compare row counts after import against the source preflight output.
create temporary table if not exists tmp_crm_postflight_counts (
  table_name text not null,
  row_count bigint,
  exists_in_db boolean not null
) on commit drop;

truncate tmp_crm_postflight_counts;

do $$
declare
  table_name text;
  tables_to_count text[] := array[
    'profiles',
    'workspaces',
    'workspace_members',
    'workspace_config',
    'contact_submissions',
    'lead_activities',
    'proposals',
    'proposal_items',
    'contracts',
    'projects',
    'project_tasks',
    'project_time_logs',
    'project_expenses',
    'project_deliverables',
    'customers',
    'subscriptions',
    'document_envelopes',
    'document_signatures'
  ];
begin
  foreach table_name in array tables_to_count loop
    if to_regclass(format('public.%I', table_name)) is not null then
      execute format(
        'insert into tmp_crm_postflight_counts (table_name, row_count, exists_in_db) select %L, count(*)::bigint, true from public.%I',
        table_name,
        table_name
      );
    else
      insert into tmp_crm_postflight_counts (table_name, row_count, exists_in_db)
      values (table_name, null, false);
    end if;
  end loop;
end $$;

select table_name, row_count, exists_in_db
from tmp_crm_postflight_counts
order by table_name;
