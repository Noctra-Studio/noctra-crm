# Security Best Practices Report

## Executive Summary

Se revisó la superficie de acceso a Supabase en el código de aplicación y en las migraciones SQL incluidas en el repo. Durante esta pasada ya quedaron corregidos los flujos públicos que dependían de RLS abierto por `client_token` o `report_token`, además del endpoint/server action de profitability y los usos administrativos de `SUPABASE_SERVICE_ROLE_KEY`. La remediación de base de datos quedó preparada en una migración correctiva nueva: `supabase/migrations/20260307000007_harden_public_and_workspace_rls.sql`. Los hallazgos críticos documentados abajo deben considerarse mitigados en código y pendientes de cierre definitivo hasta que esa migración se ejecute en Supabase.

## Remediated In This Pass

### Fixed-01
- Severity: High
- Location: `src/app/[locale]/admin/actions.ts`, `src/app/api/admin/invite/route.ts`, `src/lib/admin-auth.ts`
- Summary: Se agregó validación de admin real antes de usar `SUPABASE_SERVICE_ROLE_KEY`.

### Fixed-02
- Severity: High
- Location: `src/app/api/projects/[id]/profitability/route.ts`
- Summary: El endpoint ahora valida que el proyecto pertenezca al `workspace` del usuario autenticado antes de invocar el RPC de profitability.

### Fixed-03
- Severity: Critical
- Location: `src/app/[locale]/client/proposal/[token]/page.tsx`, `src/app/[locale]/client/contract/[token]/page.tsx`, `src/app/actions/deliverables.ts`, `src/app/actions/reports.ts`, `src/app/api/proposals/sign/route.ts`, `src/app/api/contracts/sign/route.ts`, `src/app/p/[id]/page.tsx`, `src/utils/supabase/admin.ts`
- Summary: Los flujos públicos por token dejaron de depender del cliente Supabase con RLS público y ahora pasan por un cliente server-only con `service_role`, validando explícitamente el token en la capa de aplicación.

### Fixed-04
- Severity: Critical
- Location: `supabase/migrations/20260307000007_harden_public_and_workspace_rls.sql`
- Summary: Se agregó una migración correctiva para eliminar policies públicas inseguras, limitar tablas sensibles por `workspace`, restringir `employee_costs`, y reescribir los RPCs `get_leads_needing_attention` y `calculate_project_profitability` con validación de pertenencia real.

## Critical Findings

### SEC-01
- Severity: Critical
- Location: `supabase/migrations/011_rls_security_update.sql:11`, `supabase/migrations/011_rls_security_update.sql:28`, `supabase/migrations/011_rls_security_update.sql:44`, `supabase/migrations/011_rls_security_update.sql:52`, `supabase/migrations/011_rls_security_update.sql:59`, `supabase/migrations/011_rls_security_update.sql:65`, `supabase/migrations/011_rls_security_update.sql:71`, `supabase/migrations/011_rls_security_update.sql:77`, `supabase/migrations/011_rls_security_update.sql:91`
- Evidence: Las policies usan `FOR ALL TO authenticated USING (true) WITH CHECK (true)` o equivalente sobre `proposals`, `contracts`, `contact_submissions`, `lead_activities`, `project_tasks`, `project_time_logs`, `project_expenses`, `project_deliverables` y `deliverable_items`.
- Impact: Si esta migración fue aplicada, cualquier usuario autenticado puede leer, insertar, actualizar y borrar registros de otros workspaces. Eso rompe por completo el aislamiento multi-tenant y permite exfiltración o corrupción transversal de datos.
- Fix: Reemplazar cada policy abierta por reglas atadas a `workspace_id` o al ownership real del recurso. La condición debe usar membresía del workspace actual, por ejemplo contra `workspace_members`, y el `WITH CHECK` debe impedir writes fuera del workspace del usuario.
- Mitigation: Revocar temporalmente acceso directo desde el browser a tablas sensibles hasta corregir RLS y rotar cualquier token/policy pública asociada a recursos expuestos.
- False positive notes: Solo deja de ser crítico si esta migración nunca fue ejecutada en ningún ambiente. Eso debe verificarse directamente en Supabase.

