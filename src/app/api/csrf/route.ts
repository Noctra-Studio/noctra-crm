import {
  generateCsrfSecret,
  generateCsrfToken,
  getCsrfCookieName,
} from "@/lib/csrf";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const secret = generateCsrfSecret();
    const token = generateCsrfToken(secret);
    const response = NextResponse.json(
      { token },
      {
        headers: {
          "Cache-Control": "no-store",
          "X-Content-Type-Options": "nosniff",
        },
      },
    );

    response.cookies.set({
      name: getCsrfCookieName(),
      value: secret,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60,
    });

    return response;
  } catch (error) {
    console.error("CSRF Token Generation Error:", error);
    return NextResponse.json(
      { error: "Failed to generate token" },
      { status: 500 },
    );
  }
}
