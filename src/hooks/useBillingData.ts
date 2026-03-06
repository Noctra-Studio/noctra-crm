import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

export function useBillingData() {
  const [loading, setLoading] = useState(true);
  const [workspace, setWorkspace] = useState<any>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const supabase = createClient();

  const fetchBillingData = async () => {
    try {
      setLoading(true);
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      const { data: workspaceUser } = await supabase
        .from("workspace_members")
        .select("workspace_id")
        .eq("user_id", session.user.id)
        .limit(1)
        .single();

      if (!workspaceUser) return;
      const workspaceId = workspaceUser.workspace_id;

      const { data: workspaceData } = await supabase
        .from("workspaces")
        .select("*")
        .eq("id", workspaceId)
        .single();
      setWorkspace(workspaceData);

      const { data: subData } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("workspace_id", workspaceId)
        .in("status", ["active", "trialing"])
        .single();
      setSubscription(subData);
    } catch (error) {
      console.error("Error fetching billing data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBillingData();
  }, [supabase]);

  return { workspace, subscription, loading, refetch: fetchBillingData };
}
