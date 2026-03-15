"use server";

import { createAdminClient } from "@/utils/supabase/admin";
import { createContractFromProposalAction } from "./contracts";
import { addDeliverableAction } from "./deliverables";
import { recordWorkspaceActivity } from "@/lib/activity";

/**
 * Triggered when a proposal is electronically signed.
 * Automatically generates a contract draft.
 */
export async function onProposalAccepted(proposalId: string) {
  try {
    const result = await createContractFromProposalAction(proposalId);
    console.log(`Auto-generated contract ${result.id} from proposal ${proposalId}`);
    return result;
  } catch (error) {
    console.error("Failed to auto-generate contract:", error);
    return null;
  }
}

/**
 * Triggered when a project is created.
 * Adds default deliverables expected by the client.
 */
export async function onProjectCreated(projectId: string, workspaceId: string) {
  const supabase = createAdminClient();

  const defaultDeliverables = [
    {
      title: "Documento de Estrategia e Inmersión",
      description: "Definición de objetivos, audiencia y roadmap del proyecto.",
      file_url: "#"
    },
    {
      title: "Concepto Creativo / Mockups Iniciales",
      description: "Propuesta visual y flujo de experiencia de usuario.",
      file_url: "#"
    }
  ];

  for (const del of defaultDeliverables) {
    await addDeliverableAction({
      project_id: projectId,
      ...del
    });
  }

  await recordWorkspaceActivity(supabase, {
    workspaceId: workspaceId,
    entityType: "project",
    entityId: projectId,
    eventType: "project.deliverables_added",
    title: "Entregables iniciales creados",
    description: "Se han agregado los entregables base para revisión del cliente.",
    metadata: {
      projectId,
      count: defaultDeliverables.length
    }
  });
}
