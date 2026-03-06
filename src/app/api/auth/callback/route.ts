import { createServerClient } from "@supabase/ssr";
import { type EmailOtpType } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { resend } from "@/lib/resend";
import { welcomeTemplate } from "@/lib/email-templates/welcome";
import { isEarlyAccessAvailable } from "@/lib/subscriptions";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/en/studio";

  // Create a mutable array to hold cookies that need to be set
  const cookiesToSet: { name: string; value: string; options: any }[] = [];

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookies) {
          cookies.forEach((cookie) => {
            cookiesToSet.push(cookie);
          });
        },
      },
    }
  );

  const redirectTo = (url: string) => {
    const response = NextResponse.redirect(url);
    cookiesToSet.forEach(({ name, value, options }) =>
      response.cookies.set(name, value, options)
    );
    return response;
  };

  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });
    if (!error) {
      // Logic to handle welcome email
      const { data: { user } } = await supabase.auth.getUser();
      if (user && !user.user_metadata?.welcome_email_sent) {
        const isEarly = await isEarlyAccessAvailable();
        const locale = (next.split('/')[1] || 'es') as 'es' | 'en';
        
        try {
          await resend.emails.send({
            from: "Noctra Forge <hello@noctra.studio>",
            to: [user.email!],
            subject: welcomeTemplate[locale || 'es'].subject,
            html: welcomeTemplate[locale || 'es'].html(user.user_metadata?.name || user.email || "Cliente", isEarly),
          });

          await supabase.auth.updateUser({
            data: { welcome_email_sent: true }
          });
        } catch (emailErr) {
          console.error("Failed to send welcome email:", emailErr);
        }
      }

      const forwardedHost = request.headers.get("x-forwarded-host");
      const isLocal = process.env.NODE_ENV === "development";
      if (isLocal) {
        return redirectTo(`${request.nextUrl.origin}${next}`);
      } else if (forwardedHost) {
        return redirectTo(`https://${forwardedHost}${next}`);
      } else {
        return redirectTo(`${request.nextUrl.origin}${next}`);
      }
    } else {
      console.error("Supabase VerifyOtp Error:", error);
    }
  } else if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Logic to handle welcome email
      const { data: { user } } = await supabase.auth.getUser();
      if (user && !user.user_metadata?.welcome_email_sent) {
        const isEarly = await isEarlyAccessAvailable();
        const locale = (next.split('/')[1] || 'es') as 'es' | 'en';
        
        try {
          await resend.emails.send({
            from: "Noctra Forge <hello@noctra.studio>",
            to: [user.email!],
            subject: welcomeTemplate[locale || 'es'].subject,
            html: welcomeTemplate[locale || 'es'].html(user.user_metadata?.full_name || user.email || "Cliente", isEarly),
          });

          await supabase.auth.updateUser({
            data: { welcome_email_sent: true }
          });
        } catch (emailErr) {
          console.error("Failed to send welcome email:", emailErr);
        }
      }

      const forwardedHost = request.headers.get("x-forwarded-host");
      const isLocal = process.env.NODE_ENV === "development";
      if (isLocal) {
        return redirectTo(`${request.nextUrl.origin}${next}`);
      } else if (forwardedHost) {
        return redirectTo(`https://${forwardedHost}${next}`);
      } else {
        return redirectTo(`${request.nextUrl.origin}${next}`);
      }
    } else {
      console.error("Supabase ExchangeCode Error:", error);
    }
  }

  // Return the user to an error page with some instructions
  return NextResponse.redirect(`${request.nextUrl.origin}/en/auth/auth-code-error`);
}
