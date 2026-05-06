"use server";

import { createClient as createSupabaseClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { assertWithinLimit, PlanLimitError } from "@/lib/limits/plan-limits";

const clientSchema = z.object({
  workspace_id: z.string().uuid(),
  company_name: z.string().min(1).max(100),
  contact_name: z.string().max(100).nullish(),
  contact_email: z.string().email().nullish().or(z.literal("")),
  contact_phone: z.string().max(30).nullish(),
  website: z.string().url().nullish().or(z.literal("")),
  niche: z.string().max(60).nullish(),
  brand_notes: z.string().max(2000).nullish(),
  monthly_retainer: z.number().positive().nullish(),
  status: z.enum(["active", "inactive", "prospect", "churned"]),
});

export async function createClient(input: unknown) {
  const supabase = await createSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const parsed = clientSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.errors[0]?.message ?? "Invalid input" };

  try {
    await assertWithinLimit(parsed.data.workspace_id, "clients");
  } catch (e) {
    if (e instanceof PlanLimitError) return { error: e.message, code: e.code };
    throw e;
  }

  const { data, error } = await supabase
    .from("clients")
    .insert({
      ...parsed.data,
      contact_email: parsed.data.contact_email || null,
      website: parsed.data.website || null,
      created_by: user.id,
    })
    .select()
    .single();

  if (error) return { error: error.message };

  // Operational Log
  await supabase.from("activity_logs").insert({
    workspace_id: parsed.data.workspace_id,
    user_id: user.id,
    entity_type: "client",
    entity_id: data.id,
    action: "created",
    metadata: { title: parsed.data.company_name },
  });

  revalidatePath("/clients");
  return { data };
}

export async function updateClient(id: string, workspaceId: string, input: unknown) {
  const supabase = await createSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const updateSchema = clientSchema.partial().omit({ workspace_id: true });
  const parsed = updateSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.errors[0]?.message ?? "Invalid input" };

  const { data, error } = await supabase
    .from("clients")
    .update({
      ...parsed.data,
      contact_email: parsed.data.contact_email || null,
      website: parsed.data.website || null,
    })
    .eq("id", id)
    .eq("workspace_id", workspaceId)
    .select()
    .single();

  if (error) return { error: error.message };

  await supabase.from("activity_logs").insert({
    workspace_id: workspaceId,
    user_id: user.id,
    entity_type: "client",
    entity_id: id,
    action: "updated",
    metadata: { title: parsed.data.company_name ?? data.company_name },
  });

  revalidatePath("/clients");
  return { data };
}

export async function deleteClient(id: string, workspaceId: string) {
  const supabase = await createSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { error } = await supabase
    .from("clients")
    .delete()
    .eq("id", id)
    .eq("workspace_id", workspaceId);

  if (error) return { error: error.message };

  revalidatePath("/clients");
  return { success: true };
}
