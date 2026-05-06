"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ThumbsUp, Plus, X, Loader2, MessageSquare, Send, Trash2, LayoutGrid } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import type { BrainstormBoard, BrainstormNote, Profile } from "@/types";
import { cn } from "@/lib/utils/cn";

const NOTE_THEMES = [
  { id: "yellow", bg: "bg-[#fefce8]", border: "border-yellow-200", text: "text-yellow-900", accent: "bg-yellow-400" },
  { id: "green", bg: "bg-[#f0fdf4]", border: "border-green-200", text: "text-green-900", accent: "bg-green-400" },
  { id: "blue", bg: "bg-[#eff6ff]", border: "border-blue-200", text: "text-blue-900", accent: "bg-blue-400" },
  { id: "pink", bg: "bg-[#fdf2f8]", border: "border-pink-200", text: "text-pink-900", accent: "bg-pink-400" },
  { id: "purple", bg: "bg-[#faf5ff]", border: "border-purple-200", text: "text-purple-900", accent: "bg-purple-400" },
  { id: "orange", bg: "bg-[#fff7ed]", border: "border-orange-200", text: "text-orange-900", accent: "bg-orange-400" },
];

const CATEGORIES = ["idea", "hook", "slogan", "content", "campaign", "question", "problem", "solution"];

interface Props {
  board: BrainstormBoard;
  initialNotes: (BrainstormNote & { user_voted?: boolean; author?: Profile | null })[];
  userId: string;
}

