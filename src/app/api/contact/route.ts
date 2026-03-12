import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { resend } from "@/lib/resend";
import { getCsrfCookieName, validateCsrfToken } from "@/lib/csrf";
import { assertSameOrigin } from "@/lib/request-security";
import validator from "validator";
import sanitizeHtml from "sanitize-html";
import { calculateLeadScore } from "@/lib/lead-scoring";

const SECURITY_HEADERS = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Cache-Control": "no-store",
};

if (!process.env.RESEND_API_KEY) {
  console.error("CRITICAL: RESEND_API_KEY is not set in environment variables.");
}

export async function POST(req: Request) {
  try {
    if (!assertSameOrigin(req)) {
      return NextResponse.json(
        { error: "invalid_origin" },
        { status: 403, headers: SECURITY_HEADERS },
      );
    }

    const body = await req.json();
    const supabase = await createClient();

    // 1. CSRF Token Validation
    const csrfToken = body.csrf_token;
    const csrfSecret = req.headers
      .get("cookie")
      ?.split(";")
      .map((part) => part.trim())
      .find((part) => part.startsWith(`${getCsrfCookieName()}=`))
      ?.slice(getCsrfCookieName().length + 1);

    if (!csrfToken || !csrfSecret || !validateCsrfToken(csrfSecret, csrfToken)) {
      return NextResponse.json(
        { error: "invalid_csrf" },
        { status: 403, headers: SECURITY_HEADERS }
      );
    }

    // 2. Honeypot Check (Silent Reject)
    const honeypot = body.website;
    if (honeypot && honeypot.trim() !== "") {
      console.log("Honeypot triggered");
      return NextResponse.json({ success: true }, { status: 200, headers: SECURITY_HEADERS });
    }

    // 3. Timing Check (Silent Reject)
    const formLoadTime = body.form_load_time;
    const elapsed = Date.now() - Number(formLoadTime);
    if (!formLoadTime || elapsed < 3000) {
      console.log(`Timing check failed: ${elapsed}ms`);
      return NextResponse.json({ success: true }, { status: 200, headers: SECURITY_HEADERS });
    }

    // 4. IP Rate Limit Check
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || 
               req.headers.get("x-real-ip") || 
               "unknown";

    const RATE_LIMIT = 3;
    const WINDOW_MINUTES = 60;
    const windowStart = new Date(Date.now() - WINDOW_MINUTES * 60 * 1000).toISOString();

    // Check rate limit (gracefully handles missing table)
    const { data: rateLimit, error: rateError } = await supabase
      .from("rate_limits")
      .select("*")
      .eq("ip", ip)
      .gte("first_attempt_at", windowStart)
      .maybeSingle();

    if (rateLimit && rateLimit.attempts >= RATE_LIMIT) {
      return NextResponse.json(
        { error: "rate_limited" },
        { status: 429, headers: SECURITY_HEADERS }
      );
    }

    // 5. Input Sanitization & Validation
    const { name, email, phone, service, budget, timeline, message, intent, cta, locale } = body;

    if (!email || !validator.isEmail(email)) {
      return NextResponse.json(
        { error: "invalid_email" },
        { status: 400, headers: SECURITY_HEADERS }
      );
    }

    const clean = (str: string, maxLen: number) =>
      sanitizeHtml(str || "", { allowedTags: [] }).trim().slice(0, maxLen);

    const safeName = clean(name, 100);
    const safeMessage = clean(message, 2000);
    const safePhone = phone?.replace(/[^0-9+\-\s()]/g, "").slice(0, 20);
    const safeEmail = validator.normalizeEmail(email) || email;
    const safeService = clean(service, 50);
    const safeBudget = clean(budget, 50);
    const safeTimeline = clean(timeline, 50);
    const safeIntent = clean(intent, 50);
    const safeCta = clean(cta, 50);
    const safeLocale = clean(locale, 5);

    // 6. Duplicate Email Check
    const { data: existing } = await supabase
      .from("contact_submissions")
      .select("id")
      .eq("email", safeEmail)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { error: "duplicate_email" },
        { status: 409, headers: SECURITY_HEADERS }
      );
    }

    // Upsert rate limit record (handles missing table)
    if (!rateError) {
      if (rateLimit) {
        await supabase
          .from("rate_limits")
          .update({
            attempts: rateLimit.attempts + 1,
            last_attempt_at: new Date().toISOString(),
          })
          .eq("id", rateLimit.id);
      } else {
        await supabase.from("rate_limits").insert({ ip, attempts: 1 });
      }
    }

    // 7. Calculate Lead Score
    const { score, ...breakdown } = calculateLeadScore({
      service_type: safeIntent,
      message: safeMessage,
      phone: safePhone,
      company: body.company_name || body.company || null,
      source_cta: safeCta,
      pipeline_status: 'nuevo',
      created_at: new Date().toISOString()
    });

    // 8. Insert into contact_submissions
    // Default workspace ID for new public leads (Noctra)
    const DEFAULT_WORKSPACE_ID = "596024fa-0855-45b7-b1bd-00e43ccb9dfa";
    
    // Fetch workspace info for branding
    const { data: workspaceInfo } = await supabase
      .from("workspaces")
      .select("name, email")
      .eq("id", DEFAULT_WORKSPACE_ID)
      .single();

    // Get next value from sequence for Request ID
    const { data: seqData, error: seqError } = await supabase.rpc('get_next_request_id');
    const requestId = seqError
      ? `NOC-${Math.floor(Math.random() * 9000 + 1000)}` // Fallback if RPC fails
      : `NOC-${String(seqData).padStart(4, '0')}`;

    const { data: submission, error: dbError } = await supabase
      .from("contact_submissions")
      .insert({
        name: safeName,
        email: safeEmail,
        phone: safePhone,
        message: safeMessage,
        service_interest: safeService,
        source_cta: safeCta,
        source_page: body.source || null,
        locale: safeLocale || "es",
        intent: safeIntent,
        request_id: requestId,
        lead_score: score,
        lead_score_breakdown: breakdown,
        workspace_id: DEFAULT_WORKSPACE_ID
      })
      .select("id")
      .single();

    if (dbError) throw dbError;

    // 8. Send Email via Resend (Bilingual Logic)
    try {
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

      const selectedTemplate = templates[safeIntent] || generalTemplate;
      const lang = (safeLocale === "es" ? "es" : "en") as "es" | "en";
      const template = selectedTemplate[lang];

      // Use workspace branding for email
      const fromAddress = `${workspaceInfo?.name || "Noctra Studio"} <${workspaceInfo?.email || "hello@noctra.studio"}>`;
      const replyToAddress = workspaceInfo?.email || "hello@noctra.studio";

      const emailResult = await resend.emails.send({
        from: fromAddress,
        to: [safeEmail],
        replyTo: replyToAddress,
        subject: template.subject,
        html: template.html(safeName),
      });

      if (emailResult.error) {
        console.error("Resend delivery error (User):", emailResult.error);
      } else {
        // Only update email_sent status on success
        await supabase
          .from("contact_submissions")
          .update({
            email_sent: true,
            email_sent_at: new Date().toISOString(),
          })
          .eq("id", submission.id);
      }

      // Admin Notification
      const adminResult = await resend.emails.send({
        from: `Noctra System <${replyToAddress}>`,
        to: [replyToAddress],
        replyTo: replyToAddress,
        subject: `New Lead: ${safeName} (${safeIntent})`,
        html: `
          <h1>New Lead Received</h1>
          <p><strong>Request ID:</strong> ${requestId}</p>
          <p><strong>Name:</strong> ${safeName}</p>
          <p><strong>Email:</strong> ${safeEmail}</p>
          <p><strong>Phone:</strong> ${safePhone}</p>
          <p><strong>Intent:</strong> ${safeIntent}</p>
          <p><strong>CTA:</strong> ${safeCta}</p>
          <p><strong>Service:</strong> ${safeService}</p>
          <p><strong>Budget:</strong> ${safeBudget}</p>
          <p><strong>Timeline:</strong> ${safeTimeline}</p>
          <p><strong>Locale:</strong> ${safeLocale}</p>
          <p><strong>Message:</strong></p>
          <p>${safeMessage}</p>
        `,
      });

      if (adminResult.error) {
        console.error("Resend delivery error (Admin):", adminResult.error);
      }
    } catch (emailErr) {
      console.error("Email send exception:", emailErr);
    }

    return NextResponse.json(
      { success: true, requestId, submissionId: submission.id },
      { headers: SECURITY_HEADERS }
    );
  } catch (error) {
    console.error("Contact API Error:", error);
    return NextResponse.json(
      { error: "internal_error" },
      { status: 500, headers: SECURITY_HEADERS }
    );
  }
}
