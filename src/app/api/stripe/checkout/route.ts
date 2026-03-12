import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/utils/supabase/server";
import { isEarlyAccessAvailable } from "@/lib/subscriptions";
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

const CheckoutSchema = z.object({
  priceId: z.string().min(1),
  mode: z.enum(["subscription", "payment"]).default("subscription"),
  quantity: z.number().int().positive().max(100).default(1),
  workspaceId: z.string().uuid(),
  creditAmount: z.number().int().positive().optional(),
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

    const parsed = CheckoutSchema.safeParse(await req.json());
    if (!parsed.success) {
      return new NextResponse("Invalid request payload", { status: 400 });
    }

    const { priceId, mode, quantity, workspaceId, creditAmount } = parsed.data;
    const ctx = await getWorkspace();
    if (!ctx || ctx.workspaceId !== workspaceId) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    // Optional: Fetch Stripe Customer ID from the DB if they have one already
    const { data: customerData } = await supabase
      .from("customers")
      .select("stripe_customer_id")
      .eq("workspace_id", workspaceId)
      .single();

    let customerId = customerData?.stripe_customer_id;

    if (!customerId) {
        // Create customer in Stripe
        const customer = await stripe.customers.create({
            email: session.user.email,
            metadata: {
                workspace_id: workspaceId
            }
        });
        customerId = customer.id;

        // Save to DB
        await supabase.from("customers").insert({
            workspace_id: workspaceId,
            stripe_customer_id: customerId
        });
    }

    // Set up standard checkout parameters
    const checkoutParams: Stripe.Checkout.SessionCreateParams = {
      customer: customerId,
      mode: mode as "subscription" | "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: quantity,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings/billing?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings/billing?canceled=true`,
      metadata: {
        workspace_id: workspaceId,
        user_id: session.user.id,
      },
    };

    // If it's a one-time purchase, we pass the credit amount for the webhook
    if (mode === "payment" && creditAmount) {
      checkoutParams.metadata!.credit_amount = creditAmount.toString();
    }
    // Dynamic Lifetime Discount Injection for Subscriptions
    if (mode === "subscription") {
      const earlyAccessAvailable = await isEarlyAccessAvailable();
      if (earlyAccessAvailable && process.env.STRIPE_LIFETIME_COUPON_ID) {
        checkoutParams.discounts = [
          { coupon: process.env.STRIPE_LIFETIME_COUPON_ID }
        ];
      }
    }

    const stripeSession = await stripe.checkout.sessions.create(checkoutParams);

    return NextResponse.json({ url: stripeSession.url });
  } catch (error: any) {
    console.error("[STRIPE_CHECKOUT]", error);
    return new NextResponse(error.message || "Internal Error", { status: 500 });
  }
}
