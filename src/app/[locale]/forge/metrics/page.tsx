import { createClient } from "@/utils/supabase/server";
import MetricsClient from "./MetricsClient";
import { redirect } from "next/navigation";
import { getRevenueForecast, getRevenueTrend } from "@/app/actions/metrics";

export const dynamic = "force-dynamic";
export const revalidate = 60; // Revalidate every 60 seconds

export default async function MetricsPage() {
  const supabase = await createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/forge/login");
  }

  // Fetch all leads for metrics calculation
  const { data: leads, error } = await supabase
    .from("contact_submissions")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching leads for metrics:", error);
    return (
      <div className="p-10 text-red-500 font-mono text-[10px] uppercase tracking-widest bg-black min-h-screen">
        Error loading metrics: {error.message}
      </div>
    );
  }

  // Fetch initial forecast and trend
  const initialForecast = await getRevenueForecast();
  const initialTrend = await getRevenueTrend();

  return (
    <MetricsClient
      leads={leads || []}
      initialForecast={initialForecast}
      initialTrend={initialTrend}
    />
  );
}
