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
        subscription_status,
        tier,
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

  // Fallback: Check if the user is an owner of any workspace directly
  // This handles cases where workspace_members record creation might have failed
  const { data: ownedWorkspaces, error: ownedWorkspaceError } = await supabase
    .from("workspaces")
    .select("*")
    .eq("owner_id", user.id)
    .limit(10);

  if (ownedWorkspaceError) {
    console.error("[getWorkspace] owner workspace lookup failed:", ownedWorkspaceError);
  }

  const ownedWorkspace = ownedWorkspaces?.[0];

  if (ownedWorkspace) {
    console.warn(`[getWorkspace] No membership found for user ${user.id}, but found owned workspace ${ownedWorkspace.id}. Using fallback.`);
    return {
      workspaceId: ownedWorkspace.id,
      role: "owner",
      workspace: ownedWorkspace,
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
