# Security Hardening Report

## Executive Summary

This codebase is materially safer than before this pass, but it is not accurate to call it "bank-grade" yet. The highest-impact access-control, CSRF, secret-handling, and payment-authorization issues found in the application layer were remediated. The biggest remaining gap is that most business data in Supabase is still stored in plaintext at the application layer; if you want confidentiality against a database dump or privileged insider compromise, that requires a field-level encryption design plus external key management.

## Remediated Findings

### CR-001: CSRF tokens were global and replayable across users
- OWASP: A01 Broken Access Control, A05 Security Misconfiguration
- Fixed in [src/app/api/csrf/route.ts](/Users/manu/Documents/1.Projects/Noctra-studio/website/noctra-studio-crm/src/app/api/csrf/route.ts#L8) and [src/app/api/contact/route.ts](/Users/manu/Documents/1.Projects/Noctra-studio/website/noctra-studio-crm/src/app/api/contact/route.ts#L20)
- Previous issue: a single app-wide CSRF secret meant any valid token could be replayed across users and sessions.
- Fix: CSRF is now bound to a per-browser secret in an `HttpOnly` cookie, signed server-side, and checked together with same-origin validation.

### CR-002: Sensitive admin resend route exposed lead data without admin auth
- OWASP: A01 Broken Access Control
- Fixed in [src/app/api/contact/resend-email/route.ts](/Users/manu/Documents/1.Projects/Noctra-studio/website/noctra-studio-crm/src/app/api/contact/resend-email/route.ts#L18)
- Previous issue: anyone who could hit the endpoint with a `submissionId` could trigger outbound mail and read error behavior around lead records.
- Fix: same-origin enforcement, admin authentication, and UUID validation were added.

### CR-003: Revalidation endpoint allowed any authenticated user to purge arbitrary cache paths
- OWASP: A01 Broken Access Control
- Fixed in [src/app/api/revalidate/route.ts](/Users/manu/Documents/1.Projects/Noctra-studio/website/noctra-studio-crm/src/app/api/revalidate/route.ts#L11)
- Previous issue: any logged-in user could call the endpoint and revalidate attacker-chosen paths.
- Fix: same-origin enforcement, admin-only access, and a path allowlist.

### CR-004: Stripe checkout and billing portal trusted client-supplied `workspaceId`
- OWASP: A01 Broken Access Control
- Fixed in [src/app/api/stripe/checkout/route.ts](/Users/manu/Documents/1.Projects/Noctra-studio/website/noctra-studio-crm/src/app/api/stripe/checkout/route.ts#L27) and [src/app/api/stripe/portal/route.ts](/Users/manu/Documents/1.Projects/Noctra-studio/website/noctra-studio-crm/src/app/api/stripe/portal/route.ts#L22)
- Previous issue: any authenticated user could attempt billing operations against another workspace UUID.
- Fix: strict payload validation, same-origin checks, and server-side membership enforcement via `getWorkspace()`.

### CR-005: Stripe server routes allowed insecure secret fallback behavior
- OWASP: A05 Security Misconfiguration
- Fixed in [src/app/api/stripe/checkout/route.ts](/Users/manu/Documents/1.Projects/Noctra-studio/website/noctra-studio-crm/src/app/api/stripe/checkout/route.ts#L9), [src/app/api/stripe/portal/route.ts](/Users/manu/Documents/1.Projects/Noctra-studio/website/noctra-studio-crm/src/app/api/stripe/portal/route.ts#L8), and [src/app/api/stripe/webhook/route.ts](/Users/manu/Documents/1.Projects/Noctra-studio/website/noctra-studio-crm/src/app/api/stripe/webhook/route.ts#L6)
- Previous issue: routes fell back to test-style secret defaults when env vars were missing.
- Fix: fail-fast behavior now requires the real secrets to exist.

### CR-006: Stored third-party integration secrets were persisted plaintext and re-exposed to the browser
- OWASP: A02 Cryptographic Failures
- Fixed in [src/lib/request-security.ts](/Users/manu/Documents/1.Projects/Noctra-studio/website/noctra-studio-crm/src/lib/request-security.ts#L91), [src/app/actions/marketing-actions.ts](/Users/manu/Documents/1.Projects/Noctra-studio/website/noctra-studio-crm/src/app/actions/marketing-actions.ts#L6), and [src/app/[locale]/settings/marketing/MarketingSettingsClient.tsx](/Users/manu/Documents/1.Projects/Noctra-studio/website/noctra-studio-crm/src/app/[locale]/settings/marketing/MarketingSettingsClient.tsx#L19)
- Previous issue: Mailchimp API keys were stored as plaintext and then sent back to the client UI.
- Fix: Mailchimp credentials are now encrypted with AES-256-GCM before persistence, decrypted only on the server, and never returned raw to the browser.

### CR-007: Unauthenticated AI endpoints expanded attack surface and cost abuse
- OWASP: A01 Broken Access Control, A05 Security Misconfiguration
- Fixed in [src/app/api/completion/route.ts](/Users/manu/Documents/1.Projects/Noctra-studio/website/noctra-studio-crm/src/app/api/completion/route.ts#L7), [src/app/api/agent/email/route.ts](/Users/manu/Documents/1.Projects/Noctra-studio/website/noctra-studio-crm/src/app/api/agent/email/route.ts#L7), [src/app/api/agent/proposal/route.ts](/Users/manu/Documents/1.Projects/Noctra-studio/website/noctra-studio-crm/src/app/api/agent/proposal/route.ts#L7), [src/app/api/agent/[type]/route.ts](/Users/manu/Documents/1.Projects/Noctra-studio/website/noctra-studio-crm/src/app/api/agent/[type]/route.ts#L7), and [src/app/api/forge/login/route.ts](/Users/manu/Documents/1.Projects/Noctra-studio/website/noctra-studio-crm/src/app/api/forge/login/route.ts#L11)
- Fix: these routes now require an authenticated workspace session or same-origin checks.

## Residual Risks

### RS-001: CSP is still weaker than a high-assurance target because production `script-src` allows `unsafe-inline`
- OWASP: A03 Injection, A05 Security Misconfiguration
- Location: [src/proxy.ts](/Users/manu/Documents/1.Projects/Noctra-studio/website/noctra-studio-crm/src/proxy.ts#L101)
- Impact: CSP still provides some protection, but it is not a strong XSS containment policy while inline scripts remain globally allowed.
- Recommendation: move to nonce- or hash-based CSP and remove `unsafe-inline` from `script-src`.

### RS-002: Most CRM and customer data is still plaintext at the application layer
- OWASP: A02 Cryptographic Failures
- Location: business tables in Supabase, not a single file
- Impact: if an attacker obtains a logical dump of `profiles`, `contact_submissions`, `projects`, `contracts`, `deliverables`, or similar tables, that data remains readable.
- Recommendation: introduce envelope encryption for selected high-sensitivity columns, store data-encryption keys outside the database, and accept the queryability tradeoffs explicitly.

### RS-003: Admin authorization still depends on a hardcoded email allowlist
- OWASP: A01 Broken Access Control
- Location: [src/lib/admin-auth.ts](/Users/manu/Documents/1.Projects/Noctra-studio/website/noctra-studio-crm/src/lib/admin-auth.ts#L3)
- Impact: this is stricter than role-only auth, but brittle operationally and not suitable as a long-term privileged-access model.
- Recommendation: move privileged access control to workspace/role claims plus MFA enforcement and an auditable admin membership table.

## Operational Requirements Added By This Hardening

- `CSRF_SECRET` must remain configured.
- `APP_ENCRYPTION_KEY` must be set to a 32-byte key encoded as 64-char hex or base64.
- `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` must be present in every environment where those routes exist.
