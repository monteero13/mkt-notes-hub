import { NextResponse } from "next/server";
import { requireUser, requireMember, handleApiError } from "@/lib/auth/api-guard";
import { assertWithinLimit, PlanLimitError } from "@/lib/limits/plan-limits";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

const ENTITY_TABLE: Record<string, { table: string; resource: "campaigns" | "ideas" | "content" | "objectives" }> = {
  campaign: { table: "campaigns", resource: "campaigns" },
  content: { table: "content_items", resource: "content" },
  idea: { table: "marketing_ideas", resource: "ideas" },
  objective: { table: "objectives", resource: "objectives" },
};

export async function POST(req: Request) {
  try {
    const { user } = await requireUser();
    const body = await req.json();
    const { type, data, workspaceId } = body;

    if (!workspaceId || !type) {
      return NextResponse.json({ error: "Missing workspaceId or type" }, { status: 400 });
    }

    const entityConfig = ENTITY_TABLE[type as string];
    if (!entityConfig) {
      return NextResponse.json({ error: "Invalid entity type" }, { status: 400 });
    }

    await requireMember(workspaceId, user.id, ["owner", "admin", "manager", "editor"]);
    await assertWithinLimit(workspaceId, entityConfig.resource);

    const supabase = createSupabaseAdminClient();
    const { data: created, error } = await supabase
      .from(entityConfig.table)
      .insert({ ...data, workspace_id: workspaceId })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, item: created });
  } catch (error) {
    if (error instanceof PlanLimitError) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: 402 });
    }
    return handleApiError(error);
  }
}
