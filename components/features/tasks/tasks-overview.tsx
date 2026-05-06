"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ArrowRight, AlertCircle, Clock, Circle } from "lucide-react";
import type { Task, Profile } from "@/types";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils/cn";

import { useTranslations } from "next-intl";

const PRIORITY_CONFIG = {
  urgent: { class: "bg-error/5 text-error border-error/20" },
  high: { class: "bg-warning/5 text-warning border-warning/20" },
  medium: { class: "bg-brand/5 text-brand border-brand/20" },
  low: { class: "bg-muted/5 text-muted-foreground border-border" },
};

interface Props {
  tasks: (Task & { assignee?: Profile | null })[];
}

export function TasksOverview({ tasks }: Props) {
  const t = useTranslations("dashboard.tasks");

  return (
    <Card className="rounded-xl border-border shadow-sm overflow-hidden">
      <CardHeader className="flex-row items-center justify-between h-14 border-b border-border px-6 py-0 space-y-0">
        <div className="text-sm font-semibold tracking-tight text-foreground">{t("pending_actions")}</div>
        <Button variant="ghost" size="sm" asChild className="h-8 rounded-sm text-xs font-medium hover:bg-accent/10">
          <Link href="/tasks" className="flex items-center gap-2">
            {t("audit_all")} <ArrowRight size={10} />
          </Link>
        </Button>
      </CardHeader>

      <CardContent className="p-2">
        {tasks.length === 0 ? (
          <div className="py-12 text-center">
            <div className="technical-label text-[10px] opacity-40 uppercase tracking-widest">
              {t("zero_actions")}
            </div>
          </div>
        ) : (
          <div className="space-y-1">
            {tasks.slice(0, 6).map((task) => {
              const priorityKey = task.priority as keyof typeof PRIORITY_CONFIG;
              const priorityCfg = PRIORITY_CONFIG[priorityKey] || PRIORITY_CONFIG.low;
              const isOverdue = task.due_date && new Date(task.due_date) < new Date();

              return (
                <Link
                  key={task.id}
                  href={`/tasks?task=${task.id}`}
                  className="flex items-center gap-4 rounded-sm border border-transparent p-3 transition-all hover:bg-accent/5 hover:border-border group"
                >
                  <Circle size={12} className={cn(
                    "shrink-0",
                    task.status === "in_progress" ? "text-brand animate-pulse" : "text-muted-foreground/30"
                  )} />

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold tracking-tight text-foreground group-hover:text-brand transition-colors">
                      {task.title}
                    </p>
                    {task.due_date && (
                      <p className={cn(
                        "mt-1 flex items-center gap-1.5 text-xs font-medium",
                        isOverdue ? "text-error" : "text-muted-foreground/80"
                      )}>
                        {isOverdue ? <AlertCircle size={10} /> : <Clock size={10} />}
                        {isOverdue ? t("overdue") : t("due")} — {formatDistanceToNow(new Date(task.due_date), { addSuffix: true })}
                      </p>
                    )}
                  </div>

                  <Badge variant="outline" className={cn("shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-sm border", priorityCfg.class)}>
                    {t(`priorities.${priorityKey}`)}
                  </Badge>
                </Link>
              );
            })}
          </div>
        )}
      </CardContent>

      <div className="h-10 border-t border-border flex items-center justify-center bg-accent/5">
        <span className="text-xs font-semibold text-muted-foreground/50 uppercase tracking-wider">{t("priority_queue")}</span>
      </div>
    </Card>
  );
}

