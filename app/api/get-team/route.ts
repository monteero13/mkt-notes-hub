import { NextResponse } from "next/server";
import { requireUser, handleApiError } from "@/lib/auth/api-guard";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { user } = await requireUser();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId || userId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const supabase = createSupabaseAdminClient();

    const { data: memberships, error: memberError } = await supabase
      .from("workspace_members")
      .select("workspace_id, role")
      .eq("user_id", userId)
      .eq("is_active", true);

    if (memberError) throw memberError;
    if (!memberships || memberships.length === 0) {
      return NextResponse.json({ team: null });
    }

    const membership = memberships[0]!;

    const [{ data: workspaceData, error: wsErr }, { data: members, error: membersErr }] = await Promise.all([
      supabase.from("workspaces").select("*").eq("id", membership.workspace_id).single(),
      supabase.from("workspace_members").select("user_id, role").eq("workspace_id", membership.workspace_id),
    ]);

    if (wsErr) throw wsErr;
    if (membersErr) throw membersErr;

    const userIds = (members ?? []).map((m) => m.user_id);
    const { data: profiles, error: profilesErr } = await supabase
      .from("profiles")
      .select("id, full_name, avatar_url, email")
      .in("id", userIds);

    if (profilesErr) throw profilesErr;

    const fullMembers = (members ?? []).map((m) => ({
      ...m,
      profile: (profiles ?? []).find((p) => p.id === m.user_id) ?? null,
    }));

    return NextResponse.json({ team: { ...workspaceData, role: membership.role, members: fullMembers } });
  } catch (error) {
    return handleApiError(error);
  }
}
