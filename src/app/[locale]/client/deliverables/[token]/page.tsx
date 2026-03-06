import { getDeliverableByTokenAction } from "@/app/actions/deliverables";
import DeliverablePortalClient from "./DeliverablePortalClient";
import { notFound } from "next/navigation";

export default async function DeliverablePortalPage({
  params,
}: {
  params: { token: string; locale: string };
}) {
  const deliverable = await getDeliverableByTokenAction(params.token);

  if (!deliverable) {
    notFound();
  }

  return <DeliverablePortalClient deliverable={deliverable} />;
}
