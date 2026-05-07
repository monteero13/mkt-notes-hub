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

    // 2. If not found, try to find a workspace by short ID (8 chars) or full UUID
    let workspace = null;
    let wsError = null;

    const cleanToken = token.trim().toLowerCase();

    if (cleanToken.length === 36) {
      // Si introducen un UUID completo
      const { data, error } = await supabase
        .from("workspaces")
        .select("id, name, slug")
        .eq("id", cleanToken)
        .maybeSingle();
      workspace = data;
      wsError = error;
    } else if (cleanToken.length === 8) {
      // Si introducen el código de conexión de 8 caracteres (primer segmento del UUID)
      // Usamos el legendario truco matemático de rangos para buscar un prefijo UUID indexado sin castear a texto en base de datos.
      const lowerBound = `${cleanToken}-0000-0000-0000-000000000000`;
      const upperBound = `${cleanToken}-ffff-ffff-ffff-ffffffffffff`;
      
      const { data, error } = await supabase
        .from("workspaces")
        .select("id, name, slug")
        .gte("id", lowerBound)
        .lte("id", upperBound)
        .maybeSingle();
      workspace = data;
      wsError = error;
    }

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
