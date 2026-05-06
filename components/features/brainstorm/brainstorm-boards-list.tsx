"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Brain, Plus, Loader2, Calendar, User, ArrowUpRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import type { BrainstormBoard } from "@/types";
import { cn } from "@/lib/utils/cn";
import { Badge } from "@/components/ui/badge";

interface Props {
  boards: (BrainstormBoard & { created_by_user?: { full_name: string | null } | null })[];
  workspaceId: string;
  campaigns: { id: string; name: string }[];
  userId: string;
}

const BOARD_THEMES = [
  { border: "border-brand/30", bg: "bg-brand/5", text: "text-brand" },
  { border: "border-blue-500/30", bg: "bg-blue-500/5", text: "text-blue-500" },
  { border: "border-emerald-500/30", bg: "bg-emerald-500/5", text: "text-emerald-500" },
  { border: "border-amber-500/30", bg: "bg-amber-500/5", text: "text-amber-500" },
  { border: "border-brand/30", bg: "bg-brand/5", text: "text-brand" },
];

export function BrainstormBoardsList({ boards, workspaceId, campaigns, userId }: Props) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [campaignId, setCampaignId] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function createBoard() {
    if (!title.trim()) return;
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.from("brainstorm_boards").insert({
      workspace_id: workspaceId,
      title: title.trim(),
      description: description.trim() || null,
      campaign_id: campaignId || null,
      created_by: userId,
    });
    setLoading(false);
    if (error) toast.error(error.message);
    else {
      toast.success("Ideation node initialized");
      setOpen(false);
      setTitle("");
      setDescription("");
      setCampaignId("");
      router.refresh();
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="h-8 rounded-sm bg-brand px-4 technical-label text-[10px] text-white hover:opacity-90 gap-2">
              <Plus size={14} /> Initialize Board
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md rounded-sm border-border bg-card p-0 overflow-hidden shadow-2xl">
            <DialogHeader className="bg-accent/5 px-6 py-4 border-b border-border">
              <DialogTitle className="technical-label text-[11px] text-foreground uppercase tracking-widest">Initialize Ideation Board</DialogTitle>
            </DialogHeader>
            <div className="p-6 space-y-6">
              <div className="space-y-2">
                <Label className="technical-label text-[9px] opacity-60 uppercase">Board Codename *</Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="h-11 rounded-sm border-border bg-accent/5 text-[11px] font-bold uppercase tracking-tight"
                  placeholder="STRATEGIC IDEATION"
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <Label className="technical-label text-[9px] opacity-60 uppercase">Scope Parameters</Label>
                <Input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="h-11 rounded-sm border-border bg-accent/5 text-[11px] font-bold"
                  placeholder="Mission objectives..."
                />
              </div>
              {campaigns.length > 0 && (
                <div className="space-y-2">
                  <Label className="technical-label text-[9px] opacity-60 uppercase">Link to Initiative</Label>
                  <Select value={campaignId} onValueChange={setCampaignId}>
                    <SelectTrigger className="h-10 rounded-sm border-border bg-accent/5 text-[10px] font-black uppercase tracking-widest">
                      <SelectValue placeholder="SYSTEM LEVEL" />
                    </SelectTrigger>
                    <SelectContent className="rounded-sm border-border bg-card">
                      {campaigns.map((c) => <SelectItem key={c.id} value={c.id} className="technical-label text-[9px] uppercase">{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="ghost" onClick={() => setOpen(false)} className="h-10 rounded-sm technical-label text-[10px] hover:bg-accent/5">Abort</Button>
                <Button onClick={createBoard} disabled={loading || !title.trim()} className="h-10 rounded-sm bg-brand px-8 technical-label text-[10px] text-white">
                  {loading && <Loader2 size={14} className="mr-2 animate-spin" />}
                  Deploy Board
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {boards.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-sm border border-dashed border-border bg-accent/5 py-24">
          <Brain size={32} className="mb-4 text-muted-foreground opacity-20" />
          <div className="technical-label text-[11px] font-black uppercase tracking-widest text-muted-foreground">Zero Ideation Nodes</div>
          <p className="mt-2 text-[10px] text-muted-foreground/40 uppercase tracking-widest">Initialize a board to begin collaborative strategy</p>
        </div>
      ) : (
        <AnimatePresence>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {boards.map((board, i) => {
              const theme = BOARD_THEMES[i % BOARD_THEMES.length]!;
              return (
                <motion.div
                  key={board.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                >
                  <Link href={`/brainstorm/${board.id}`}>
                    <div className={cn(
                      "group relative flex flex-col h-48 rounded-sm border p-6 transition-all hover:border-brand hover:shadow-xl active:scale-[0.98] overflow-hidden",
                      theme.bg, theme.border
                    )}>
                      <div className="mb-4 flex items-start justify-between">
                        <div className={cn("h-8 w-8 rounded-sm flex items-center justify-center border", theme.border)}>
                          <Brain size={16} className={theme.text} />
                        </div>
                        <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-40 transition-opacity" />
                      </div>

                      <h3 className="text-[13px] font-black tracking-tight text-foreground uppercase group-hover:text-brand transition-colors line-clamp-1">
                        {board.title}
                      </h3>
                      {board.description && (
                        <p className="mt-2 text-[10px] text-muted-foreground uppercase tracking-widest font-bold line-clamp-2 opacity-60">
                          {board.description}
                        </p>
                      )}

                      <div className="mt-auto flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {board.created_by_user?.full_name && (
                            <span className="flex items-center gap-1.5 technical-label text-[8px] opacity-40 uppercase">
                              <User size={10} /> {board.created_by_user.full_name.split(' ')[0]}
                            </span>
                          )}
                          <span className="flex items-center gap-1.5 technical-label text-[8px] opacity-40 uppercase">
                            <Calendar size={10} /> {format(new Date(board.created_at), "MMM d")}
                          </span>
                        </div>
                        <Badge variant="outline" className="technical-label text-[7px] px-1.5 py-0 rounded-sm border opacity-40">NODE-{(i + 1).toString().padStart(3, '0')}</Badge>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </AnimatePresence>
      )}
    </div>
  );
}
