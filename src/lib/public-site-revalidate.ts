import "server-only";
import { revalidatePath, revalidateTag } from "next/cache";

const PUBLIC_PROJECTS_TAG = "public-projects";

type PublicSiteRevalidateResult =
  | { ok: true }
  | { ok: false; error: string };

function getPublicSiteBaseUrl() {
  return (
    process.env.PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    "https://noctra.studio"
  );
}

function getPublicSiteRevalidateSecret() {
  return process.env.PUBLIC_SITE_REVALIDATE_SECRET;
}

function getProjectPaths(slug?: string | null) {
  const paths = ["/work", "/es/work", "/en/work"];

  if (slug) {
    paths.push(`/work/${slug}`, `/es/work/${slug}`, `/en/work/${slug}`);
  }

  return paths;
}

function revalidateLocally(slug?: string | null): PublicSiteRevalidateResult {
  for (const path of getProjectPaths(slug)) {
    revalidatePath(path);
  }

  revalidateTag(PUBLIC_PROJECTS_TAG, "max");
  return { ok: true };
}

export async function revalidatePublicProjectContent(
  slug?: string | null,
): Promise<PublicSiteRevalidateResult> {
  const secret = getPublicSiteRevalidateSecret();

  if (!secret) {
    return revalidateLocally(slug);
  }

  const endpoint = new URL("/api/revalidate", getPublicSiteBaseUrl());
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${secret}`,
    },
    body: JSON.stringify({
      paths: getProjectPaths(slug),
      tags: [PUBLIC_PROJECTS_TAG],
    }),
    cache: "no-store",
  }).catch((error) => {
    return {
      ok: false,
      status: 500,
      text: async () =>
        error instanceof Error ? error.message : "Unknown network error",
    } as Response;
  });

  if (!response.ok) {
    return {
      ok: false,
      error: await response.text(),
    };
  }

  return { ok: true };
}

export { PUBLIC_PROJECTS_TAG };
