import { redirect } from "next/navigation";
import { getWorkspace } from "@/lib/workspace";
import { getWorkspaceConfig } from "@/lib/workspace-config";
import WorkspaceSettingsClient from "./WorkspaceSettingsClient";

export const dynamic = "force-dynamic";

export default async function WorkspaceSettingsPage() {
  const ctx = await getWorkspace();

  if (!ctx) {
    redirect("/forge/login");
  }

  const config = await getWorkspaceConfig(ctx.workspaceId);

  return <WorkspaceSettingsClient workspace={ctx.workspace} config={config} />;
}
