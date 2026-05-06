import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { handleApiError } from "@/lib/auth/api-guard";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("code");

    if (!token) {
      return NextResponse.json({ error: "Missing invite token" }, { status: 400 });
    }

    const supabase = createSupabaseAdminClient();
    
    // 1. Try to find a specific invite by token
    const { data: invite, error: inviteError } = await supabase
      .from("workspace_invites")
      .select("id, workspace_id, email, role, status, expires_at, workspace:workspaces(id, name, slug)")
      .eq("token", token)
      .maybeSingle();

    if (inviteError) throw inviteError;

    if (invite) {
      if (invite.status !== "pending") {
        return NextResponse.json({ error: "This invite has already been used or revoked" }, { status: 410 });
      }
      if (new Date(invite.expires_at) < new Date()) {
        return NextResponse.json({ error: "This invite link has expired" }, { status: 410 });
      }
      return NextResponse.json({ team: invite.workspace, invite: { id: invite.id, email: invite.email, role: invite.role } });
    }

    // 2. If not found, try to find a workspace by short ID (8 chars)
    // Note: In production, you'd want a dedicated join_code column for security and collisions.
    const { data: workspace, error: wsError } = await supabase
      .from("workspaces")
      .select("id, name, slug")
      .ilike("id", `${token}%`)
      .maybeSingle();

    if (wsError) throw wsError;

    if (workspace) {
      return NextResponse.json({ 
        team: workspace, 
        invite: { id: 'general', email: 'general', role: 'admin' } 
      });
    }

    return NextResponse.json({ error: "Invalid or expired invite link" }, { status: 404 });
  } catch (error) {
    return handleApiError(error);
  }
}
