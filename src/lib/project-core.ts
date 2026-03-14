export const PROJECT_STATUS_VALUES = [
  "discovery",
  "design",
  "development",
  "launch",
  "completed",
] as const;

export const PROJECT_SERVICE_TYPE_VALUES = [
  "web_presence",
  "ecommerce",
  "custom_system",
] as const;

export type ProjectStatus = (typeof PROJECT_STATUS_VALUES)[number];
export type ProjectServiceType = (typeof PROJECT_SERVICE_TYPE_VALUES)[number];

export function buildProjectSlug(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}
