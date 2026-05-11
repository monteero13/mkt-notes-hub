import Stripe from "stripe";
import { createClient } from "./supabase/server";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

export async function createCheckoutSession(priceId: string) {
  if (!stripe) throw new Error("Stripe is not configured on the server");

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?mode=signup&plan=pro&next=/billing");

  // Get the user's active workspace from cookie to tie the subscription to it
  const cookieStore = await cookies();
  const activeWorkspaceId = cookieStore.get("mkt_active_workspace")?.value;

  let workspaceId = activeWorkspaceId;

  if (!workspaceId) {
    const { data: membership } = await supabase
      .from("workspace_members")
      .select("workspace_id")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .order("joined_at")
      .limit(1)
      .maybeSingle();
    workspaceId = membership?.workspace_id;
  }

  if (!workspaceId) redirect("/onboarding");

  const host =
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

  let checkoutUrl: string | null = null;
  try {
    const session = await stripe.checkout.sessions.create({
      line_items: [{ price: priceId, quantity: 1 }],
      mode: "subscription",
      success_url: `${host}/dashboard?success=true`,
      cancel_url: `${host}/billing?canceled=true`,
      customer_email: user.email,
      metadata: { workspaceId },
      subscription_data: { metadata: { workspaceId, userId: user.id } },
    });

    if (session?.url) checkoutUrl = session.url;
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Stripe error";
    console.error("Stripe Error:", error);
    throw new Error(msg);
  }

  if (checkoutUrl) redirect(checkoutUrl);
}

export async function createPortalSession() {
  if (!stripe) throw new Error("Stripe is not configured on the server");

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Get active workspace ID from cookie
  const cookieStore = await cookies();
  const activeWorkspaceId = cookieStore.get("mkt_active_workspace")?.value;

  let workspaceId = activeWorkspaceId;

  if (!workspaceId) {
    const { data: membership } = await supabase
      .from("workspace_members")
      .select("workspace_id")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .order("joined_at")
      .limit(1)
      .maybeSingle();
    workspaceId = membership?.workspace_id;
  }

  if (!workspaceId) redirect("/billing");

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("workspace_id", workspaceId)
    .maybeSingle();

  if (!subscription?.stripe_customer_id) redirect("/billing");

  const host =
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

  let portalUrl: string | null = null;
  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: subscription.stripe_customer_id,
      return_url: `${host}/billing`,
    });
    if (session.url) portalUrl = session.url;
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Stripe error";
    console.error("Portal Error:", error);
    throw new Error(msg);
  }

  if (portalUrl) redirect(portalUrl);
}

export async function isWorkspacePro(workspaceId: string): Promise<boolean> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("subscriptions")
    .select("plan, status")
    .eq("workspace_id", workspaceId)
    .maybeSingle();
  return data?.plan === "pro" && data?.status === "active";
}
