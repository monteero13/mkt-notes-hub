import "server-only";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export async function getDefaultWorkspaceId(userId: string) {
  const supabase = await createClient();
  const cookieStore = await cookies();
  const activeWorkspaceCookie = cookieStore.get("mkt_active_workspace")?.value;

  // 1. Si hay una cookie de workspace activo, usarla (Sincronización Cliente-Servidor)
  if (activeWorkspaceCookie) {
    const { data: membership } = await supabase
      .from("workspace_members")
      .select("workspace_id")
      .eq("user_id", userId)
      .eq("workspace_id", activeWorkspaceCookie)
      .eq("is_active", true)
      .maybeSingle();

    if (membership) return membership.workspace_id;
  }

  // 2. Fallback al workspace más reciente si no hay cookie o la cookie es inválida
  const { data, error } = await supabase
    .from("workspace_members")
    .select("workspace_id")
    .eq("user_id", userId)
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(1);

  if (error || !data || data.length === 0) return null;
  return data[0].workspace_id;
}

export async function requireWorkspaceMembership(workspaceId: string, userId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("workspace_members")
    .select("role, is_active")
    .eq("workspace_id", workspaceId)
    .eq("user_id", userId)
    .single();

  if (!data || !data.is_active) {
    throw new Error("Not a workspace member");
  }
  return data.role;
}
