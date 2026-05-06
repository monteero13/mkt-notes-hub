"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { assertWithinLimit, PlanLimitError } from "@/lib/limits/plan-limits";

const campaignSchema = z.object({
  workspace_id: z.string().uuid(),
  client_id: z.string().uuid().nullish(),
  name: z.string().min(1).max(150),
  description: z.string().max(2000).nullish(),
  objective: z.string().max(500).nullish(),
  platform: z.enum(["instagram","tiktok","youtube","linkedin","facebook","twitter","email","blog","google_ads","meta_ads","other"]).nullish(),
  status: z.enum(["draft","active","paused","completed","archived"]),
  budget: z.number().positive().nullish(),
  start_date: z.string().nullish(),
  end_date: z.string().nullish(),
  kpi_targets: z.record(z.unknown()).optional(),
});

export async function createCampaign(input: unknown) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const parsed = campaignSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.errors[0]?.message ?? "Invalid input" };

  try {
    await assertWithinLimit(parsed.data.workspace_id, "campaigns");
  } catch (e) {
    if (e instanceof PlanLimitError) return { error: e.message, code: e.code };
    throw e;
  }

  const { data, error } = await supabase
    .from("campaigns")
    .insert({ ...parsed.data, owner_id: user.id })
    .select()
    .single();

  if (error) return { error: error.message };

  await supabase.from("activity_logs").insert({
    workspace_id: parsed.data.workspace_id,
    user_id: user.id,
    entity_type: "campaign",
    entity_id: data.id,
    action: "created",
    metadata: { title: parsed.data.name },
  });

  revalidatePath("/campaigns");
  return { data };
}

export async function updateCampaign(id: string, workspaceId: string, input: unknown) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const updateSchema = campaignSchema.partial().omit({ workspace_id: true });
  const parsed = updateSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.errors[0]?.message ?? "Invalid input" };

  const { data, error } = await supabase
    .from("campaigns")
    .update(parsed.data)
    .eq("id", id)
    .eq("workspace_id", workspaceId)
    .select()
    .single();

  if (error) return { error: error.message };
  revalidatePath("/campaigns");
  return { data };
}

export async function deleteCampaign(id: string, workspaceId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("campaigns")
    .delete()
    .eq("id", id)
    .eq("workspace_id", workspaceId);

  if (error) return { error: error.message };
  revalidatePath("/campaigns");
  return { success: true };
}
