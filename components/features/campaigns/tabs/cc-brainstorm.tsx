"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BrainstormBoard } from "@/types";
import { Lightbulb, ArrowUpRight, Plus, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import Link from "next/link";
import { format } from "date-fns";

interface Props {
  boards: BrainstormBoard[];
  locale: string;
  workspaceId: string;
  campaignId: string;
}

export function CcBrainstorm({ boards, locale, workspaceId, campaignId }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  async function createBoard() {
    if (!title.trim()) return;
    setLoading(true);
    const supabase = createClient();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Debes iniciar sesión");

      const { error } = await supabase.from("brainstorm_boards").insert({
        workspace_id: workspaceId,
        title: title.trim(),
        description: description.trim() || null,
        campaign_id: campaignId,
        created_by: user.id,
      });

      if (error) throw error;

      toast.success("Ideation node initialized");
      setOpen(false);
      setTitle("");
      setDescription("");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Error al crear tablero");
    } finally {
      setLoading(false);
    }
  }

  if (boards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center rounded-xl border border-dashed border-border space-y-4">
        <Lightbulb size={32} className="text-muted-foreground/20" />
        <div>
          <p className="text-sm font-semibold text-muted-foreground">Sin tableros de brainstorm</p>
          <p className="text-xs text-muted-foreground/50 mt-1">
            Comienza una sesión de ideación colaborativa para esta campaña.
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <button className="flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white bg-brand rounded-sm hover:opacity-90 active:scale-95 transition-all">
              <Plus size={14} />
              Iniciar Brainstorm
            </button>
          </DialogTrigger>
          <DialogContent className="max-w-md rounded-xl border border-border bg-card p-0 overflow-hidden shadow-2xl">
            <DialogHeader className="bg-accent/5 px-6 py-4 border-b border-border">
              <DialogTitle className="technical-label text-[11px] text-foreground uppercase tracking-widest">Iniciar Tablero de Brainstorm</DialogTitle>
            </DialogHeader>
            <div className="p-6 space-y-4">
              <div className="space-y-1.5">
                <Label className="technical-label text-[9px] opacity-60 uppercase">Nombre del Tablero *</Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="h-11 rounded-sm border-border bg-accent/5 text-[11px] font-bold uppercase tracking-tight"
                  placeholder="LLUVIA DE IDEAS PRIMAVERA"
                  autoFocus
                />
              </div>
              <div className="space-y-1.5">
                <Label className="technical-label text-[9px] opacity-60 uppercase">Descripción / Objetivos</Label>
                <Input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="h-11 rounded-sm border-border bg-accent/5 text-[11px] font-bold"
                  placeholder="Objetivos estratégicos, canales..."
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="ghost" onClick={() => setOpen(false)} className="h-10 rounded-sm technical-label text-[10px] hover:bg-accent/5">Cancelar</Button>
                <Button onClick={createBoard} disabled={loading || !title.trim()} className="h-10 rounded-sm bg-brand px-8 technical-label text-[10px] text-white">
                  {loading && <Loader2 size={14} className="mr-2 animate-spin" />}
                  Crear Tablero
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center pb-4 border-b border-border">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">Brainstorming</h2>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Tableros de ideas, copys y colaboración creativa</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <button className="flex items-center gap-2 px-3 h-8 text-[10px] font-black uppercase tracking-widest text-white bg-brand rounded-sm hover:opacity-90 active:scale-95 transition-all">
              <Plus size={12} />
              Iniciar Brainstorm
            </button>
          </DialogTrigger>
          <DialogContent className="max-w-md rounded-xl border border-border bg-card p-0 overflow-hidden shadow-2xl">
            <DialogHeader className="bg-accent/5 px-6 py-4 border-b border-border">
              <DialogTitle className="technical-label text-[11px] text-foreground uppercase tracking-widest">Iniciar Tablero de Brainstorm</DialogTitle>
            </DialogHeader>
            <div className="p-6 space-y-4">
              <div className="space-y-1.5">
                <Label className="technical-label text-[9px] opacity-60 uppercase">Nombre del Tablero *</Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="h-11 rounded-sm border-border bg-accent/5 text-[11px] font-bold uppercase tracking-tight"
                  placeholder="LLUVIA DE IDEAS PRIMAVERA"
                  autoFocus
                />
              </div>
              <div className="space-y-1.5">
                <Label className="technical-label text-[9px] opacity-60 uppercase">Descripción / Objetivos</Label>
                <Input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="h-11 rounded-sm border-border bg-accent/5 text-[11px] font-bold"
                  placeholder="Objetivos estratégicos, canales..."
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="ghost" onClick={() => setOpen(false)} className="h-10 rounded-sm technical-label text-[10px] hover:bg-accent/5">Cancelar</Button>
                <Button onClick={createBoard} disabled={loading || !title.trim()} className="h-10 rounded-sm bg-brand px-8 technical-label text-[10px] text-white">
                  {loading && <Loader2 size={14} className="mr-2 animate-spin" />}
                  Crear Tablero
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {boards.map((board) => (
          <Link
            key={board.id}
            href={`/${locale}/brainstorm/${board.id}`}
            className="group border border-border bg-card rounded-xl p-6 space-y-4 hover:border-brand/40 hover:shadow-lg hover:shadow-brand/5 transition-all animate-fade-in"
          >
            <div className="flex items-start justify-between">
              <div className="h-10 w-10 rounded-xl bg-brand/10 border border-brand/20 flex items-center justify-center">
                <Lightbulb size={18} className="text-brand" />
              </div>
              <ArrowUpRight
                size={14}
                className="text-muted-foreground/30 group-hover:text-brand transition-colors"
              />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-foreground group-hover:text-brand transition-colors line-clamp-1">
                {board.title}
              </h3>
              {board.description && (
                <p className="text-xs text-muted-foreground/60 line-clamp-2 leading-relaxed">
                  {board.description}
                </p>
              )}
            </div>
            <p className="text-[10px] text-muted-foreground/30">
              Creado {format(new Date(board.created_at), "d MMM yyyy")}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
