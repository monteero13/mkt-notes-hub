import { createClient } from "@/lib/supabase/server";
import { getDefaultWorkspaceId } from "@/lib/utils/workspace-server";
import { redirect } from "next/navigation";
import { BrainstormBoardsList } from "@/components/features/brainstorm/brainstorm-boards-list";
import type { Metadata } from "next";
import { ChevronRight } from "lucide-react";

export const metadata: Metadata = { title: "Brainstorm Lab | MKT.NOTES" };

export default async function BrainstormPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const workspaceId = await getDefaultWorkspaceId(user.id);
  if (!workspaceId) redirect("/onboarding");

  const [{ data: boards }, { data: campaigns }] = await Promise.all([
    supabase
      .from("brainstorm_boards")
      .select("*, created_by_user:profiles(full_name)")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false }),
    supabase.from("campaigns").select("id, name").eq("workspace_id", workspaceId),
  ]);

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Top Operational Header */}
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-border px-4 sm:px-8">
        <div className="flex items-center gap-4">
          <div className="technical-label text-[11px] text-foreground">Ideation Unit</div>
          <div className="h-4 w-[1px] bg-border" />
          <div className="flex items-center gap-2 text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
            <span>Collaborative Lab</span>
            <ChevronRight size={12} className="opacity-60" />
            <span className="text-brand">Board Index</span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 lg:space-y-8">
        <div className="flex flex-col gap-1">
          <div className="technical-label text-brand">Brainstorm Engine Online</div>
          <div className="flex items-end gap-4">
            <h1 className="text-4xl font-light tracking-tight" style={{ fontFamily: "var(--font-clash), sans-serif" }}>Ideation Lab</h1>
            <span className="technical-label text-[10px] opacity-40 mb-1.5 uppercase tracking-[0.2em]">
              [{boards?.length ?? 0} ACTIVE BOARDS]
            </span>
          </div>
        </div>

        <BrainstormBoardsList 
          boards={boards ?? []} 
          workspaceId={workspaceId} 
          campaigns={campaigns ?? []} 
          userId={user.id} 
        />
      </div>
    </div>
  );
}
