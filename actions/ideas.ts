"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { assertWithinLimit, PlanLimitError } from "@/lib/limits/plan-limits";

const ideaSchema = z.object({
  workspace_id: z.string().uuid(),
  title: z.string().min(1).max(300),
  description: z.string().max(5000).nullish(),
  category: z.string().max(100).nullish(),
  status: z.enum(["new","in_progress","approved","rejected","archived"]).default("new"),
  priority: z.enum(["low","medium","high","urgent"]).default("medium"),
});

export async function createIdea(input: unknown) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const parsed = ideaSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.errors[0]?.message ?? "Invalid idea data" };

  try {
    await assertWithinLimit(parsed.data.workspace_id, "ideas");
  } catch (e) {
    if (e instanceof PlanLimitError) return { error: e.message, code: e.code };
    throw e;
  }

  const { data, error } = await supabase
    .from("marketing_ideas")
    .insert({ ...parsed.data, created_by: user.id })
    .select()
    .single();

  if (error) return { error: error.message };
  revalidatePath("/ideas");
  return { data };
}

export async function updateIdea(id: string, workspaceId: string, input: unknown) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const updateSchema = ideaSchema.partial().omit({ workspace_id: true });
  const parsed = updateSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.errors[0]?.message ?? "Invalid update" };

  const { data, error } = await supabase
    .from("marketing_ideas")
    .update({ ...parsed.data, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("workspace_id", workspaceId)
    .select()
    .single();

  if (error) return { error: error.message };
  revalidatePath("/ideas");
  return { data };
}

export async function deleteIdea(id: string, workspaceId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { error } = await supabase
    .from("marketing_ideas")
    .delete()
    .eq("id", id)
    .eq("workspace_id", workspaceId);

  if (error) return { error: error.message };
  revalidatePath("/ideas");
  return { success: true };
}
