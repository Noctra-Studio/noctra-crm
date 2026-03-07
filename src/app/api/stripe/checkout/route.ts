import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/utils/supabase/server";
import { isEarlyAccessAvailable } from "@/lib/subscriptions";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_fallback", {
  apiVersion: "2024-06-20",
} as any);

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { priceId, mode = "subscription", quantity = 1, workspaceId, creditAmount } = body;

    if (!priceId || !workspaceId) {
      return new NextResponse("Missing required parameters", { status: 400 });
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
