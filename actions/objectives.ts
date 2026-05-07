"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { assertWithinLimit, PlanLimitError } from "@/lib/limits/plan-limits";

const objectiveSchema = z.object({
  workspace_id: z.string().uuid(),
  title: z.string().min(1).max(300),
  description: z.string().max(5000).nullish(),
  kpi: z.string().max(200).nullish(),
  status: z.enum(["active","completed","paused","canceled"]).default("active"),
  target_value: z.number().nullish(),
  current_value: z.number().nullish(),
  unit: z.string().max(50).nullish(),
  due_date: z.string().nullish(),
  client_id: z.string().uuid().nullish(),
  campaign_id: z.string().uuid().nullish(),
});

export async function createObjective(input: unknown) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const parsed = objectiveSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.errors[0]?.message ?? "Invalid objective data" };

  try {
    await assertWithinLimit(parsed.data.workspace_id, "objectives");
  } catch (e) {
    if (e instanceof PlanLimitError) return { error: e.message, code: e.code };
    throw e;
  }

  const { data, error } = await supabase
    .from("objectives")
    .insert({ ...parsed.data, created_by: user.id })
    .select()
    .single();

  if (error) return { error: error.message };
  revalidatePath("/objetivos");
  revalidatePath("/objectives");
  return { data };
}

export async function updateObjective(id: string, workspaceId: string, input: unknown) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const updateSchema = objectiveSchema.partial().omit({ workspace_id: true });
  const parsed = updateSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.errors[0]?.message ?? "Invalid update" };

  const updates: Record<string, unknown> = { ...parsed.data, updated_at: new Date().toISOString() };
  if (parsed.data.status === "completed") {
    updates.completed_at = updates.completed_at ?? new Date().toISOString();
  }

  const { data, error } = await supabase
    .from("objectives")
    .update(updates)
    .eq("id", id)
    .eq("workspace_id", workspaceId)
    .select()
    .single();

  if (error) return { error: error.message };
  revalidatePath("/objetivos");
  revalidatePath("/objectives");
  return { data };
}

export async function deleteObjective(id: string, workspaceId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { error } = await supabase
    .from("objectives")
    .delete()
    .eq("id", id)
    .eq("workspace_id", workspaceId);

  if (error) return { error: error.message };
  revalidatePath("/objetivos");
  revalidatePath("/objectives");
  return { success: true };
}
