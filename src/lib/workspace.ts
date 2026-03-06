import { createClient } from '@/utils/supabase/server'
import { cache } from 'react'

export const getWorkspace = cache(async () => {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: membership } = await supabase
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
    .maybeSingle();

  if (membership) {
    return {
      workspaceId: membership.workspace_id,
      role: membership.role,
      workspace: (membership as any).workspaces,
    };
  }

  // Fallback: Check if the user is an owner of any workspace directly
  // This handles cases where workspace_members record creation might have failed
  const { data: ownedWorkspace } = await supabase
    .from("workspaces")
    .select("*")
    .eq("owner_id", user.id)
    .maybeSingle();

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

export type WorkspaceContext = NonNullable<
  Awaited<ReturnType<typeof getWorkspace>>
>
