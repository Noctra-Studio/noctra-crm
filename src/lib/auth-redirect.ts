export const DEFAULT_APP_LOCALE = "es" as const;
export const DEFAULT_AUTHENTICATED_ROUTE = "/" as const;

const LOCALE_PREFIX_RE = /^\/(en|es)(\/|$)/;
const PASSWORD_RESET_ROUTE_RE = /^\/(en|es)\/forgot-password$/;

export function extractLocaleFromPath(pathname: string) {
  return pathname.match(LOCALE_PREFIX_RE)?.[1] as "en" | "es" | undefined;
}

export function getDefaultAuthenticatedRoute(locale?: string) {
  return locale ? `/${locale}` : DEFAULT_AUTHENTICATED_ROUTE;
}

function canUsePostAuthDestination(pathname: string, searchParams: URLSearchParams) {
  return (
    PASSWORD_RESET_ROUTE_RE.test(pathname) &&
    searchParams.get("mode") === "reset"
  );
}

export function resolvePostAuthRedirect(
  next: string | null | undefined,
  locale: string = DEFAULT_APP_LOCALE,
) {
  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return getDefaultAuthenticatedRoute(locale);
  }

  const url = new URL(next, "https://crm.noctra.studio");
  const defaultRoute = getDefaultAuthenticatedRoute(locale);

  if (
    url.pathname === DEFAULT_AUTHENTICATED_ROUTE ||
    url.pathname === defaultRoute
  ) {
    return `${url.pathname}${url.search}`;
  }

  if (canUsePostAuthDestination(url.pathname, url.searchParams)) {
    return `${url.pathname}${url.search}`;
  }

  return defaultRoute;
}
