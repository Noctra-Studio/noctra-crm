import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect(`/${locale}/login`);
  }

  // Email Allowlist Check
  const ALLOWED_EMAILS = [
    "hello@noctra.studio",
    "manuel.matusdequevedo@gmail.com",
  ];

  if (!user.email || !ALLOWED_EMAILS.includes(user.email)) {
    console.warn(`Unauthorized Email Access to /admin: ${user.email}`);
    return redirect(`/${locale}`);
  }

  // Check Database Role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    // Log the attempt for security auditing
    console.warn(`Unauthorized Access Attempt to /admin by user: ${user.id}`);
    return redirect(`/${locale}`); // Kick them out
  }

  return (
    <div className="admin-secured-layout min-h-screen flex flex-col bg-black text-white">
      {/* Admin Mode Banner */}
      <div className="bg-red-900/20 text-red-500 text-xs text-center py-1 uppercase tracking-widest border-b border-red-900/30">
        Restricted Environment • Authorized Personnel Only
      </div>

      {/* Return Link */}
      <div className="p-6 pb-0">
        <a
          href={`/${locale}`}
          className="text-sm text-zinc-500 hover:text-white transition-colors flex items-center gap-2 w-fit">
          ← Return to Website
        </a>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">{children}</div>

      {/* Dashboard Footer */}
      <footer className="border-t border-zinc-800 py-4 mt-auto">
        <p className="text-xs text-zinc-500 text-center">
          © 2025 Noctra Studio. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