### SEC-02
- Severity: Critical
- Location: `supabase/migrations/011_rls_security_update.sql:19`, `supabase/migrations/011_rls_security_update.sql:36`, `supabase/migrations/011_rls_security_update.sql:81`
- Evidence: Las policies públicas para `proposals`, `contracts` y `project_deliverables` usan `USING (client_token IS NOT NULL)`.
- Impact: Esa condición no valida el token solicitado; solamente exige que el registro tenga algún token. En práctica, cualquier actor anónimo puede consultar todas las filas con `client_token` no nulo si conoce o prueba los endpoints/queries correctos.
- Fix: Cambiar las policies para comparar el token de la fila con el token presentado por el flujo público, idealmente vía vistas o RPCs controlados. Otra opción más segura es no exponer tablas directamente al rol `anon` y encapsular lectura pública en route handlers server-side.
- Mitigation: Deshabilitar inmediatamente estas policies públicas y rotar todos los `client_token` existentes.
- False positive notes: No hay una salvaguarda visible en la policy misma. Cualquier protección adicional tendría que vivir fuera de Supabase y no aparece en este repo.

### SEC-03
- Severity: Critical
- Location: `supabase/migrations/20260223000001_ai_profitability_schema.sql:22`, `supabase/migrations/20260223000001_ai_profitability_schema.sql:28`, `profitability-migration.sql:31`, `profitability-migration.sql:32`, `profitability-migration.sql:33`, `profitability-migration.sql:34`, `profitability-migration.sql:38`, `profitability-migration.sql:39`, `profitability-migration.sql:40`, `profitability-migration.sql:41`
- Evidence: `employee_costs` queda con `FOR ALL TO authenticated USING (true)`. Además, `project_time_logs` y `project_expenses` tienen lectura/escritura universal para `authenticated`. Encima, `calculate_project_profitability` corre como `SECURITY DEFINER`.
- Impact: Un usuario autenticado podría leer o manipular costos, horas y gastos de otros proyectos, y el RPC podría devolver márgenes de proyectos ajenos si llega a invocarse con IDs arbitrarios o si el SQL subyacente ignora RLS por diseño.
- Fix: Limitar todas esas tablas por `workspace_id` y/o `project_id` relacionado al workspace del usuario. El RPC debe validar pertenencia del proyecto dentro de la función o convertirse a `SECURITY INVOKER` si el diseño lo permite.
- Mitigation: Mantener la validación de app recién agregada en `src/app/api/projects/[id]/profitability/route.ts`, pero no confiar solo en ella: la protección fuerte debe estar en Supabase.
- False positive notes: El endpoint HTTP ya quedó endurecido, pero el riesgo sigue existiendo si otras rutas o el cliente invocan el RPC directamente.

## Medium Findings

### SEC-04
- Severity: Medium
- Location: `src/app/api/contact/route.ts:48`, `src/app/api/contact/route.ts:96`
- Evidence: El rate limit usa `x-forwarded-for`/`x-real-ip` sin validación adicional, y el endpoint responde `duplicate_email` cuando encuentra un correo existente.
- Impact: Un atacante puede intentar evadir parte del rate limiting manipulando headers en algunos despliegues y también usar la respuesta `duplicate_email` para enumerar si un email ya existe en la base.
- Fix: Resolver IP solo desde headers confiables del proxy/CDN real y responder un mensaje genérico para duplicados del formulario público.
- Mitigation: Aplicar rate limiting también en edge/CDN y monitorear bursts contra `/api/contact`.
- False positive notes: Si el proveedor de hosting sanea `x-forwarded-for`, la parte de evasión puede bajar de severidad; la enumeración por correo sigue presente.

## Recommended Next Steps

1. Aplicar `supabase/migrations/20260307000007_harden_public_and_workspace_rls.sql` en staging y producción.
2. Rotar `client_token` y `report_token` si las policies públicas vulnerables llegaron a estar expuestas en algún ambiente.
3. Probar con dos usuarios autenticados de distintos workspaces que no puedan leer ni mutar `proposals`, `contracts`, `contact_submissions`, `project_tasks`, `project_time_logs`, `project_expenses` ni `project_deliverables` cruzados.
4. Confirmar desde la UI pública que propuestas, contratos, deliverables y reportes siguen resolviendo correctamente vía capa server-side.
