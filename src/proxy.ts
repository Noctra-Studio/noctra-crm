import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { updateSession } from "./utils/supabase/middleware";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  extractLocaleFromPath,
  getDefaultAuthenticatedRoute,
} from "./lib/auth-redirect";

const intlMiddleware = createMiddleware(routing);

const MAIN_DOMAINS = ["noctra.studio", "www.noctra.studio", "localhost:3000"];
const CRM_HOME_RE = /^\/(en|es)?\/?$/;

function isPublicSiteReferrer(referer: string | null) {
  if (!referer) return false;

  try {
    const { host } = new URL(referer);
    return MAIN_DOMAINS.includes(host);
  } catch {
    return false;
  }
}

export default async function proxy(request: NextRequest) {
  const host = request.headers.get("host") || "";
  const referer = request.headers.get("referer");
  const { pathname } = request.nextUrl;
  const locale = extractLocaleFromPath(pathname);
  const isPublicSiteEntry = isPublicSiteReferrer(referer);
  
  // 0. Custom Domain & Subdomain Persistence Logic
  let resolvedWorkspace = null;
  const isMainDomain = MAIN_DOMAINS.some(d => host.includes(d));

  if (!isMainDomain) {
    // Determine if it's a subdomain (*.noctra.studio) or a custom domain
    const isSubdomain = host.endsWith(".noctra.studio");
    
    // Initialize Supabase with service role to lookup workspace by domain
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const query = isSubdomain 
      ? supabaseAdmin.from("workspaces").select("id, tier, subdomain").eq("subdomain", host.split(".")[0]).single()
      : supabaseAdmin.from("workspaces").select("id, tier, custom_domain").eq("custom_domain", host).single();

    const { data: workspace } = await query;

    if (workspace) {
      // Validate Premium Tiers for Whitelabel
      if (workspace.tier !== "pro" && workspace.tier !== "agency") {
        // Block custom domain if not Premium
        return NextResponse.redirect(new URL("https://noctra.studio/settings/billing", request.url));
      }
      resolvedWorkspace = workspace;
    }
  }


  // 1. Run next-intl middleware to handle locale redirection/rewrites
  const response = intlMiddleware(request);

  // 2. Run Supabase middleware to refresh session
  let finalResponse = response;
  let user = null;
  try {
    const result = await updateSession(request, response);
    finalResponse = result.response;
    user = result.user;
    const aal = (result as any).aal;

    // Handle CRM Route Protection (everything is basically CRM now)
    const isLoginPage = pathname.endsWith('/login');
    
    // Public routes that don't need authentication if they are NOT inside the app area
    // For now, assuming everything else needs protection unless it's the landing page
    const isLandingPage = /^\/(es|en)?\/?$/.test(pathname);
    
    // Protected routes: projects, pipeline, proposals, contracts, clients, leads, metrics, settings, docs, search
    const protectedRoutes = ['/dashboard', '/projects', '/pipeline', '/proposals', '/contracts', '/clients', '/leads', '/metrics', '/settings', '/docs', '/search'];
    const isProtectedRoute = protectedRoutes.some(route => pathname.includes(route));
    const requiresMfa =
      aal?.nextLevel === 'aal2' && aal?.currentLevel !== 'aal2';

    if (isProtectedRoute && !user) {
      const loginUrl = request.nextUrl.clone();
      if (locale) {
        loginUrl.pathname = `/${locale}/login`;
      } else {
        loginUrl.pathname = '/login';
      }
      return NextResponse.redirect(loginUrl);
    }

    // MFA check for protected routes
    if (isProtectedRoute && requiresMfa) {
      const loginUrl = request.nextUrl.clone();
      if (locale) {
        loginUrl.pathname = `/${locale}/login`;
      } else {
        loginUrl.pathname = '/login';
      }
      return NextResponse.redirect(loginUrl);
    }

    if (
      isPublicSiteEntry &&
      user &&
      !requiresMfa &&
      isProtectedRoute &&
      !CRM_HOME_RE.test(pathname)
    ) {
      const dashboardUrl = request.nextUrl.clone();
      dashboardUrl.pathname = getDefaultAuthenticatedRoute(locale);
      dashboardUrl.search = "";
      return NextResponse.redirect(dashboardUrl);
    }

    if (isLoginPage && user && !requiresMfa) {
      const dashboardUrl = request.nextUrl.clone();
      dashboardUrl.pathname = getDefaultAuthenticatedRoute(locale);
      dashboardUrl.search = "";
      return NextResponse.redirect(dashboardUrl);
    }
  } catch (error) {
    console.error("Proxy error:", error);
  }

  // 4. Add Security Headers
  const isDevelopment = process.env.NODE_ENV === 'development';

  // Content Security Policy
  const cspDirectives = [
    "default-src 'self'",
    isDevelopment
      ? "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://vercel.live"
      : "script-src 'self' 'unsafe-inline' https://vercel.live https://va.vercel-scripts.com",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https://*.supabase.co",
    "font-src 'self' data:",
    "connect-src 'self' https://*.supabase.co https://www.googleapis.com https://safebrowsing.googleapis.com https://http-observatory.security.mozilla.org https://vercel.live https://*.sentry.io https://o172531.ingest.us.sentry.io",
    "worker-src 'self' blob:",
    "frame-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'self'",
    "upgrade-insecure-requests",
    "block-all-mixed-content",
  ];

  const csp = cspDirectives.join('; ');

  const securityHeaders = {
    'Content-Security-Policy': csp,
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
    'X-DNS-Prefetch-Control': 'on',
    'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
    'X-Frame-Options': 'SAMEORIGIN',
    'X-Content-Type-Options': 'nosniff',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
  };

  Object.entries(securityHeaders).forEach(([key, value]) => {
    finalResponse.headers.set(key, value);
  });

  // 5. Final Routing for White-label
  if (resolvedWorkspace && !isMainDomain) {
    // If we have a resolved workspace from a custom domain, 
    // we can add a header to identify it in downstream components
    finalResponse.headers.set("x-resolved-workspace-id", resolvedWorkspace.id);
  }

  return finalResponse;
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|monitoring|.*\\..*).*)"],
};
