import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// A faulty API route to test Sentry's server-side error capturing.
// This route intentionally throws an error when called.
export async function GET() {
  throw new Error("Sentry API Route Error — Intentional Test");
  // This line is unreachable, but Next.js needs a return statement.
  return NextResponse.json({ data: "Testing Sentry error capture..." });
}
