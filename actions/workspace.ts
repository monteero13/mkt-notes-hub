"use server";

import { createClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export async function createWorkspace(name: string) {
  const supabaseUser = await createClient();
  const { data: { user } } = await supabaseUser.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  try {
    const adminSupabase = createSupabaseAdminClient();
    const slug = name.toLowerCase().replace(/\s+/g, '-');
    const uniqueSlug = `${slug}-${Math.random().toString(36).substring(2, 7)}`;

    // 1. Crear el workspace con privilegios de administrador
    const { data: ws, error: wsError } = await adminSupabase
      .from('workspaces')
      .insert({
        name,
        owner_id: user.id,
        slug: uniqueSlug
      })
      .select()
      .single();

    if (wsError) throw wsError;

    // 2. Asegurar que el perfil del usuario exista en profiles (evita fallos de foreign key)
    const fullNameFallback = user.user_metadata?.full_name || user.email?.split('@')[0] || "Usuario";
    const { error: profileError } = await adminSupabase
      .from('profiles')
      .upsert({
        id: user.id,
        email: user.email,
        full_name: fullNameFallback,
        avatar_url: user.user_metadata?.avatar_url || null,
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' });

    if (profileError) console.error("Error ensuring user profile exists:", profileError);

    // 3. Crear de forma explícita la membresía del owner en workspace_members
    // Usamos upsert para evitar cualquier conflicto si el trigger de base de datos también se llega a ejecutar.
    const { error: memberError } = await adminSupabase
      .from('workspace_members')
      .upsert({
        workspace_id: ws.id,
        user_id: user.id,
        role: 'owner',
        is_active: true
      }, { onConflict: 'workspace_id,user_id' });

    if (memberError) throw memberError;

    // 3. Crear el registro de suscripción gratuita activa
    const { error: subError } = await adminSupabase
      .from('subscriptions')
      .upsert({
        workspace_id: ws.id,
        plan: 'free',
        status: 'active'
      }, { onConflict: 'workspace_id' });

    if (subError) throw subError;

    revalidatePath("/team");
    revalidatePath("/[locale]/(app)/team", "page");
    return { success: true, workspace: ws };
  } catch (error: any) {
    console.error("Error creating workspace robustly:", error);
    return { error: error.message || "Failed to create workspace" };
  }
}

export async function deleteWorkspace(workspaceId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  // Check if user is owner
  const { data: member } = await supabase
    .from("workspace_members")
    .select("role")
    .eq("workspace_id", workspaceId)
    .eq("user_id", user.id)
    .eq("role", "owner")
    .maybeSingle();

  if (!member) {
    return { error: "Only the workspace owner can delete the workspace" };
  }

  // Delete the workspace (cascading deletes should handle the rest if set up in DB, 
  // otherwise we might need to delete related records first)
  const { error } = await supabase
    .from("workspaces")
    .delete()
    .eq("id", workspaceId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/team");
  revalidatePath("/[locale]/(app)/team", "page");
  return { success: true };
}

export async function repairWorkspacesMembership() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  try {
    const adminSupabase = createSupabaseAdminClient();

    // 1. Encontrar workspaces de los que el usuario es dueño real
    const { data: ownedWorkspaces, error: wsError } = await adminSupabase
      .from('workspaces')
      .select('id, name')
      .eq('owner_id', user.id);

    if (wsError) throw wsError;
    if (!ownedWorkspaces || ownedWorkspaces.length === 0) {
      return { success: true, repairedCount: 0 };
    }

    // 2. Asegurar que el perfil del usuario exista en profiles
    const fullNameFallback = user.user_metadata?.full_name || user.email?.split('@')[0] || "Usuario";
    const { error: profileError } = await adminSupabase
      .from('profiles')
      .upsert({
        id: user.id,
        email: user.email,
        full_name: fullNameFallback,
        avatar_url: user.user_metadata?.avatar_url || null,
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' });

    if (profileError) throw profileError;

    let repairedCount = 0;
    // 3. Asegurar la membresía de owner y suscripción para cada workspace
    for (const ws of ownedWorkspaces) {
      const { error: memberError } = await adminSupabase
        .from('workspace_members')
        .upsert({
          workspace_id: ws.id,
          user_id: user.id,
          role: 'owner',
          is_active: true
        }, { onConflict: 'workspace_id,user_id' });

      if (memberError) console.error(`Error repairing member for workspace ${ws.id}:`, memberError);
      else repairedCount++;

      // Asegurar suscripción
      await adminSupabase
        .from('subscriptions')
        .upsert({
          workspace_id: ws.id,
          plan: 'free',
          status: 'active'
        }, { onConflict: 'workspace_id' });
    }

    revalidatePath("/team");
    revalidatePath("/[locale]/(app)/team", "page");
    return { success: true, repairedCount };
  } catch (error: any) {
    console.error("Error repairing workspace memberships:", error);
    return { error: error.message || "Failed to repair memberships" };
  }
}
