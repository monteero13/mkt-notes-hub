"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const taskSchema = z.object({
  workspace_id: z.string().uuid(),
  campaign_id: z.string().uuid().nullish(),
  client_id: z.string().uuid().nullish(),
  title: z.string().min(1).max(200),
  description: z.string().max(5000).nullish(),
  status: z.enum(["backlog","todo","in_progress","in_review","done","canceled"]),
  priority: z.enum(["urgent","high","medium","low"]),
  assignee_id: z.string().uuid().nullish(),
  due_date: z.string().datetime().nullish(),
  sort_order: z.number().int().optional(),
  parent_id: z.string().uuid().nullish(),
});

export async function createTask(input: unknown) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const parsed = taskSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.errors[0]?.message ?? "Invalid Task Data" };

  // Enforce max subtask depth of 1
  if (parsed.data.parent_id) {
    const { data: parent } = await supabase
      .from("tasks")
      .select("parent_id")
      .eq("id", parsed.data.parent_id)
      .maybeSingle();
    if (parent?.parent_id) return { error: "Subtasks cannot have subtasks" };
  }

  const { data, error } = await supabase
    .from("tasks")
    .insert({ ...parsed.data, created_by: user.id })
    .select()
    .single();

  if (error) return { error: error.message };

  // Notify assignee
  if (parsed.data.assignee_id && parsed.data.assignee_id !== user.id) {
    await supabase.from("notifications").insert({
      workspace_id: parsed.data.workspace_id,
      user_id: parsed.data.assignee_id,
      type: "task_assigned",
      title: "Tactical Assignment Received",
      body: parsed.data.title,
      entity_type: "task",
      entity_id: data.id,
    });
  }

  await supabase.from("activity_logs").insert({
    workspace_id: parsed.data.workspace_id,
    user_id: user.id,
    entity_type: "task",
    entity_id: data.id,
    action: "created",
    metadata: { title: parsed.data.title },
  });

  revalidatePath('/[locale]/planner', 'page');
  revalidatePath('/[locale]/dashboard', 'page');
  return { data };
}

export async function updateTask(id: string, workspaceId: string, input: unknown) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const updateSchema = taskSchema.partial().omit({ workspace_id: true });
  const parsed = updateSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.errors[0]?.message ?? "Invalid Update" };

  const updates: Record<string, unknown> = { ...parsed.data };
  if (parsed.data.status === "done") {
    updates.completed_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from("tasks")
    .update(updates)
    .eq("id", id)
    .eq("workspace_id", workspaceId)
    .select()
    .single();

  if (error) return { error: error.message };
  revalidatePath('/[locale]/planner', 'page');
  revalidatePath('/[locale]/dashboard', 'page');
  return { data };
}

export async function deleteTask(id: string, workspaceId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("tasks")
    .delete()
    .eq("id", id)
    .eq("workspace_id", workspaceId);

  if (error) return { error: error.message };
  revalidatePath('/[locale]/planner', 'page');
  revalidatePath('/[locale]/dashboard', 'page');
  return { success: true };
}

export async function addTaskComment(taskId: string, content: string, workspaceId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  if (!content.trim()) return { error: "Comment cannot be null" };

  const { data, error } = await supabase
    .from("task_comments")
    .insert({ task_id: taskId, user_id: user.id, content: content.trim() })
    .select("*, user:profiles(full_name, avatar_url)")
    .single();

  if (error) return { error: error.message };
  revalidatePath('/[locale]/planner', 'page');
  revalidatePath('/[locale]/dashboard', 'page');
  return { data };
}

export async function updateTaskStatus(id: string, status: string, workspaceId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const updates: Record<string, unknown> = { status };
  if (status === "done") updates.completed_at = new Date().toISOString();

  const { error } = await supabase
    .from("tasks")
    .update(updates)
    .eq("id", id)
    .eq("workspace_id", workspaceId);

  if (error) return { error: error.message };
  revalidatePath('/[locale]/planner', 'page');
  revalidatePath('/[locale]/dashboard', 'page');
  return { success: true };
}
