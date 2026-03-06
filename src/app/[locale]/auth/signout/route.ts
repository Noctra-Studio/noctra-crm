import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ locale: string }> }
) {
  const requestUrl = new URL(request.url);
  const { locale } = await params;
  const supabase = await createClient();

  await supabase.auth.signOut();

  return NextResponse.redirect(`${requestUrl.origin}/${locale}/login`, {
    status: 301,
  });
}
