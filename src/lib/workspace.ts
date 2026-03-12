import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { cache } from 'react'

export const getWorkspace = cache(async () => {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: memberships, error: membershipError } = await supabase
    .from("workspace_members")
    .select(
      `
      workspace_id,
      role,
      workspaces (
        id,
        slug,
        name,
        logo_url,
        primary_color,
        email,
        currency,
        country,
        tier,
        plan,
        is_active,
        custom_domain,
        subdomain
      )
    `,
    )
    .eq("user_id", user.id)
    .limit(10);

  if (membershipError) {
    console.error("[getWorkspace] membership lookup failed:", membershipError);
  }

  const membership = (memberships ?? []).find(
    (item) => item.workspace_id && (item as any).workspaces,
  );

  if (membership) {
    return {
      workspaceId: membership.workspace_id,
      role: membership.role,
      workspace: (membership as any).workspaces,
    };
  }

  return null;
})

export async function getRequiredWorkspace(locale: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/login`)
  }

  const ctx = await getWorkspace()

  if (!ctx) {
    redirect(`/${locale}`)
  }

  return ctx
}

export type WorkspaceContext = NonNullable<
  Awaited<ReturnType<typeof getWorkspace>>
>
