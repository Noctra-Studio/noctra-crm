import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createAdminClient } from "@/utils/supabase/admin";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

if (!stripeSecretKey) {
  throw new Error("Missing STRIPE_SECRET_KEY");
}

if (!stripeWebhookSecret) {
  throw new Error("Missing STRIPE_WEBHOOK_SECRET");
}

const verifiedStripeWebhookSecret: string = stripeWebhookSecret;

// Initialize Supabase with Service Role Key for Admin access to DB
const supabaseAdmin = createAdminClient();

const stripe = new Stripe(stripeSecretKey, {
  apiVersion: "2024-06-20",
} as any);

export async function POST(req: Request) {
  const body = await req.text();
  const signature = (await headers()).get("Stripe-Signature") as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      verifiedStripeWebhookSecret
    );
  } catch (error: any) {
      console.log(`❌ Error message: ${error.message}`);
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
  }

  const session = event.data.object as Stripe.Checkout.Session;

  if (event.type === "checkout.session.completed") {
      const subscriptionId = session.subscription as string;
      const workspaceId = session.metadata?.workspace_id;
      
      if (!workspaceId) {
          return new NextResponse("Webhook error: No workspace ID", { status: 400 });
      }

      if (session.mode === "payment") {
          // Increment tokens
          const creditAmount = parseInt(session.metadata?.credit_amount || "0");
          if (creditAmount > 0) {
              await supabaseAdmin.rpc('increment_workspace_tokens', {
                  workspacecode: workspaceId,
                  amount: creditAmount
              });
          }
      }

      if (session.mode === "subscription") {
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          
          await supabaseAdmin.from("subscriptions").upsert({
              id: subscription.id,
              workspace_id: workspaceId,
              status: subscription.status,
              price_id: subscription.items.data[0].price.id,
              quantity: subscription.items.data[0].quantity,
              cancel_at_period_end: subscription.cancel_at_period_end,
              current_period_start: new Date((subscription as any).current_period_start * 1000).toISOString(),
              current_period_end: new Date((subscription as any).current_period_end * 1000).toISOString(),
          });

          // Optional: Update workspace tier
          // await supabaseAdmin.from("workspaces").update({ tier: "pro" }).eq("id", workspaceId)
      }
  }

  if (event.type === "invoice.payment_succeeded") {
    const subscriptionId = session.subscription as string;
    if (subscriptionId) {
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        
        await supabaseAdmin.from("subscriptions").update({
            status: subscription.status,
            current_period_start: new Date((subscription as any).current_period_start * 1000).toISOString(),
            current_period_end: new Date((subscription as any).current_period_end * 1000).toISOString(),
        }).eq('id', subscriptionId);
    }
  }

  if (event.type === "customer.subscription.deleted" || event.type === "customer.subscription.updated") {
       const subscription = event.data.object as Stripe.Subscription;

       await supabaseAdmin.from("subscriptions").update({
            status: subscription.status,
            cancel_at_period_end: subscription.cancel_at_period_end,
        }).eq('id', subscription.id);
  }

  return new NextResponse(null, { status: 200 });
}
