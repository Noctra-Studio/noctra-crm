-- ============================================
-- CRM SPLIT: SOURCE PREFLIGHT INVENTORY
-- Run this on the CURRENT shared Supabase project before any split.
-- ============================================

-- 1. Row counts for CRM tables that should move to the dedicated CRM project.
create temporary table if not exists tmp_crm_preflight_counts (
  bucket text not null,
  table_name text not null,
  row_count bigint,
  exists_in_db boolean not null
) on commit drop;

truncate tmp_crm_preflight_counts;

do $$
declare
  table_name text;
  crm_tables text[] := array[
    'profiles',
    'workspaces',
    'workspace_members',
    'workspace_config',
    'prospects',
    'contact_submissions',
    'lead_activities',
    'proposals',
    'proposal_items',
    'proposal_signatures',
    'proposal_activities',
    'contracts',
    'projects',
    'project_tasks',
    'project_time_logs',
    'project_expenses',
    'project_deliverables',
    'project_status_history',
    'project_services',
    'team_status',
    'deliverables',
    'tickets',
    'tax_profiles',
    'employee_costs',
    'customers',
    'subscriptions',
    'integrations_config',
    'followup_templates',
    'migrations',
    'migration_logs',
    'document_envelopes',
    'document_signatures'
  ];
  public_site_tables text[] := array[
    'contact_submissions',
    'rate_limits',
    'quiz_submissions',
    'forge_early_access',
    'workspaces'
  ];
begin
  foreach table_name in array crm_tables loop
    if to_regclass(format('public.%I', table_name)) is not null then
      execute format(
        'insert into tmp_crm_preflight_counts (bucket, table_name, row_count, exists_in_db) select %L, %L, count(*)::bigint, true from public.%I',
        'crm',
        table_name,
        table_name
      );
    else
      insert into tmp_crm_preflight_counts (bucket, table_name, row_count, exists_in_db)
      values ('crm', table_name, null, false);
    end if;
  end loop;

  foreach table_name in array public_site_tables loop
    if to_regclass(format('public.%I', table_name)) is not null then
      execute format(
        'insert into tmp_crm_preflight_counts (bucket, table_name, row_count, exists_in_db) select %L, %L, count(*)::bigint, true from public.%I',
        'public_site',
        table_name,
        table_name
      );
    else
      insert into tmp_crm_preflight_counts (bucket, table_name, row_count, exists_in_db)
      values ('public_site', table_name, null, false);
    end if;
  end loop;
end $$;

select table_name, row_count, exists_in_db
from tmp_crm_preflight_counts
where bucket = 'crm'
order by table_name;

-- 2. Row counts for tables that appear to be used by the public website surface.
-- Keep these visible while you decide what stays on noctra.studio.
select table_name, row_count, exists_in_db
from tmp_crm_preflight_counts
where bucket = 'public_site'
order by table_name;

-- 3. Functions/RPCs that the CRM expects after the split.
select
  n.nspname as schema_name,
  p.proname as function_name,
  pg_get_function_identity_arguments(p.oid) as args,
  pg_get_userbyid(p.proowner) as owner_name
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.proname in (
    'get_next_request_id',
    'get_leads_needing_attention',
    'calculate_project_profitability',
    'increment_workspace_tokens',
    'delete_user'
  )
order by p.proname;

-- 4. Foreign key map for CRM-related tables.
select
  tc.table_name,
  kcu.column_name,
  ccu.table_name as referenced_table,
  ccu.column_name as referenced_column,
  tc.constraint_name
from information_schema.table_constraints tc
join information_schema.key_column_usage kcu
  on tc.constraint_name = kcu.constraint_name
 and tc.table_schema = kcu.table_schema
join information_schema.constraint_column_usage ccu
  on ccu.constraint_name = tc.constraint_name
 and ccu.table_schema = tc.table_schema
where tc.constraint_type = 'FOREIGN KEY'
  and tc.table_schema = 'public'
  and tc.table_name in (
    'profiles',
    'workspaces',
    'workspace_members',
    'workspace_config',
    'prospects',
    'contact_submissions',
    'lead_activities',
    'proposals',
    'proposal_items',
    'proposal_signatures',
    'proposal_activities',
    'contracts',
    'projects',
    'project_tasks',
    'project_time_logs',
    'project_expenses',
    'project_deliverables',
    'project_status_history',
    'project_services',
    'team_status',
    'deliverables',
    'tickets',
    'tax_profiles',
    'employee_costs',
    'customers',
    'subscriptions',
    'integrations_config',
    'followup_templates',
    'migrations',
    'migration_logs',
    'document_envelopes',
    'document_signatures'
  )
order by tc.table_name, kcu.column_name;
