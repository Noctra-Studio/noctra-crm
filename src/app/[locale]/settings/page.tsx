import { getRequiredWorkspace } from "@/lib/workspace";
import { getWorkspaceConfig } from "@/lib/workspace-config";
import WorkspaceSettingsClient from "./WorkspaceSettingsClient";

export const dynamic = "force-dynamic";

export default async function WorkspaceSettingsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const ctx = await getRequiredWorkspace(locale);

  const config = await getWorkspaceConfig(ctx.workspaceId);

  return <WorkspaceSettingsClient workspace={ctx.workspace} config={config} />;
}
