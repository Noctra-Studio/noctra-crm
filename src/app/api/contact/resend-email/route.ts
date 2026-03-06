import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { resend } from "@/lib/resend";

const SECURITY_HEADERS = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Cache-Control": "no-store",
};

export async function POST(req: Request) {
  try {
    const { submissionId } = await req.json();
    const supabase = await createClient();

    if (!submissionId) {
      return NextResponse.json(
        { error: "Missing submissionId" },
        { status: 400, headers: SECURITY_HEADERS }
      );
    }

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
    console.error("Resend Retry Exception:", error);
    return NextResponse.json(
      { error: "internal_error" },
      { status: 500, headers: SECURITY_HEADERS }
    );
  }
}
