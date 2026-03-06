import { createClient } from "@/utils/supabase/server";

const LIFETIME_DISCOUNT_LIMIT = 20;

export async function getActiveSubscriptionsCount(): Promise<number> {
  try {
    const supabase = await createClient();
    
    // Contamos cuantos workspaces tienen subscription_status = 'active'
    // Esto significa que ya pagaron y no están en 'trialing'
    const { count, error } = await supabase
      .from('workspaces')
      .select('*', { count: 'exact', head: true })
      .eq('subscription_status', 'active');

    if (error) {
      console.error("[getActiveSubscriptionsCount] Error fetching count:", error);
      return 0;
    }

    return count || 0;
  } catch (err) {
    console.error("[getActiveSubscriptionsCount] Error:", err);
    return 0;
  }
}

export async function isEarlyAccessAvailable(): Promise<boolean> {
  const count = await getActiveSubscriptionsCount();
  return count < LIFETIME_DISCOUNT_LIMIT;
}

export const EARLY_ACCESS_LIMIT = LIFETIME_DISCOUNT_LIMIT;
