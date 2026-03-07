import { createClient } from "@/utils/supabase/server";

const ALLOWED_EMAILS = new Set([
  "hello@noctra.studio",
  "manuel.matusdequevedo@gmail.com",
]);

export async function requireAdminUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.id || !user.email || !ALLOWED_EMAILS.has(user.email)) {
    throw new Error("Unauthorized");
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (error || profile?.role !== "admin") {
    throw new Error("Unauthorized");
  }

  return { supabase, user };
}
