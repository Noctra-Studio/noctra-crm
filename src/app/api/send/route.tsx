import { ContactTemplate } from "@/components/email/ContactTemplate";
import { ConfirmationTemplate } from "@/components/email/ConfirmationTemplate";
import { AuditConfirmationTemplate } from "@/components/email/AuditConfirmationTemplate";
import { Resend } from "resend";
import { NextResponse } from "next/server";
import { z } from "zod";
import { assertSameOrigin } from "@/lib/request-security";

const resend = new Resend(process.env.RESEND_API_KEY);
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function isAllowedByRateLimit(identifier: string, limit = 5, windowMs = 60_000) {
  const now = Date.now();
  const current = rateLimitMap.get(identifier);

  if (!current || current.resetAt < now) {
    rateLimitMap.set(identifier, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (current.count >= limit) {
    return false;
  }

  current.count += 1;
  return true;
}

// Input validation schemas
const ContactFormSchema = z.object({
  type: z.literal("contact"),
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  email: z.string().email("Invalid email address"),
  website: z.string().url("Invalid website URL").optional().or(z.literal("")),
  service: z.string().max(200, "Service description too long").optional(),
  budget: z.string().max(50, "Budget string too long").optional(),
  details: z.string().max(2000, "Details too long").optional(),
});

const AuditFormSchema = z.object({
  type: z.literal("audit"),
  email: z.string().email("Invalid email address"),
  url: z.string().url("Invalid URL").min(1, "URL is required"),
});

const RequestSchema = z.discriminatedUnion("type", [
  ContactFormSchema,
  AuditFormSchema,
]);

export async function POST(request: Request) {
  try {
    if (!assertSameOrigin(request)) {
      return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
    }

    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";

    if (!isAllowedByRateLimit(ip)) {
      return NextResponse.json(
        { error: "Rate limit exceeded" },
        { status: 429 },
      );
    }

    const body = await request.json();

    // Validate input
    const validationResult = RequestSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Invalid input",
          details: validationResult.error.errors.map(e => ({
            field: e.path.join("."),
            message: e.message,
          }))
        },
        { status: 400 }
      );
    }

    const validatedData = validationResult.data;
    const { type } = validatedData;

    // Generate ticket ID
    // eslint-disable-next-line react-hooks/purity
    const ticketId = `#NOC-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    if (type === "audit") {
      const { email, url } = validatedData;

      const [notificationResult, confirmationResult] = await Promise.all([
        // 1. Notification to Noctra Studio (Audit)
        resend.emails.send({
          from: "Noctra Website <onboarding@resend.dev>",
          to: ["hello@noctra.studio"],
          subject: `New Audit Request: ${url} - ${ticketId}`,
          html: `<p>New Audit Request</p><p><strong>URL:</strong> ${url}</p><p><strong>Email:</strong> ${email}</p>`,
        }),

        // 2. Confirmation to User (Audit)
        resend.emails.send({
          from: "Noctra Studio <onboarding@resend.dev>",
          to: [email],
          subject: `System Alert: Audit Queued for ${url}`,
          html: `
            <div style="font-family: monospace; background: #000; color: #fff; padding: 40px; border-radius: 8px;">
              <h1 style="color: #22c55e; font-size: 18px; margin-bottom: 20px;">⚡ TRANSMISSION COMPLETE</h1>
              <p style="color: #a3a3a3; margin-bottom: 10px;">Your architecture audit has been queued for manual review.</p>
              <div style="background: #171717; border: 1px solid #262626; border-radius: 8px; padding: 20px; margin: 20px 0;">
                <p style="margin: 5px 0;"><strong style="color: #737373;">Ticket ID:</strong> <span style="color: #22c55e;">${ticketId}</span></p>
                <p style="margin: 5px 0;"><strong style="color: #737373;">URL:</strong> ${url}</p>
                <p style="margin: 5px 0;"><strong style="color: #737373;">Status:</strong> <span style="color: #eab308;">Received. Review in &lt; 24h</span></p>
              </div>
              <p style="color: #737373; font-size: 12px; margin-top: 20px;">We will send you the detailed report shortly.</p>
              <p style="color: #404040; font-size: 11px; margin-top: 30px;">— Noctra Studio</p>
            </div>
          `,
        }),
      ]);

      return NextResponse.json({
        success: true,
        ticketId,
        notificationResult,
        confirmationResult,
      });
    }

    // Default: Contact Form
    const { name, email, website, service, budget, details } = validatedData;

    const [notificationResult, confirmationResult] = await Promise.all([
      // 1. Notification to Noctra Studio
      resend.emails.send({
        from: "Noctra Website <onboarding@resend.dev>",
        to: ["hello@noctra.studio"],
        subject: `New Project Inquiry: ${name} - ${ticketId}`,
        react: (
          <ContactTemplate
            name={name}
            email={email}
            website={website ?? ""}
            service={service ?? ""}
            budget={budget ?? ""}
            details={details ?? ""}
          />
        ),
      }),

      // 2. Confirmation to User
      resend.emails.send({
        from: "Noctra Studio <onboarding@resend.dev>",
        to: [email],
        subject: `Signal Received: ${ticketId}`,
        react: <ConfirmationTemplate name={name} ticketId={ticketId} />,
      }),
    ]);

    return NextResponse.json({
      success: true,
      ticketId,
      notificationResult,
      confirmationResult,
    });
  } catch (error) {
    console.error("Email send error:", error);
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 }
    );
  }
}
