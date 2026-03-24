import { NextResponse } from "next/server";
import { requireAdminUser } from "@/lib/admin-auth";
import { createAdminClient } from "@/utils/supabase/admin";
import { assertSameOrigin } from "@/lib/request-security";
import { z } from "zod";

const InviteSchema = z.object({
  email: z.string().email(),
  company_name: z.string().trim().min(1).max(120),
  project_name: z.string().trim().min(1).max(160),
});

export async function POST(request: Request) {
  if (!assertSameOrigin(request)) {
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  }

  try {
    await requireAdminUser();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = InviteSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request payload" },
      { status: 400 }
    );
  }

  const { email, company_name, project_name } = parsed.data;

  const supabaseAdmin = createAdminClient();

  // 4. Invite User
  const { data: authData, error: inviteError } =
    await supabaseAdmin.auth.admin.inviteUserByEmail(email);

  if (inviteError) {
    return NextResponse.json({ error: inviteError.message }, { status: 500 });
  }

  const userId = authData.user.id;

  // 5. Create Profile
  const { error: profileError } = await supabaseAdmin.from("profiles").insert({
    id: userId,
    email: email,
    role: "client",
    company_name: company_name,
  });

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 500 });
  }

  // 6. Create Project
  const { error: projectError } = await supabaseAdmin.from("projects").insert({
    client_id: userId,
    name: project_name,
    status: "discovery",
    published_to_site: false,
  });

  if (projectError) {
    return NextResponse.json({ error: projectError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, userId });
}
