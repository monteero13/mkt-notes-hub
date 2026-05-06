import "server-only";
import { createClient } from "@/lib/supabase/server";

export const FREE_LIMITS = {
  workspaces: 1,
  members: 3,
  clients: 3,
  campaigns: 3,
  ideas: 10,
  content: 10,
  objectives: 5,
  storage_mb: 1024,
} as const;

export type LimitedResource = keyof typeof FREE_LIMITS;

export class PlanLimitError extends Error {
  readonly code = "LIMIT_EXCEEDED";
  constructor(public readonly resource: LimitedResource) {
    super(`Free plan limit reached for ${resource}. Upgrade to Pro to continue.`);
  }
}

const RESOURCE_TABLE: Record<LimitedResource, string> = {
  workspaces: "workspaces",
  members: "workspace_members",
  clients: "clients",
  campaigns: "campaigns",
  ideas: "marketing_ideas",
  content: "content_items",
  objectives: "objectives",
  storage_mb: "resources",
};

export async function isPro(workspaceId: string): Promise<boolean> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("subscriptions")
    .select("plan, status")
    .eq("workspace_id", workspaceId)
    .maybeSingle();
  return data?.plan === "pro" && data?.status === "active";
}

export async function assertWithinLimit(
  workspaceId: string,
  resource: LimitedResource
): Promise<void> {
  if (resource === "workspaces" || resource === "storage_mb") return;

  const pro = await isPro(workspaceId);
  if (pro) return;

  const table = RESOURCE_TABLE[resource];
  const supabase = await createClient();
  const { count } = await supabase
    .from(table)
    .select("*", { count: "exact", head: true })
    .eq("workspace_id", workspaceId);

  const limit = FREE_LIMITS[resource];
  if (count !== null && count >= limit) {
    throw new PlanLimitError(resource);
  }
}
