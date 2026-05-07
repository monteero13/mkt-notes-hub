"use client";

import { motion } from "framer-motion";
import { Zap, Clock, CheckCircle2, AlertCircle, User } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useWorkspace } from "@/hooks/use-workspace";
import { formatDistanceToNow } from "date-fns";
import type { ActivityLog } from "@/types";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { useTranslations } from "next-intl";

const ACTION_STYLES: Record<string, { type: string; icon: React.ElementType }> = {
  created: { type: "success", icon: CheckCircle2 },
  updated: { type: "info", icon: Clock },
  deleted: { type: "warning", icon: AlertCircle },
  commented: { type: "system", icon: Zap },
};

export function RecentActivity() {
  const t = useTranslations("dashboard.activity");
  const supabase = createClient();
  const { activeWorkspace } = useWorkspace();

  function activityLabel(log: ActivityLog & { user?: { full_name?: string | null } | null }) {
    const who = log.user?.full_name ?? t("operator");
    const what = (log.metadata?.title as string) ?? log.entity_type;
    const actionKey = `actions.${log.action}` as any;
    const verb = t(actionKey);
    return `${who} ${verb} ${what}`;
  }

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ["activity-logs", activeWorkspace?.id],
    enabled: !!activeWorkspace?.id,
    queryFn: async () => {
      const { data } = await supabase
        .from("activity_logs")
        .select("*, user:profiles(full_name, avatar_url)")
        .eq("workspace_id", activeWorkspace!.id)
        .order("created_at", { ascending: false })
        .limit(8);
      return (data ?? []) as (ActivityLog & { user?: { full_name?: string | null } | null })[];
    },
    staleTime: 1000 * 60,
  });

  return (
    <Card className="border border-border bg-card rounded-xl shadow-sm overflow-hidden flex flex-col">
      <CardHeader className="flex-row items-center justify-between h-14 border-b border-border px-6 py-0 space-y-0 bg-accent/5">
        <div className="flex items-center gap-2">
          <Zap size={14} className="text-warning/70" />
          <div className="text-sm font-semibold tracking-tight text-foreground">{t("title")}</div>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-sm bg-warning animate-pulse" />
          <span className="technical-label text-[9px] opacity-60 uppercase tracking-widest">{t("live_feed")}</span>
        </div>
      </CardHeader>

      <div className="p-0">
        {isLoading ? (
          <div className="py-8 text-center">
            <div className="technical-label text-[9px] opacity-20 uppercase tracking-widest animate-pulse">{t("syncing")}</div>
          </div>
        ) : logs.length === 0 ? (
          <div className="py-8 text-center">
            <div className="technical-label text-[9px] opacity-20 uppercase tracking-widest">{t("empty")}</div>
          </div>
        ) : (
          <div className="divide-y divide-border/50">
            {logs.map((log, i) => {
              const style = ACTION_STYLES[log.action] ?? ACTION_STYLES.updated!;
              const Icon = style.icon;
              return (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex items-center justify-between p-4 hover:bg-accent/5 transition-colors group"
                >
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "h-8 w-8 rounded-sm flex items-center justify-center border shrink-0",
                      style.type === "success" ? "bg-success/5 border-success/20 text-success" :
                      style.type === "warning" ? "bg-warning/5 border-warning/20 text-warning" :
                      style.type === "system" ? "bg-brand/5 border-brand/20 text-brand" :
                      "bg-muted/5 border-border text-muted-foreground"
                    )}>
                      <Icon size={14} />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[11px] font-black uppercase tracking-tight text-foreground group-hover:text-brand transition-colors truncate max-w-[160px]">
                        {activityLabel(log)}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <User size={10} className="opacity-40 shrink-0" />
                        <span className="technical-label text-[8px] opacity-40 uppercase tracking-widest truncate">
                          {log.entity_type}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-2">
                    <div className="technical-label text-[9px] opacity-40 uppercase tracking-widest whitespace-nowrap">
                      {formatDistanceToNow(new Date(log.created_at), { addSuffix: false })}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      <div className="h-10 border-t border-border flex items-center justify-center bg-accent/5">
        <button className="technical-label text-[9px] text-muted-foreground hover:text-brand transition-colors cursor-pointer flex items-center gap-2">
          {t("view_history")}
        </button>
      </div>
    </Card>
  );
}

