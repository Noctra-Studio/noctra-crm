import { notFound, redirect } from "next/navigation";
import { createAdminClient } from "@/utils/supabase/admin";

export default async function ShortProposalRedirect({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createAdminClient();

  // Find the proposal by ID to get the client_token
  const { data: proposal, error } = await supabase
    .from("proposals")
    .select("client_token")
    .eq("id", params.id)
    .single();

  if (error || !proposal) {
    return notFound();
  }

  // Redirect to the localized full URL
  // We assume default locale 'es' if not specified,
  // but next-intl usually handles the base redirect if we use a relative path.
  // However, since this is a top-level route outside [locale],
  // we should redirect to /es/client/proposal/[token] or /en/...
  // For now, let's redirect to the 'es' version as default or just /client/proposal/[token]
  // and let the middleware handle locale assignment if configured.

  redirect(`/client/proposal/${proposal.client_token}`);
}
