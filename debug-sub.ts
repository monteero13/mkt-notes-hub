import { createClient, createAdminClient } from "./lib/supabase/server";
import { getDefaultWorkspaceId } from "./lib/utils/workspace-server";

export async function debugSubscription() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return "No user logged in";

  const workspaceId = await getDefaultWorkspaceId(user.id);
  if (!workspaceId) return "No active workspace found";

  const adminSupabase = await createAdminClient();
  const { data: workspace } = await adminSupabase
    .from("workspaces")
    .select("name, plan")
    .eq("id", workspaceId)
    .single();

  const { data: subscription } = await adminSupabase
    .from("subscriptions")
    .select("*")
    .eq("workspace_id", workspaceId)
    .maybeSingle();

  return {
    userEmail: user.email,
    workspaceName: workspace?.name,
    workspacePlan: workspace?.plan, // Plan denormalized in workspaces table (if exists)
    subscriptionPlan: subscription?.plan,
    subscriptionStatus: subscription?.status,
    workspaceId
  };
}
