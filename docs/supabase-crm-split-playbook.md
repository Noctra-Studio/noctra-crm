# Supabase Split Playbook

## Goal

Separar el CRM a un proyecto nuevo de Supabase y dejar de compartir la misma base con `noctra.studio`.

## Important constraint

No existe una forma limpia de mover datos entre dos proyectos distintos de Supabase usando solo un único query SQL dentro del SQL Editor. La parte de esquema sí ya existe como SQL versionado en este repo. La parte de datos debe hacerse con dump/import o CSV por tabla.

Por eso la estrategia correcta es:

1. Inventariar el proyecto actual.
2. Crear el proyecto nuevo del CRM.
3. Aplicar todas las migraciones del CRM en el proyecto nuevo.
4. Importar solo los datos del CRM.
5. Cambiar secretos del CRM al proyecto nuevo.
6. Limpiar el proyecto de `noctra.studio` después del cutover.

## Queries ya preparadas

- Preflight fuente: [20260307_crm_preflight_source.sql](/Users/manu/Documents/1.Projects/Noctra-studio/website/noctra-studio-crm/supabase/sql/20260307_crm_preflight_source.sql)
- Validación destino: [20260307_crm_postflight_validation.sql](/Users/manu/Documents/1.Projects/Noctra-studio/website/noctra-studio-crm/supabase/sql/20260307_crm_postflight_validation.sql)
- Hardening RLS final: [20260307000007_harden_public_and_workspace_rls.sql](/Users/manu/Documents/1.Projects/Noctra-studio/website/noctra-studio-crm/supabase/migrations/20260307000007_harden_public_and_workspace_rls.sql)

## What the public site currently uses

En este repo, la superficie pública de la web principal muestra uso directo o indirecto de:

- `contact_submissions`
- `rate_limits`
- `workspaces`
- `get_next_request_id()`
- `quiz_submissions`
- `forge_early_access`

Todo lo demás luce CRM o backoffice, salvo que el proyecto principal tenga código adicional que no está en este workspace.

## What should move to the dedicated CRM project

Tablas y RPCs CRM detectadas en uso:

- `profiles`
- `workspaces`
- `workspace_members`
- `workspace_config`
- `prospects`
- `contact_submissions`
- `lead_activities`
- `proposals`
- `proposal_items`
- `proposal_signatures`
- `proposal_activities`
- `contracts`
- `projects`
- `project_tasks`
- `project_time_logs`
- `project_expenses`
- `project_deliverables`
- `project_status_history`
- `project_services`
- `team_status`
- `deliverables`
- `tickets`
- `tax_profiles`
- `employee_costs`
- `customers`
- `subscriptions`
- `integrations_config`
- `followup_templates`
- `migrations`
- `migration_logs`
- `document_envelopes`
- `document_signatures`
- RPCs: `get_leads_needing_attention`, `calculate_project_profitability`, `increment_workspace_tokens`, `delete_user`

## Exact migration order for the new CRM project

Aplica en el proyecto nuevo estas migraciones, en este orden:

