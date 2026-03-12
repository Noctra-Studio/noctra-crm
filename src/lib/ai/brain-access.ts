export const CENTRAL_BRAIN_ALLOWED_ROLES = ["owner", "admin", "member"] as const;

export function canAccessCentralBrainRole(role?: string | null) {
  if (!role) return false;
  return CENTRAL_BRAIN_ALLOWED_ROLES.includes(
    role as (typeof CENTRAL_BRAIN_ALLOWED_ROLES)[number],
  );
}

