import { createClient } from "@/lib/supabase/server";
import { getDefaultWorkspaceId } from "@/lib/utils/workspace-server";
import { redirect, notFound } from "next/navigation";
import { BrainstormCanvas } from "@/components/features/brainstorm/brainstorm-canvas";
import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, Brain } from "lucide-react";

export const metadata: Metadata = { title: "Collaborative Lab | MKT.NOTES" };

export default async function BoardPage({ params }: { params: Promise<{ boardId: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const workspaceId = await getDefaultWorkspaceId(user.id);
  if (!workspaceId) redirect("/onboarding");

  const { boardId } = await params;

  const { data: board } = await supabase
    .from("brainstorm_boards")
    .select("*")
    .eq("id", boardId)
    .eq("workspace_id", workspaceId)
    .single();

  if (!board) notFound();

  const { data: notes } = await supabase
    .from("brainstorm_notes")
    .select("*, author:profiles(id, full_name, avatar_url), votes_data:brainstorm_votes(user_id)")
    .eq("board_id", boardId)
    .order("created_at");

  const notesWithVoteStatus = (notes ?? []).map((n: any) => ({
    ...n,
    user_voted: (n.votes_data ?? []).some((v: any) => v.user_id === user.id),
    votes: (n.votes_data ?? []).length,
  }));

  return (
    <div className="flex h-full flex-col bg-background">
      {/* Top Operational Header */}
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-border px-4 sm:px-8">
        <div className="flex items-center gap-4">
          <div className="technical-label text-[11px] text-foreground">Ideation Lab</div>
          <div className="h-4 w-[1px] bg-border" />
          <div className="flex items-center gap-2 text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
            <Link href="/brainstorm" className="hover:text-brand transition-colors">Ideation Index</Link>
            <ChevronRight size={12} className="opacity-60" />
            <span className="text-brand">{board.title}</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-sm bg-success animate-pulse" />
            <span className="technical-label text-[9px] uppercase tracking-widest">Realtime Sync Active</span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col min-h-0">
        <div className="px-4 sm:px-8 py-4 sm:py-6 border-b border-border/50">
          <div className="flex flex-col gap-1">
            <div className="technical-label text-brand flex items-center gap-2">
              <Brain size={12} /> Collaborative Node
            </div>
            <div className="flex items-end gap-4">
              <h1 className="text-3xl font-light tracking-tight" style={{ fontFamily: "var(--font-clash), sans-serif" }}>{board.title}</h1>
              {board.description && (
                <span className="technical-label text-[10px] opacity-40 mb-1 uppercase tracking-[0.2em]">
                  // {board.description}
                </span>
              )}
            </div>
          </div>
        </div>
        
        <BrainstormCanvas board={board} initialNotes={notesWithVoteStatus} userId={user.id} />
      </div>
    </div>
  );
}
