"use client";

import { useState } from "react";
import type { Task, Profile } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, MessageSquare, AlertCircle, Clock, GitBranch } from "lucide-react";
import { format, isPast } from "date-fns";
import { getInitials } from "@/lib/utils/workspace";
import { cn } from "@/lib/utils/cn";

const PRIORITY_STYLES: Record<string, string> = {
  urgent: "bg-error/10 text-error border-error/20",
  high: "bg-warning/10 text-warning border-warning/20",
  medium: "bg-brand/10 text-brand border-brand/20",
  low: "bg-muted/10 text-muted-foreground border-border",
};

interface Props {
  task: Task & { assignee?: Profile | null };
  workspaceId: string;
  members: Profile[];
  clients: { id: string; company_name: string }[];
  campaigns: { id: string; name: string }[];
}

export function TaskCard({ task, workspaceId, members, clients, campaigns }: Props) {
  const [detailOpen, setDetailOpen] = useState(false);
  const isOverdue = task.due_date && isPast(new Date(task.due_date)) && task.status !== "done";

  return (
    <>
      <div
        onClick={() => setDetailOpen(true)}
        className="group cursor-pointer rounded-sm border border-border bg-card p-4 shadow-sm transition-all hover:border-brand hover:shadow-md active:scale-[0.98]"
      >
        <div className="mb-3 flex items-center justify-between gap-2">
          <Badge variant="outline" className={cn("technical-label text-[7px] px-1.5 py-0 rounded-sm border uppercase tracking-widest", PRIORITY_STYLES[task.priority as string] || PRIORITY_STYLES.low)}>
            {task.priority}
          </Badge>
          {isOverdue && (
            <div className="flex items-center gap-1 text-error animate-pulse">
              <AlertCircle size={10} />
              <span className="technical-label text-[7px] font-black">CRITICAL</span>
            </div>
          )}
        </div>

        <p className="mb-4 text-[12px] font-black uppercase tracking-tight text-foreground leading-tight line-clamp-2 group-hover:text-brand transition-colors">
          {task.title}
        </p>

        <div className="flex items-center justify-between pt-3 border-t border-border/50">
          <div className="flex items-center gap-3">
            {task.due_date && (
              <div className={cn(
                "flex items-center gap-1.5 technical-label text-[8px] uppercase tracking-widest",
                isOverdue ? "text-error" : "opacity-40"
              )}>
                <Clock size={10} />
                {format(new Date(task.due_date), "MMM d")}
              </div>
            )}
            {task.subtasks && task.subtasks.length > 0 && (
              <div className="flex items-center gap-1.5 opacity-40 group-hover:opacity-80 transition-opacity">
                <GitBranch size={10} />
                <span className="technical-label text-[8px]">
                  {task.subtasks.filter((s) => s.status === "done").length}/{task.subtasks.length}
                </span>
              </div>
            )}
            <div className="flex items-center gap-1.5 opacity-20 group-hover:opacity-60 transition-opacity">
              <MessageSquare size={10} />
              <span className="technical-label text-[8px]">0</span>
            </div>
          </div>
          
          {task.assignee && (
            <Avatar className="h-6 w-6 rounded-sm border border-border transition-all">
              <AvatarImage src={task.assignee.avatar_url ?? undefined} />
              <AvatarFallback className="text-[8px] technical-label font-black bg-accent/10">
                {getInitials(task.assignee.full_name)}
              </AvatarFallback>
            </Avatar>
          )}
        </div>
      </div>

      {/* TaskDetailDialog placeholder - should be implemented in components/features/tasks/task-detail-dialog.tsx */}
    </>
  );
}
