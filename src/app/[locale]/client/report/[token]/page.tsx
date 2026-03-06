import { getReportByTokenAction } from "@/app/actions/reports";
import ReportPortalClient from "./ReportPortalClient";
import { notFound } from "next/navigation";

export default async function ProjectReportPage({
  params,
}: {
  params: { token: string; locale: string };
}) {
  const data = await getReportByTokenAction(params.token);

  if (!data) {
    notFound();
  }

  return <ReportPortalClient data={data} />;
}
