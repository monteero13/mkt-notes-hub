import { NextResponse } from "next/server";
import { requireUser, handleApiError } from "@/lib/auth/api-guard";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const { user } = await requireUser();
    const { userId, fullName, avatarUrl } = await request.json();

    if (userId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from("profiles")
      .upsert({ id: userId, full_name: fullName, avatar_url: avatarUrl, updated_at: new Date().toISOString() })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, profile: data });
  } catch (error) {
    return handleApiError(error);
  }
}
