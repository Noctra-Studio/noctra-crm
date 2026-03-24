Analiza este proyecto de `noctra.studio` como si fuera la web pública principal, no el CRM. Necesito que generes SQL seguro para limpiar Supabase y eliminar toda la superficie de CRM que no se usa en la web pública.

Objetivo:
- Conservar solo tablas, columnas, índices, triggers, policies y funciones realmente usados por la página principal.
- Eliminar todo lo que pertenezca al CRM/backoffice si no tiene uso comprobado en esta web.
- No adivinar. Debes basarte en referencias reales del código.

Instrucciones:

1. Recorre el proyecto completo y detecta todas las referencias reales a Supabase:
- `.from("...")`
- `.rpc("...")`
- storage buckets
- auth admin
- middlewares
- route handlers públicos
- server actions
- edge/server functions

2. Clasifica los objetos de Supabase en tres grupos:
- `KEEP`: usados de forma comprobada por la web pública.
- `REVIEW`: ambiguos o indirectos.
- `REMOVE`: claramente CRM/backoffice y sin referencias activas en la web pública.

3. Produce un reporte corto con:
- tablas a conservar
- columnas a conservar por tabla
- funciones/RPCs a conservar
- policies a conservar
- tablas candidatas a borrar
- columnas candidatas a borrar

4. Después genera SQL en este orden:
- `01_inventory.sql`
  Debe listar tablas, columnas, policies, triggers y funciones candidatas.
- `02_soft_cleanup.sql`
  Debe hacer solo cambios no destructivos:
  - `DROP POLICY IF EXISTS`
  - `REVOKE`
  - deshabilitar triggers no usados
  - comentarios `TODO`
- `03_destructive_cleanup.sql`
  Solo debe incluir drops confirmados por uso real:
  - `ALTER TABLE ... DROP COLUMN`
  - `DROP FUNCTION`
  - `DROP TRIGGER`
  - `DROP TABLE ... CASCADE`

5. Reglas de seguridad:
- No borres `contact_submissions`, `rate_limits`, `quiz_submissions`, `forge_early_access`, `workspaces` ni `get_next_request_id()` sin antes demostrar que no se usan.
- No borres nada referenciado desde formularios públicos, quiz, branding, dominios, middleware o emails.
- Si una tabla se usa solo para branding y hoy depende de `workspaces`, propón una migración a una tabla más pequeña, pero no la borres todavía.
- Toda query destructiva debe venir envuelta en `BEGIN; ... COMMIT;` y debe tener versión `ROLLBACK PLAN`.

6. También quiero una sección final llamada `Suggested Target Public Schema` con la versión mínima ideal para la web pública, por ejemplo:
- leads públicos
- rate limiting
- quiz leads
- early access
- branding/site settings

Contexto conocido desde el repo CRM:
- La web pública parece usar al menos:
  - `contact_submissions`
  - `rate_limits`
  - `workspaces`
  - `get_next_request_id()`
  - `quiz_submissions`
  - `forge_early_access`
- Todo lo demás es sospechoso de ser CRM hasta demostrar lo contrario.

Entrega esperada:
- Reporte breve de keep/review/remove
- SQL listo para copiar y pegar
- Riesgos de ejecutar cada script
- Lista de validaciones post-cleanup
