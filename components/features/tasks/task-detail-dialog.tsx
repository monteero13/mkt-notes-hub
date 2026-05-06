"use client";

import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Loader2, Send, Trash2, Calendar, LayoutGrid, User, Clock,
  MessageSquare, Plus, CheckSquare, Square, GitBranch
} from "lucide-react";
import type { Task, TaskComment, Profile } from "@/types";
import { addTaskComment, createTask, deleteTask, updateTask, updateTaskStatus } from "@/actions/tasks";
import { createClient } from "@/lib/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { getInitials } from "@/lib/utils/workspace";
import { format } from "date-fns";
import { cn } from "@/lib/utils/cn";

interface Props {
  task: Task & { assignee?: Profile | null };
  workspaceId: string;
  members: Profile[];
  clients: { id: string; company_name: string }[];
  campaigns: { id: string; name: string }[];
  onClose: () => void;
}

const PRIORITY_STYLES: Record<string, string> = {
  urgent: "bg-error/10 text-error border-error/20",
  high: "bg-warning/10 text-warning border-warning/20",
  medium: "bg-brand/10 text-brand border-brand/20",
  low: "bg-muted/10 text-muted-foreground border-border",
};

function SubtaskRow({
  subtask,
  workspaceId,
  onToggle,
}: {
  subtask: Task;
  workspaceId: string;
  onToggle: () => void;
}) {
  const [toggling, setToggling] = useState(false);
  const isDone = subtask.status === "done";

  const handleToggle = async () => {
    setToggling(true);
    const newStatus = isDone ? "todo" : "done";
    await updateTaskStatus(subtask.id, newStatus, workspaceId);
    setToggling(false);
    onToggle();
  };

  return (
    <div className="flex items-center gap-3 py-2 px-3 rounded-sm hover:bg-accent/5 group transition-all">
      <button
        onClick={handleToggle}
        disabled={toggling}
        className="text-muted-foreground/40 hover:text-brand transition-colors shrink-0"
      >
        {toggling ? (
          <Loader2 size={14} className="animate-spin" />
        ) : isDone ? (
          <CheckSquare size={14} className="text-brand" />
        ) : (
          <Square size={14} />
        )}
      </button>
      <span className={cn(
        "technical-label text-[10px] flex-1 truncate",
        isDone && "line-through opacity-40"
      )}>
        {subtask.title}
      </span>
    </div>
  );
}

