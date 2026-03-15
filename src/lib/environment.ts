/**
 * Environment detection and helpers.
 *
 * Source of truth: NEXT_PUBLIC_APP_ENV
 * Allowed values: "demo" | "staging" | "production"
 * Falls back to "production" when missing or invalid.
 */

const VALID_ENVS = ["demo", "staging", "production"] as const;
export type AppEnv = (typeof VALID_ENVS)[number];

function resolveEnv(): AppEnv {
  const raw = (process.env.NEXT_PUBLIC_APP_ENV ?? "").trim().toLowerCase();
  return VALID_ENVS.includes(raw as AppEnv) ? (raw as AppEnv) : "production";
}

/** Current application environment. */
export const APP_ENV: AppEnv = resolveEnv();

export const isDemo = APP_ENV === "demo";
export const isStaging = APP_ENV === "staging";
export const isProduction = APP_ENV === "production";
export const isNonProduction = !isProduction;

/** User-facing label (Spanish). */
export function envLabel(env: AppEnv = APP_ENV): string {
  const labels: Record<AppEnv, string> = {
    demo: "Demo",
    staging: "Staging",
    production: "Producción",
  };
  return labels[env];
}
