"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { assertWithinLimit, PlanLimitError } from "@/lib/limits/plan-limits";

const CONTENT_CHANNELS = ["instagram","tiktok","linkedin","youtube","twitter","facebook","email","blog","other"] as const;
const CONTENT_STATUSES = ["idea","draft","in_review","approved","scheduled","published","archived"] as const;

const contentSchema = z.object({
  workspace_id: z.string().uuid(),
  campaign_id: z.string().uuid().nullish(),
  client_id: z.string().uuid().nullish(),
  title: z.string().min(1).max(300),
  copy: z.string().max(10000).nullish(),
  cta: z.string().max(500).nullish(),
  hashtags: z.array(z.string()).optional(),
  channel: z.enum(CONTENT_CHANNELS),
  status: z.enum(CONTENT_STATUSES).default("draft"),
  scheduled_at: z.string().datetime().nullish(),
});

export async function createContent(input: unknown) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const parsed = contentSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.errors[0]?.message ?? "Invalid content data" };

  try {
    await assertWithinLimit(parsed.data.workspace_id, "content");
  } catch (e) {
    if (e instanceof PlanLimitError) return { error: e.message, code: e.code };
    throw e;
  }

  const { data, error } = await supabase
    .from("content_items")
    .insert({ ...parsed.data, created_by: user.id })
    .select()
    .single();

  if (error) return { error: error.message };

  await supabase.from("activity_logs").insert({
    workspace_id: parsed.data.workspace_id,
    user_id: user.id,
    entity_type: "content",
    entity_id: data.id,
    action: "created",
    metadata: { title: parsed.data.title },
  });

  revalidatePath("/content");
  revalidatePath("/content");
  return { data };
}

export async function updateContent(id: string, workspaceId: string, input: unknown) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const updateSchema = contentSchema.partial().omit({ workspace_id: true });
  const parsed = updateSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.errors[0]?.message ?? "Invalid update" };

  const updates: Record<string, unknown> = { ...parsed.data };

  if (parsed.data.status === "approved") {
    updates.approved_by = user.id;
  }
  if (parsed.data.status === "published") {
    updates.published_at = updates.published_at ?? new Date().toISOString();
  }

  const { data, error } = await supabase
    .from("content_items")
    .update(updates)
    .eq("id", id)
    .eq("workspace_id", workspaceId)
    .select()
    .single();

  if (error) return { error: error.message };
  revalidatePath("/content");
  revalidatePath("/content");
  return { data };
}

export async function deleteContent(id: string, workspaceId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { error } = await supabase
    .from("content_items")
    .delete()
    .eq("id", id)
    .eq("workspace_id", workspaceId);

  if (error) return { error: error.message };
  revalidatePath("/content");
  revalidatePath("/content");
  return { success: true };
}
