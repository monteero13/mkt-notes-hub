import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!stripe) return new Response("Stripe not configured", { status: 500 });

  const signature = request.headers.get("stripe-signature");
  if (!signature) return new Response("No signature", { status: 400 });

  let event: Stripe.Event;
  const rawBody = await request.text();

  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return new Response(`Webhook Error: ${msg}`, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();

  async function upsertSubscription(
    workspaceId: string,
    fields: {
      stripe_customer_id?: string;
      stripe_subscription_id?: string;
      stripe_price_id?: string;
      plan?: "free" | "pro" | "enterprise";
      status?: "active" | "past_due" | "canceled" | "trialing" | "paused";
      current_period_start?: string;
      current_period_end?: string;
      cancel_at_period_end?: boolean;
      trial_end?: string | null;
    }
  ) {
    await supabase
      .from("subscriptions")
      .update({ ...fields, updated_at: new Date().toISOString() })
      .eq("workspace_id", workspaceId);
  }

  async function workspaceFromCustomer(customerId: string): Promise<string | null> {
    const { data } = await supabase
      .from("subscriptions")
      .select("workspace_id")
      .eq("stripe_customer_id", customerId)
      .maybeSingle();
    return data?.workspace_id ?? null;
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const workspaceId = session.metadata?.workspaceId;
        if (!workspaceId) break;

        const stripeSubId = typeof session.subscription === "string"
          ? session.subscription
          : session.subscription?.id;

        const customerId = typeof session.customer === "string"
          ? session.customer
          : session.customer?.id;

        let priceId: string | undefined;
        if (stripeSubId) {
          const sub = await stripe.subscriptions.retrieve(stripeSubId);
          priceId = sub.items.data[0]?.price.id;
          await upsertSubscription(workspaceId, {
            stripe_customer_id: customerId,
            stripe_subscription_id: stripeSubId,
            stripe_price_id: priceId,
            plan: "pro",
            status: sub.status as "active" | "trialing",
            current_period_start: new Date(sub.current_period_start * 1000).toISOString(),
            current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
            cancel_at_period_end: sub.cancel_at_period_end,
            trial_end: sub.trial_end ? new Date(sub.trial_end * 1000).toISOString() : null,
          });
        }
        break;
      }

      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
        const workspaceId = await workspaceFromCustomer(customerId);
        if (!workspaceId) break;

        await upsertSubscription(workspaceId, {
          stripe_subscription_id: sub.id,
          stripe_price_id: sub.items.data[0]?.price.id,
          plan: sub.status === "active" || sub.status === "trialing" ? "pro" : "free",
          status: sub.status as "active" | "past_due" | "canceled" | "trialing",
          current_period_start: new Date(sub.current_period_start * 1000).toISOString(),
          current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
          cancel_at_period_end: sub.cancel_at_period_end,
          trial_end: sub.trial_end ? new Date(sub.trial_end * 1000).toISOString() : null,
        });
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
        const workspaceId = await workspaceFromCustomer(customerId);
        if (!workspaceId) break;

        await upsertSubscription(workspaceId, { plan: "free", status: "canceled", cancel_at_period_end: false });
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = typeof invoice.customer === "string" ? invoice.customer : invoice.customer?.id;
        if (!customerId) break;
        const workspaceId = await workspaceFromCustomer(customerId);
        if (!workspaceId) break;

        await upsertSubscription(workspaceId, { status: "active", plan: "pro" });
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = typeof invoice.customer === "string" ? invoice.customer : invoice.customer?.id;
        if (!customerId) break;
        const workspaceId = await workspaceFromCustomer(customerId);
        if (!workspaceId) break;

        await upsertSubscription(workspaceId, { status: "past_due" });
        break;
      }

      case "customer.subscription.trial_will_end": {
        // Optionally send an email reminder — no DB change needed here
        console.log(`[Stripe] Trial ending soon for subscription ${(event.data.object as Stripe.Subscription).id}`);
        break;
      }

      default:
        break;
    }
  } catch (err) {
    console.error("[Stripe Webhook] Handler error:", err);
    return new Response("Internal error processing webhook", { status: 500 });
  }

  return NextResponse.json({ received: true });
}