export function TaskDetailDialog({ task, workspaceId, onClose }: Props) {
  const router = useRouter();
  const supabase = createClient();

  const [comments, setComments] = useState<(TaskComment & { user?: Profile | null })[]>([]);
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [status, setStatus] = useState(task.status);

  const [newSubtask, setNewSubtask] = useState("");
  const [addingSubtask, setAddingSubtask] = useState(false);
  const subtaskInputRef = useRef<HTMLInputElement>(null);

  // Subtasks query
  const { data: subtasks = [], refetch: refetchSubtasks } = useQuery({
    queryKey: ["subtasks", task.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("tasks")
        .select("*")
        .eq("parent_id", task.id)
        .order("created_at");
      return (data ?? []) as Task[];
    },
  });

  const doneCount = subtasks.filter((s) => s.status === "done").length;

  useEffect(() => {
    // Load initial comments
    supabase
      .from("task_comments")
      .select("*, user:profiles(id, full_name, avatar_url)")
      .eq("task_id", task.id)
      .order("created_at")
      .then(({ data }: { data: any[] | null }) => setComments(data ?? []));

    // Real-time subscription
    const channel = supabase
      .channel(`task-comments-${task.id}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "task_comments",
        filter: `task_id=eq.${task.id}`,
      }, async (payload: { new: { id: string } }) => {
        const { data: comment } = await supabase
          .from("task_comments")
          .select("*, user:profiles(id, full_name, avatar_url)")
          .eq("id", payload.new.id)
          .single();
        if (comment) setComments((prev) => [...prev, comment as any]);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [task.id]);

  async function handleComment() {
    if (!commentText.trim()) return;
    setSubmitting(true);
    const result = await addTaskComment(task.id, commentText, workspaceId);
    setSubmitting(false);
    if (result.error) toast.error(result.error);
    else setCommentText("");
  }

  async function handleStatusChange(newStatus: string) {
    setStatus(newStatus as any);
    await updateTask(task.id, workspaceId, { status: newStatus });
    router.refresh();
    toast.success(`Status: ${newStatus.replace("_", " ")}`);
  }

  async function handleDelete() {
    if (!confirm("Terminate tactical task?")) return;
    setDeleting(true);
    const result = await deleteTask(task.id, workspaceId);
    if (result.error) { toast.error(result.error); setDeleting(false); }
    else { toast.success("Task purged"); onClose(); router.refresh(); }
  }

  async function handleAddSubtask() {
    if (!newSubtask.trim()) return;
    setAddingSubtask(true);
    const result = await createTask({
      workspace_id: workspaceId,
      title: newSubtask.trim(),
      status: "todo",
      priority: task.priority,
      parent_id: task.id,
    });
    setAddingSubtask(false);
    if (result.error) {
      toast.error(result.error);
    } else {
      setNewSubtask("");
      refetchSubtasks();
      subtaskInputRef.current?.focus();
    }
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl rounded-sm border-border bg-card p-0 overflow-hidden shadow-2xl">
        <DialogHeader className="bg-accent/5 px-6 py-4 border-b border-border flex flex-row items-center justify-between space-y-0">
          <div className="flex items-center gap-3">
            <LayoutGrid size={16} className="text-brand" />
            <DialogTitle className="technical-label text-[11px] text-foreground uppercase tracking-widest">
              Tactical Task Dossier
            </DialogTitle>
          </div>
          <Badge variant="outline" className={cn("technical-label text-[8px] px-1.5 py-0 rounded-sm border", PRIORITY_STYLES[task.priority] || PRIORITY_STYLES.low)}>
            {task.priority} Priority
          </Badge>
        </DialogHeader>

        <div className="grid grid-cols-3 divide-x divide-border h-[620px]">
          {/* Main Content Node */}
          <div className="col-span-2 flex flex-col h-full bg-background">
            <div className="p-8 space-y-6 flex-1 overflow-y-auto custom-scrollbar">
              <div className="space-y-2">
                <h2 className="text-2xl font-black tracking-tighter uppercase text-foreground leading-tight">
                  {task.title}
                </h2>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5 technical-label text-[9px] opacity-40 uppercase">
                    <User size={10} /> CREATED BY {task.created_by?.slice(0, 8) ?? 'OPERATOR'}
                  </div>
                  <div className="h-3 w-[1px] bg-border" />
                  <div className="flex items-center gap-1.5 technical-label text-[9px] opacity-40 uppercase">
                    <Clock size={10} /> {format(new Date(task.created_at), "MMM d, HH:mm")}
                  </div>
                </div>
              </div>

              {task.description && (
                <div className="space-y-2">
                  <div className="technical-label text-[9px] opacity-60">Objective & Parameters</div>
                  <div className="text-[12px] leading-relaxed text-muted-foreground bg-accent/5 p-4 border border-border/50 rounded-sm italic">
                    "{task.description}"
                  </div>
                </div>
              )}

              {/* Sub-units */}
              {!task.parent_id && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-border pb-2">
                    <div className="technical-label text-[9px] flex items-center gap-2">
                      <GitBranch size={12} className="text-brand" />
                      Sub-units
                      {subtasks.length > 0 && (
                        <span className="text-muted-foreground/40">
                          {doneCount}/{subtasks.length}
                        </span>
                      )}
                    </div>
                  </div>

                  {subtasks.length > 0 && (
                    <div className="space-y-0.5">
                      {subtasks.map((s) => (
                        <SubtaskRow
                          key={s.id}
                          subtask={s}
                          workspaceId={workspaceId}
                          onToggle={refetchSubtasks}
                        />
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-2 pt-1">
                    <Input
                      ref={subtaskInputRef}
                      placeholder="Add sub-unit..."
                      value={newSubtask}
                      onChange={(e) => setNewSubtask(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") handleAddSubtask(); }}
                      className="h-8 rounded-sm border-border bg-accent/5 text-[10px] font-bold flex-1"
                    />
                    <Button
                      size="icon"
                      onClick={handleAddSubtask}
                      disabled={addingSubtask || !newSubtask.trim()}
                      className="h-8 w-8 rounded-sm bg-accent/5 border border-border text-foreground hover:bg-brand/10 hover:text-brand"
                    >
                      {addingSubtask ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />}
                    </Button>
                  </div>
                </div>
              )}

              {/* Communication Feed */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-border pb-2">
                  <div className="technical-label text-[9px] flex items-center gap-2">
                    <MessageSquare size={12} className="text-brand" /> Operational Feed ({comments.length})
                  </div>
                </div>

                <div className="space-y-6">
                  {comments.map((c) => (
                    <div key={c.id} className="flex gap-4">
                      <Avatar className="h-8 w-8 rounded-sm border border-border">
                        <AvatarImage src={c.user?.avatar_url ?? undefined} />
                        <AvatarFallback className="text-[10px] font-black">{getInitials(c.user?.full_name)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="technical-label text-[9px] font-black text-foreground">{c.user?.full_name ?? "OPERATOR"}</span>
                          <span className="technical-label text-[8px] opacity-30">{format(new Date(c.created_at), "HH:mm")}</span>
                        </div>
                        <p className="text-[11px] leading-relaxed text-muted-foreground">{c.content}</p>
                      </div>
                    </div>
                  ))}
                  {comments.length === 0 && (
                    <div className="py-8 text-center">
                      <div className="technical-label text-[9px] opacity-20 uppercase tracking-[0.2em]">Zero transmission records.</div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Input Node */}
            <div className="p-6 border-t border-border bg-card">
              <div className="relative group">
                <Textarea
                  placeholder="Insert mission update..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  rows={1}
                  className="min-h-[60px] max-h-[120px] rounded-sm border-border bg-accent/5 text-[11px] font-bold py-3 pr-12 transition-all focus:border-brand focus:ring-0 outline-none"
                  onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleComment(); }}
                />
                <Button
                  size="icon"
                  onClick={handleComment}
                  disabled={submitting || !commentText.trim()}
                  className="absolute right-2 bottom-2 h-8 w-8 rounded-sm bg-brand text-white shadow-lg shadow-brand/20"
                >
                  {submitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                </Button>
              </div>
              <div className="mt-2 px-1">
                <span className="technical-label text-[7px] opacity-30 uppercase tracking-widest">⌘ + Enter to dispatch</span>
              </div>
            </div>
          </div>

          {/* Side Panel: Metadata */}
          <div className="bg-card p-6 space-y-8 overflow-y-auto custom-scrollbar">
            <div className="space-y-4">
              <div className="technical-label text-[9px] opacity-40 uppercase tracking-widest">Operational Status</div>
              <Select value={status} onValueChange={handleStatusChange}>
                <SelectTrigger className="h-10 rounded-sm border-border bg-accent/5 text-[10px] font-black uppercase tracking-widest">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-sm border-border bg-card shadow-2xl">
                  {["backlog","todo","in_progress","in_review","done","canceled"].map((s) => (
                    <SelectItem key={s} value={s} className="technical-label text-[9px] uppercase tracking-widest">{s.replace("_"," ")}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              <div className="technical-label text-[9px] opacity-40 uppercase tracking-widest">Strategic Priority</div>
              <div className={cn("p-3 rounded-sm border technical-label text-[9px] font-black uppercase tracking-[0.2em] text-center", PRIORITY_STYLES[task.priority] || PRIORITY_STYLES.low)}>
                {task.priority} ACCESS
              </div>
            </div>

            {task.due_date && (
              <div className="space-y-4">
                <div className="technical-label text-[9px] opacity-40 uppercase tracking-widest">Operational Deadline</div>
                <div className="flex items-center gap-3 p-3 rounded-sm border border-border bg-accent/5">
                  <Calendar size={14} className="text-brand" />
                  <span className="technical-label text-[10px] font-black text-foreground">{format(new Date(task.due_date), "MMM d, yyyy")}</span>
                </div>
              </div>
            )}

            {task.assignee && (
              <div className="space-y-4">
                <div className="technical-label text-[9px] opacity-40 uppercase tracking-widest">Assigned Operator</div>
                <div className="flex items-center gap-3 p-3 rounded-sm border border-border bg-accent/5 group cursor-pointer hover:border-brand transition-colors">
                  <Avatar className="h-8 w-8 rounded-sm border border-border transition-all">
                    <AvatarImage src={task.assignee.avatar_url ?? undefined} />
                    <AvatarFallback className="text-[10px] font-black">{getInitials(task.assignee.full_name)}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="technical-label text-[10px] font-black text-foreground uppercase">{task.assignee.full_name}</span>
                    <span className="technical-label text-[8px] opacity-40 uppercase">Operator ID: {task.assignee.id.slice(0, 8)}</span>
                  </div>
                </div>
              </div>
            )}

            {subtasks.length > 0 && (
              <div className="space-y-3">
                <div className="technical-label text-[9px] opacity-40 uppercase tracking-widest">Sub-unit Progress</div>
                <div className="space-y-1.5">
                  <div className="flex justify-between technical-label text-[8px]">
                    <span className="opacity-40">{doneCount} / {subtasks.length} complete</span>
                    <span className="text-brand">{Math.round((doneCount / subtasks.length) * 100)}%</span>
                  </div>
                  <div className="h-1 bg-accent/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-brand transition-all duration-500"
                      style={{ width: `${(doneCount / subtasks.length) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="pt-8 mt-8 border-t border-border">
              <Button
                variant="ghost"
                size="sm"
                className="w-full h-10 rounded-sm technical-label text-[10px] text-error hover:bg-error/10 hover:text-error uppercase tracking-widest gap-2"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                Terminate Task
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
