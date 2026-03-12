import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { resend } from "@/lib/resend";
import { requireAdminUser } from "@/lib/admin-auth";
import { assertSameOrigin } from "@/lib/request-security";
import { z } from "zod";

const SECURITY_HEADERS = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Cache-Control": "no-store",
};

const ResendEmailSchema = z.object({
  submissionId: z.string().uuid("Invalid submissionId"),
});

export async function POST(req: Request) {
  try {
    if (!assertSameOrigin(req)) {
      return NextResponse.json(
        { error: "invalid_origin" },
        { status: 403, headers: SECURITY_HEADERS },
      );
    }

    await requireAdminUser();

    const parseResult = ResendEmailSchema.safeParse(await req.json());
    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Invalid submissionId" },
        { status: 400, headers: SECURITY_HEADERS },
      );
    }

    const { submissionId } = parseResult.data;
    const supabase = await createClient();

    // 1. Fetch lead from DB
    const { data: lead, error: fetchError } = await supabase
      .from("contact_submissions")
      .select("*")
      .eq("id", submissionId)
      .single();

    if (fetchError || !lead) {
      return NextResponse.json(
        { error: "Lead not found" },
        { status: 404, headers: SECURITY_HEADERS }
      );
    }

    // 2. Bilingual Logic (reusing logic from main route)
    const { discoveryTemplate } = await import("@/lib/email-templates/discovery-call");
    const { webPresenceTemplate } = await import("@/lib/email-templates/web-presence");
    const { ecommerceTemplate } = await import("@/lib/email-templates/ecommerce");
    const { customSystemTemplate } = await import("@/lib/email-templates/custom-system");
    const { generalTemplate } = await import("@/lib/email-templates/general");

    const templates: Record<string, any> = {
      discovery_call: discoveryTemplate,
      website: webPresenceTemplate,
      ecommerce: ecommerceTemplate,
      custom_system: customSystemTemplate,
      general: generalTemplate,
    };

    // Use the stored intent directly (now saved during lead creation)
    const selectedTemplate = templates[lead.intent] || generalTemplate;
    const lang = (lead.locale === "en" ? "en" : "es") as "es" | "en";
    const template = selectedTemplate[lang];

    // 3. Resend email
    const emailResult = await resend.emails.send({
      from: "Noctra Studio <hello@noctra.studio>",
      to: [lead.email],
      replyTo: "hello@noctra.studio",
      subject: template.subject,
      html: template.html(lead.name),
    });

    if (emailResult.error) {
      console.error("Resend retry error:", emailResult.error);
      return NextResponse.json(
        { error: emailResult.error },
        { status: 500, headers: SECURITY_HEADERS }
      );
    }

    // 4. Update status
    await supabase
      .from("contact_submissions")
      .update({
        email_sent: true,
        email_sent_at: new Date().toISOString(),
      })
      .eq("id", lead.id);

    return NextResponse.json(
      { success: true },
      { headers: SECURITY_HEADERS }
    );
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401, headers: SECURITY_HEADERS },
      );
    }

    console.error("Resend Retry Exception:", error);
    return NextResponse.json(
      { error: "internal_error" },
      { status: 500, headers: SECURITY_HEADERS }
    );
  }
}
