import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/utils/supabase/server";
import { getWorkspace } from "@/lib/workspace";
import { assertSameOrigin } from "@/lib/request-security";
import { z } from "zod";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  throw new Error("Missing STRIPE_SECRET_KEY");
}

const stripe = new Stripe(stripeSecretKey, {
  apiVersion: "2024-06-20",
} as any);

const BillingPortalSchema = z.object({
  workspaceId: z.string().uuid(),
});

export async function POST(req: Request) {
  try {
    if (!assertSameOrigin(req)) {
      return new NextResponse("Invalid origin", { status: 403 });
    }

    const supabase = await createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const parsed = BillingPortalSchema.safeParse(await req.json());
    if (!parsed.success) {
      return new NextResponse("Invalid request payload", { status: 400 });
    }

    const { workspaceId } = parsed.data;
    const ctx = await getWorkspace();
    if (!ctx || ctx.workspaceId !== workspaceId) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    // Fetch Stripe Customer ID from DB
    const { data: customerData } = await supabase
      .from("customers")
      .select("stripe_customer_id")
      .eq("workspace_id", workspaceId)
      .single();

    if (!customerData || !customerData.stripe_customer_id) {
        return new NextResponse("No active billing account", { status: 404 });
    }

    const stripeSession = await stripe.billingPortal.sessions.create({
      customer: customerData.stripe_customer_id,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings/billing`,
    });

    return NextResponse.json({ url: stripeSession.url });
  } catch (error: any) {
    console.error("[STRIPE_PORTAL]", error);
    return new NextResponse(error.message || "Internal Error", { status: 500 });
  }
}