export function BrainstormCanvas({ board, initialNotes, userId }: Props) {
  const [notes, setNotes] = useState(initialNotes);
  const [adding, setAdding] = useState(false);
  const [newContent, setNewContent] = useState("");
  const [newCategory, setNewCategory] = useState("idea");
  const [newTheme, setNewTheme] = useState(NOTE_THEMES[0]!.id);
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const channel = supabase
      .channel(`board-${board.id}`)
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "brainstorm_notes",
        filter: `board_id=eq.${board.id}`,
      }, async (payload: { eventType: string; new: { id: string }; old: { id: string } }) => {
        if (payload.eventType === "INSERT") {
          const { data } = await supabase
            .from("brainstorm_notes")
            .select("*, author:profiles(id, full_name, avatar_url), votes_data:brainstorm_votes(user_id)")
            .eq("id", payload.new.id)
            .single();
          if (data) {
            setNotes((prev) => [
              ...prev,
              { 
                ...data as any, 
                user_voted: (data as any).votes_data?.some((v: any) => v.user_id === userId), 
                votes: (data as any).votes_data?.length ?? 0 
              },
            ]);
          }
        }
        if (payload.eventType === "DELETE") {
          setNotes((prev) => prev.filter((n) => n.id !== payload.old.id));
        }
      })
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "brainstorm_votes",
      }, () => {
        supabase
          .from("brainstorm_notes")
          .select("id, votes_data:brainstorm_votes(user_id)")
          .eq("board_id", board.id)
          .then(({ data }: { data: Array<{ id: string; votes_data: Array<{ user_id: string }> | null }> | null }) => {
            if (data) {
              setNotes((prev) =>
                prev.map((note) => {
                  const updated = data.find((d) => d.id === note.id);
                  if (!updated) return note;
                  const voteData = (updated as any).votes_data ?? [];
                  return { ...note, votes: voteData.length, user_voted: voteData.some((v: any) => v.user_id === userId) };
                })
              );
            }
          });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [board.id, userId]);

  async function addNote() {
    if (!newContent.trim()) return;
    setSaving(true);
    const selectedTheme = NOTE_THEMES.find(t => t.id === newTheme);
    const { error } = await supabase.from("brainstorm_notes").insert({
      board_id: board.id,
      content: newContent.trim(),
      category: newCategory,
      color: selectedTheme?.bg ?? "#ffffff",
      created_by: userId,
      position_x: 0,
      position_y: 0,
    });
    setSaving(false);
    if (error) toast.error(error.message);
    else {
      setNewContent("");
      setAdding(false);
      toast.success("Ideation node deployed");
    }
  }

  async function deleteNote(id: string) {
    const { error } = await supabase.from("brainstorm_notes").delete().eq("id", id);
    if (error) toast.error(error.message);
  }

  async function toggleVote(noteId: string, userVoted: boolean) {
    if (userVoted) {
      await supabase.from("brainstorm_votes").delete().eq("note_id", noteId).eq("user_id", userId);
    } else {
      await supabase.from("brainstorm_votes").insert({ note_id: noteId, user_id: userId });
    }
  }

  const sortedNotes = [...notes].sort((a, b) => b.votes - a.votes);

  return (
    <div className="flex flex-1 flex-col min-h-0 bg-[#0c0c0e]">
      {/* Control Strip */}
      <div className="h-14 border-b border-white/5 bg-black/20 flex items-center justify-between px-8 shrink-0">
        <div className="flex items-center gap-6">
          <div className="technical-label text-[9px] opacity-40 uppercase tracking-widest flex items-center gap-2">
            <LayoutGrid size={12} /> {notes.length} Active Concepts
          </div>
          <div className="h-4 w-[1px] bg-white/5" />
          <div className="technical-label text-[9px] opacity-40 uppercase tracking-widest">Sorted by Impact</div>
        </div>
        <Button size="sm" onClick={() => setAdding(true)} className="h-8 rounded-sm bg-brand px-4 technical-label text-[10px] text-white hover:opacity-90 gap-2">
          <Plus size={14} /> New Concept
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
        {/* Rapid Deployment Form */}
        <AnimatePresence>
          {adding && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-12 max-w-2xl mx-auto rounded-sm border border-border bg-card p-0 shadow-2xl overflow-hidden"
            >
              <div className="bg-accent/5 px-6 py-3 border-b border-border flex items-center justify-between">
                <div className="technical-label text-[10px] uppercase font-black">Configure Concept Deployment</div>
                <button onClick={() => setAdding(false)} className="opacity-40 hover:opacity-100 transition-opacity"><X size={14} /></button>
              </div>
              <div className="p-6 space-y-6">
                <Textarea
                  placeholder="Insert tactical idea or observation..."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  rows={3}
                  className="rounded-sm border-border bg-accent/5 text-[11px] font-bold py-3 outline-none focus:border-brand"
                  autoFocus
                  onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) addNote(); }}
                />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Select value={newCategory} onValueChange={setNewCategory}>
                      <SelectTrigger className="h-8 w-32 rounded-sm border-border bg-accent/5 technical-label text-[9px] uppercase"><SelectValue /></SelectTrigger>
                      <SelectContent className="rounded-sm border-border bg-card">
                        {CATEGORIES.map((c) => <SelectItem key={c} value={c} className="technical-label text-[9px] uppercase">{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <div className="flex gap-1">
                      {NOTE_THEMES.map((theme) => (
                        <button
                          key={theme.id}
                          onClick={() => setNewTheme(theme.id)}
                          className={cn(
                            "h-5 w-5 rounded-sm border-2 transition-transform hover:scale-110",
                            theme.bg,
                            newTheme === theme.id ? "border-brand" : "border-transparent"
                          )}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button variant="ghost" size="sm" onClick={() => setAdding(false)} className="h-8 technical-label text-[9px]">Abort</Button>
                    <Button size="sm" onClick={addNote} disabled={saving || !newContent.trim()} className="h-8 rounded-sm bg-brand technical-label text-[9px] text-white">
                      {saving ? <Loader2 size={12} className="animate-spin" /> : "Deploy Concept"}
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {notes.length === 0 && !adding ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="h-16 w-16 rounded-sm bg-accent/5 flex items-center justify-center mb-6 border border-border/50">
              <Plus size={24} className="text-muted-foreground opacity-20" />
            </div>
            <h3 className="technical-label text-[11px] font-black uppercase tracking-widest text-muted-foreground">Zero Concepts Ingested</h3>
            <p className="mt-2 text-[10px] text-muted-foreground/40 uppercase tracking-widest">Initialize the first ideation node to begin strategy</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-start">
            <AnimatePresence>
              {sortedNotes.map((note, i) => {
                const theme = NOTE_THEMES.find(t => t.bg === note.color) || NOTE_THEMES[0]!;
                return (
                  <motion.div
                    key={note.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: i * 0.03 }}
                    className="group"
                  >
                    <div className={cn(
                      "relative rounded-sm p-6 border transition-all hover:shadow-2xl hover:-translate-y-1",
                      theme.bg, theme.border
                    )}>
                      <div className={cn("absolute top-0 left-0 w-1 h-full", theme.accent)} />
                      
                      <button
                        onClick={() => deleteNote(note.id)}
                        className="absolute right-2 top-2 h-6 w-6 rounded-sm flex items-center justify-center opacity-0 transition-opacity hover:bg-black/5 group-hover:opacity-40"
                      >
                        <Trash2 size={12} />
                      </button>

                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <span className={cn("px-2 py-0.5 rounded-sm text-[8px] font-black uppercase tracking-widest border", theme.border, theme.text, "bg-white/50")}>
                            {note.category}
                          </span>
                        </div>
                        
                        <p className={cn("text-[12px] font-bold leading-relaxed text-black/80 tracking-tight", theme.text)}>
                          {note.content}
                        </p>

                        <div className="pt-4 border-t border-black/5 flex items-center justify-between">
                          <div className="flex flex-col">
                            <span className="technical-label text-[8px] font-black uppercase text-black/40">{note.author?.full_name?.split(' ')[0] ?? "OPERATOR"}</span>
                          </div>
                          <button
                            onClick={() => toggleVote(note.id, note.user_voted ?? false)}
                            className={cn(
                              "flex items-center gap-2 rounded-sm px-3 py-1.5 text-[10px] font-black transition-all",
                              note.user_voted ? "bg-black/10 shadow-inner" : "hover:bg-black/5 opacity-60 hover:opacity-100"
                            )}
                          >
                            <ThumbsUp size={12} className={note.user_voted ? "fill-current" : ""} />
                            {note.votes}
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
