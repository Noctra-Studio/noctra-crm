import { createClient } from "@/utils/supabase/server";
import { Resend } from "resend";
import { NextResponse } from "next/server";
import { QuizResultsTemplate } from "@/components/email/QuizResultsTemplate";

import { AdminNewLeadTemplate } from "@/components/email/AdminNewLeadTemplate";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, company, answers, recommendation } = body;

    // 1. Store in Supabase
    const supabase = await createClient();
    const { error: dbError } = await supabase.from("quiz_submissions").insert({
      name,
      email,
      phone,
      company,
      service_id: recommendation.serviceId,
      score: recommendation.score,
      answers: answers,
      status: "new",
    });

    if (dbError) {
      console.error("Supabase Error:", dbError);
      // We continue to send email even if DB fails, but log it
    }

    // 2. Send Emails
    const [userEmail, adminEmail] = await Promise.allSettled([
      // Email to User
      resend.emails.send({
        from: "Noctra Studio <hello@noctra.studio>",
        to: [email],
        subject: "Your Personalized Strategy Recommendation",
        react: (
          <QuizResultsTemplate
            name={name}
            recommendation={recommendation}
            answers={answers}
          />
        ),
      }),

      // Email to Admin
      resend.emails.send({
        from: "Noctra Website <hello@noctra.studio>",
        to: ["hello@noctra.studio"],
        subject: `New Quiz Lead: ${name} (${recommendation.serviceId})`,
        react: (
          <AdminNewLeadTemplate
            answers={answers}
            recommendation={recommendation}
          />
        ),
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Quiz Submission Error:", error);
    return NextResponse.json(
      { error: "Failed to submit quiz" },
      { status: 500 },
    );
  }
}