1. [001_crm_schema.sql](/Users/manu/Documents/1.Projects/Noctra-studio/website/noctra-studio-crm/supabase/migrations/001_crm_schema.sql)
2. [002_pipeline_kanban.sql](/Users/manu/Documents/1.Projects/Noctra-studio/website/noctra-studio-crm/supabase/migrations/002_pipeline_kanban.sql)
3. [003_alerts_rpc.sql](/Users/manu/Documents/1.Projects/Noctra-studio/website/noctra-studio-crm/supabase/migrations/003_alerts_rpc.sql)
4. [004_proposals_numbering.sql](/Users/manu/Documents/1.Projects/Noctra-studio/website/noctra-studio-crm/supabase/migrations/004_proposals_numbering.sql)
5. [005_proposal_signature_flow.sql](/Users/manu/Documents/1.Projects/Noctra-studio/website/noctra-studio-crm/supabase/migrations/005_proposal_signature_flow.sql)
6. [006_contracts_schema.sql](/Users/manu/Documents/1.Projects/Noctra-studio/website/noctra-studio-crm/supabase/migrations/006_contracts_schema.sql)
7. [007_contracts_refinements.sql](/Users/manu/Documents/1.Projects/Noctra-studio/website/noctra-studio-crm/supabase/migrations/007_contracts_refinements.sql)
8. [008_crm_security_fix.sql](/Users/manu/Documents/1.Projects/Noctra-studio/website/noctra-studio-crm/supabase/migrations/008_crm_security_fix.sql)
9. [009_project_deliverables.sql](/Users/manu/Documents/1.Projects/Noctra-studio/website/noctra-studio-crm/supabase/migrations/009_project_deliverables.sql)
10. [010_project_reports.sql](/Users/manu/Documents/1.Projects/Noctra-studio/website/noctra-studio-crm/supabase/migrations/010_project_reports.sql)
11. [011_rls_security_update.sql](/Users/manu/Documents/1.Projects/Noctra-studio/website/noctra-studio-crm/supabase/migrations/011_rls_security_update.sql)
12. [012_add_client_metadata_to_projects.sql](/Users/manu/Documents/1.Projects/Noctra-studio/website/noctra-studio-crm/supabase/migrations/012_add_client_metadata_to_projects.sql)
13. [20260222123456_data_migration_module.sql](/Users/manu/Documents/1.Projects/Noctra-studio/website/noctra-studio-crm/supabase/migrations/20260222123456_data_migration_module.sql)
14. [20260223000001_ai_profitability_schema.sql](/Users/manu/Documents/1.Projects/Noctra-studio/website/noctra-studio-crm/supabase/migrations/20260223000001_ai_profitability_schema.sql)
15. [20260223000002_finance_sync_schema.sql](/Users/manu/Documents/1.Projects/Noctra-studio/website/noctra-studio-crm/supabase/migrations/20260223000002_finance_sync_schema.sql)
16. [20260223000003_marketing_bridge_schema.sql](/Users/manu/Documents/1.Projects/Noctra-studio/website/noctra-studio-crm/supabase/migrations/20260223000003_marketing_bridge_schema.sql)
17. [20260223000004_noctra_sign_schema.sql](/Users/manu/Documents/1.Projects/Noctra-studio/website/noctra-studio-crm/supabase/migrations/20260223000004_noctra_sign_schema.sql)
18. [20260223000005_stripe_billing_schema.sql](/Users/manu/Documents/1.Projects/Noctra-studio/website/noctra-studio-crm/supabase/migrations/20260223000005_stripe_billing_schema.sql)
19. [20260223000006_add_folio_prefix_to_workspaces.sql](/Users/manu/Documents/1.Projects/Noctra-studio/website/noctra-studio-crm/supabase/migrations/20260223000006_add_folio_prefix_to_workspaces.sql)
20. [20260224_add_domain_fields.sql](/Users/manu/Documents/1.Projects/Noctra-studio/website/noctra-studio-crm/supabase/migrations/20260224_add_domain_fields.sql)
21. [20260307000007_harden_public_and_workspace_rls.sql](/Users/manu/Documents/1.Projects/Noctra-studio/website/noctra-studio-crm/supabase/migrations/20260307000007_harden_public_and_workspace_rls.sql)

## Recommended data move

La forma práctica es exportar e importar solo datos CRM. Si usas dump:

- Exporta datos de tablas CRM desde el proyecto compartido.
- Importa esos datos al proyecto nuevo, después de aplicar las migraciones.
- No importes tablas exclusivamente públicas si se van a quedar en `noctra.studio`.

## Cutover checklist

1. Ejecuta el preflight en el proyecto compartido y guarda resultados.
2. Crea el proyecto nuevo del CRM.
3. Aplica el set completo de migraciones arriba.
4. Importa datos CRM.
5. Ejecuta la validación postflight en el proyecto nuevo.
6. Cambia en el CRM:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
7. Despliega el CRM.
8. Prueba:
   - login
   - proposals
   - contracts
   - client proposal token page
   - contract token page
   - deliverables portal
   - reports portal
   - billing
   - profitability
9. Solo después limpia el proyecto de `noctra.studio`.

## Notes

- Si las policies públicas vulnerables estuvieron activas, rota `client_token` y `report_token`.
- Si la web principal va a seguir guardando leads ahí, no elimines `contact_submissions` hasta reemplazarla o desacoplarla.
