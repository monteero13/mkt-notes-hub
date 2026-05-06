"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { WorkspaceRole } from "@/types";

const CHANGEABLE_ROLES: WorkspaceRole[] = ["admin", "manager", "editor", "viewer", "client_guest"];

export async function updateMemberRole(
  workspaceId: string,
  targetUserId: string,
  newRole: WorkspaceRole
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  if (!CHANGEABLE_ROLES.includes(newRole)) {
    return { error: "Cannot assign owner role" };
  }

  // Caller must be owner or admin
  const { data: callerMember } = await supabase
    .from("workspace_members")
    .select("role")
    .eq("workspace_id", workspaceId)
    .eq("user_id", user.id)
    .eq("is_active", true)
    .maybeSingle();

  if (!callerMember || (callerMember.role !== "owner" && callerMember.role !== "admin")) {
    return { error: "Insufficient permissions" };
  }

  // Prevent demoting the workspace owner
  const { data: targetMember } = await supabase
    .from("workspace_members")
    .select("role")
    .eq("workspace_id", workspaceId)
    .eq("user_id", targetUserId)
    .eq("is_active", true)
    .maybeSingle();

  if (!targetMember) return { error: "Member not found" };
  if (targetMember.role === "owner") return { error: "Cannot change the workspace owner's role" };

  const { error } = await supabase
    .from("workspace_members")
    .update({ role: newRole })
    .eq("workspace_id", workspaceId)
    .eq("user_id", targetUserId);

  if (error) return { error: error.message };

  revalidatePath("/team");
  revalidatePath("/[locale]/(app)/team", "page");
  return { success: true };
}

export async function removeMember(workspaceId: string, targetUserId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  if (targetUserId === user.id) return { error: "Cannot remove yourself" };

  // Caller must be owner or admin
  const { data: callerMember } = await supabase
    .from("workspace_members")
    .select("role")
    .eq("workspace_id", workspaceId)
    .eq("user_id", user.id)
    .eq("is_active", true)
    .maybeSingle();

  if (!callerMember || (callerMember.role !== "owner" && callerMember.role !== "admin")) {
    return { error: "Insufficient permissions" };
  }

  // Prevent removing the workspace owner
  const { data: targetMember } = await supabase
    .from("workspace_members")
    .select("role")
    .eq("workspace_id", workspaceId)
    .eq("user_id", targetUserId)
    .eq("is_active", true)
    .maybeSingle();

  if (!targetMember) return { error: "Member not found" };
  if (targetMember.role === "owner") return { error: "Cannot remove the workspace owner" };

  const { error } = await supabase
    .from("workspace_members")
    .update({ is_active: false })
    .eq("workspace_id", workspaceId)
    .eq("user_id", targetUserId);

  if (error) return { error: error.message };

  revalidatePath("/team");
  revalidatePath("/[locale]/(app)/team", "page");
  return { success: true };
}
