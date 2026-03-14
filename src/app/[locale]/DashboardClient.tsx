"use client";

import WorkspaceDashboard from "@/components/forge/dashboard/WorkspaceDashboard";
import type { WorkspaceDashboardData } from "@/types/forge-dashboard";

export default function DashboardClient({
  initialData,
}: {
  initialData: WorkspaceDashboardData;
}) {
  return <WorkspaceDashboard initialData={initialData} />;
}
