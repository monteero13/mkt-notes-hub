'use server';

import { createPortalSession as createPortal, createCheckoutSession as createCheckout } from './stripe';
import { createSupabaseAdminClient } from './supabase/admin';

export async function handleCreatePortalSession() {
  return await createPortal();
}

export async function handleCreateCheckoutSession(priceId: string) {
  return await createCheckout(priceId);
}

/**
 * Simulates upgrading a workspace to a premium plan by upserting a subscription row
 * with administrative privileges (bypassing Client-side RLS limits).
 */
export async function simulateUpgradeToPro(workspaceId: string, plan: 'pro' | 'enterprise', interval: 'monthly' | 'yearly') {
  if (!workspaceId) throw new Error("Workspace ID is required");

  const adminClient = createSupabaseAdminClient();
  const randomString = Math.random().toString(36).substring(2, 11);
  const currentPeriodStart = new Date();
  const currentPeriodEnd = new Date();
  
  if (interval === 'monthly') {
    currentPeriodEnd.setDate(currentPeriodStart.getDate() + 30);
  } else {
    currentPeriodEnd.setDate(currentPeriodStart.getDate() + 365);
  }

  const { data, error } = await adminClient
    .from('subscriptions')
    .upsert({
      workspace_id: workspaceId,
      plan: plan,
      status: 'active',
      stripe_customer_id: `cus_mock_${randomString}`,
      stripe_subscription_id: `sub_mock_${randomString}`,
      stripe_price_id: interval === 'monthly' ? 'price_pro_monthly_mock' : 'price_pro_yearly_mock',
      current_period_start: currentPeriodStart.toISOString(),
      current_period_end: currentPeriodEnd.toISOString(),
      cancel_at_period_end: false,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'workspace_id' })
    .select()
    .single();

  if (error) {
    console.error("Error upserting mock subscription:", error);
    throw new Error(error.message);
  }

  return { success: true, data };
}

/**
 * Simulates canceling a premium plan by removing the subscription row
 * for the given workspace, returning it back to the Free plan.
 */
export async function simulateCancelSubscription(workspaceId: string) {
  if (!workspaceId) throw new Error("Workspace ID is required");

  const adminClient = createSupabaseAdminClient();
  const { error } = await adminClient
    .from('subscriptions')
    .delete()
    .eq('workspace_id', workspaceId);

  if (error) {
    console.error("Error deleting mock subscription:", error);
    throw new Error(error.message);
  }

  return { success: true };
}
