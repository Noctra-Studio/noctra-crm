import { NextResponse } from "next/server";
import { getActiveSubscriptionsCount } from "@/lib/subscriptions";

export const dynamic = "force-dynamic"; // never cache this count

export async function GET() {
  try {
    const count = await getActiveSubscriptionsCount();
    return NextResponse.json({ count });
  } catch (error) {
    return NextResponse.json({ count: 0 }, { status: 500 });
  }
}
