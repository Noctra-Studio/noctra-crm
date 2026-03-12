import "server-only";

import {
  createCsrfSecret,
  getCsrfCookieName,
  issueCsrfToken,
  verifyCsrfToken,
} from "@/lib/request-security";

export { getCsrfCookieName };

export function generateCsrfSecret() {
  return createCsrfSecret();
}

export function generateCsrfToken(secret: string) {
  return issueCsrfToken(secret);
}

export function validateCsrfToken(secret: string, token: string) {
  return verifyCsrfToken(secret, token);
}
