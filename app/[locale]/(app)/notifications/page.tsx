"use client";

import { useState, useEffect, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { useWorkspace } from "@/hooks/use-workspace";
import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/DashboardLayout";
import {
  Bell, Check, CheckCheck, Trash2, ChevronRight,
  Lock, Zap, CheckCircle2, AlertCircle, Clock, User
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { markNotificationRead, markAllNotificationsRead, deleteNotification } from "@/actions/notifications";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { toast } from "sonner";
import Link from "next/link";
import type { ActivityLog, Notification } from "@/types";

import { useTranslations } from "next-intl";

const ENTITY_ROUTES: Record<string, string> = {
  task: "/planner",
  campaign: "/campaigns",
  client: "/clients",
  content_item: "/content",
  analytics_snapshot: "/analytics",
  idea: "/ideas",
  resource: "/library",
};

const ACTION_STYLES: Record<string, { type: string; icon: React.ElementType }> = {
  created:   { type: "success", icon: CheckCircle2 },
  updated:   { type: "info",    icon: Clock },
  deleted:   { type: "warning", icon: AlertCircle },
  commented: { type: "system",  icon: Zap },
};

function activityLabel(log: ActivityLog & { user?: { full_name?: string | null } | null }, t: any) {
  const who   = log.user?.full_name ?? t('operator');
  const what  = (log.metadata?.title as string) ?? log.entity_type;
  return `${who} ${log.action} ${what}`;
}

export default function NotificationsPage() {
  const supabase = createClient();
  const { activeWorkspace, profile, isPro } = useWorkspace();
  const t = useTranslations('notifications');
  const [, startTransition] = useTransition();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notifLoading, setNotifLoading] = useState(true);

  const workspaceId = activeWorkspace?.id;
  const userId = profile?.id;

  // Load + real-time notifications
  useEffect(() => {
    if (!workspaceId || !userId) return;

    supabase
      .from("notifications")
      .select("*")
      .eq("workspace_id", workspaceId)
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(50)
      .then(({ data }: { data: Notification[] | null }) => {
        setNotifications(data ?? []);
        setNotifLoading(false);
      });

    const channel = supabase
      .channel(`notifications-page-${userId}-${Date.now()}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${userId}` },
        (payload: { new: Notification }) => setNotifications((p) => [payload.new, ...p]))
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "notifications", filter: `user_id=eq.${userId}` },
        (payload: { new: Notification }) => setNotifications((p) => p.map((n) => n.id === payload.new.id ? payload.new : n)))
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "notifications", filter: `user_id=eq.${userId}` },
        (payload: { old: { id: string } }) => setNotifications((p) => p.filter((n) => n.id !== payload.old.id)))
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [workspaceId, userId]);

  // Audit log query (Pro only)
  const { data: auditLogs = [], isLoading: auditLoading } = useQuery({
    queryKey: ["audit-logs-page", workspaceId],
    enabled: !!workspaceId && isPro,
    queryFn: async () => {
      const { data } = await supabase
        .from("activity_logs")
        .select("*, user:profiles(full_name, avatar_url)")
        .eq("workspace_id", workspaceId!)
        .order("created_at", { ascending: false })
        .limit(30);
      return (data ?? []) as (ActivityLog & { user?: { full_name?: string | null } | null })[];
    },
    staleTime: 1000 * 60,
  });

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  function handleMarkRead(id: string) {
    setNotifications((p) => p.map((n) => n.id === id ? { ...n, is_read: true } : n));
    startTransition(async () => {
      const res = await markNotificationRead(id);
      if (res.error) toast.error(res.error);
    });
  }

  function handleMarkAllRead() {
    if (!workspaceId) return;
    setNotifications((p) => p.map((n) => ({ ...n, is_read: true })));
    startTransition(async () => {
      const res = await markAllNotificationsRead(workspaceId);
      if (res.error) toast.error(res.error);
    });
  }

  function handleDelete(id: string) {
    setNotifications((p) => p.filter((n) => n.id !== id));
    startTransition(async () => {
      const res = await deleteNotification(id);
      if (res.error) toast.error(res.error);
    });
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col h-full bg-background">
        {/* Header */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-border px-4 sm:px-8">
          <div className="flex items-center gap-4">
            <div className="technical-label text-[11px] text-foreground">{t('signal_monitor')}</div>
            <div className="h-4 w-[1px] bg-border" />
            <div className="flex items-center gap-2 text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
              <span>{t('notification_center')}</span>
              <ChevronRight size={12} className="opacity-60" />
              <span className="text-brand">{t('activity_feed')}</span>
            </div>
          </div>
          {unreadCount > 0 && (
            <Button
              onClick={handleMarkAllRead}
              className="h-8 rounded-sm bg-accent/5 border border-border px-4 technical-label text-[10px] text-foreground hover:bg-brand/10 hover:text-brand gap-2"
            >
              <CheckCheck size={14} /> {t('mark_all_read')} ({unreadCount})
            </Button>
          )}
        </div>

        <div className="flex-1 overflow-hidden p-4 sm:p-6 lg:p-8">
          <div className="flex flex-col gap-1 mb-4 sm:mb-6 lg:mb-8 shrink-0">
            <div className="technical-label text-brand">{t('signal_intelligence')}</div>
            <h1 className="text-4xl font-light tracking-tight" style={{ fontFamily: "var(--font-clash), sans-serif" }}>{t('notification_center')}</h1>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 h-[calc(100%-88px)]">
            {/* Notifications Feed */}
            <div className="xl:col-span-2 border border-border bg-card rounded-sm overflow-hidden flex flex-col shadow-sm">
              <div className="flex items-center justify-between h-14 px-4 sm:px-6 border-b border-border bg-accent/5 shrink-0">
                <div className="flex items-center gap-3">
                  <Bell size={16} className="text-brand" />
                  <span className="technical-label text-foreground">{t('incoming_signals')} ({notifications.length})</span>
                </div>
                {unreadCount > 0 && (
                  <span className="technical-label text-[9px] px-2 py-0.5 bg-brand/10 text-brand rounded-sm">
                    {unreadCount} {t('unread')}
                  </span>
                )}
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar">
                {notifLoading ? (
                  <div className="flex items-center justify-center h-40">
                    <span className="technical-label text-[9px] opacity-20 animate-pulse uppercase tracking-widest">{t('scanning_signals')}</span>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-40 gap-3">
                    <Bell size={32} className="text-muted-foreground opacity-10" />
                    <span className="technical-label text-[9px] opacity-20 uppercase tracking-widest">{t('no_signals')}</span>
                  </div>
                ) : (
                  <div className="divide-y divide-border/50">
                    {notifications.map((n, i) => {
                      const route = n.entity_type ? ENTITY_ROUTES[n.entity_type] : null;
                      const Inner = (
                        <motion.div
                          key={n.id}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.03 }}
                          className={cn(
                            "group flex items-start gap-4 px-4 sm:px-6 py-3 sm:py-4 transition-colors hover:bg-accent/5",
                            !n.is_read && "bg-brand/5"
                          )}
                        >
                          {!n.is_read && (
                            <div className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                          )}
                          <div className={cn("flex-1 min-w-0 space-y-0.5", n.is_read && "pl-[18px]")}>
                            <p className="text-[11px] font-black uppercase tracking-tight text-foreground">
                              {n.title}
                            </p>
                            {n.body && (
                              <p className="text-[10px] text-muted-foreground truncate">{n.body}</p>
                            )}
                            <p className="technical-label text-[8px] opacity-40">
                              {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                            </p>
                          </div>
                          <div className="flex shrink-0 gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {!n.is_read && (
                              <button
                                onClick={(e) => { e.preventDefault(); handleMarkRead(n.id); }}
                                className="h-7 w-7 rounded-sm flex items-center justify-center hover:bg-accent/20 text-muted-foreground hover:text-brand"
                              >
                                <Check size={12} />
                              </button>
                            )}
                            <button
                              onClick={(e) => { e.preventDefault(); handleDelete(n.id); }}
                              className="h-7 w-7 rounded-sm flex items-center justify-center hover:bg-error/10 text-muted-foreground hover:text-error"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </motion.div>
                      );

                      return route ? (
                        <Link key={n.id} href={route} onClick={() => !n.is_read && handleMarkRead(n.id)}>
                          {Inner}
                        </Link>
                      ) : (
                        <div key={n.id}>{Inner}</div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Audit Log — Pro only */}
            <div className="border border-border bg-card rounded-sm overflow-hidden flex flex-col shadow-sm relative">
              <div className="flex items-center justify-between h-14 px-4 sm:px-6 border-b border-border bg-accent/5 shrink-0">
                <div className="flex items-center gap-3">
                  <Zap size={16} className="text-warning" />
                  <span className="technical-label text-foreground">{t('audit_log')}</span>
                </div>
                {!isPro && (
                  <span className="technical-label text-[8px] px-2 py-0.5 bg-brand/10 text-brand rounded-sm">PRO</span>
                )}
              </div>

              {!isPro ? (
                <>
                  {/* Blurred preview */}
                  <div className="flex-1 pointer-events-none select-none blur-md opacity-20 overflow-hidden">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="flex items-center gap-4 px-4 sm:px-6 py-3 sm:py-4 border-b border-border/50">
                        <div className="h-8 w-8 rounded-sm bg-accent/20 shrink-0" />
                        <div className="space-y-2 flex-1">
                          <div className="h-2 bg-accent/30 rounded-sm w-3/4" />
                          <div className="h-1.5 bg-accent/20 rounded-sm w-1/2" />
                        </div>
                      </div>
                    ))}
                  </div>
                  {/* Lock overlay */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/60 backdrop-blur-sm p-6 text-center">
                    <div className="h-12 w-12 rounded-sm bg-brand/10 flex items-center justify-center mb-4 border border-brand/20">
                      <Lock size={24} className="text-brand" />
                    </div>
                    <p className="technical-label text-[10px] font-black uppercase tracking-widest text-foreground mb-2">
                      {t('pro_feature')}
                    </p>
                    <p className="technical-label text-[8px] opacity-60 uppercase tracking-widest mb-4 leading-relaxed">
                      {t('audit_log_desc')}
                    </p>
                    <Link
                      href="/billing"
                      className="h-9 px-6 rounded-sm bg-brand text-white technical-label text-[10px] flex items-center hover:opacity-90 transition-opacity"
                    >
                      {t('upgrade')}
                    </Link>
                  </div>
                </>
              ) : (
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                  {auditLoading ? (
                    <div className="flex items-center justify-center h-40">
                      <span className="technical-label text-[9px] opacity-20 animate-pulse uppercase tracking-widest">{t('loading_audit')}</span>
                    </div>
                  ) : auditLogs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-40 gap-3">
                      <Zap size={28} className="text-muted-foreground opacity-10" />
                      <span className="technical-label text-[9px] opacity-20 uppercase tracking-widest">{t('no_activity')}</span>
                    </div>
                  ) : (
                    <div className="divide-y divide-border/50">
                      {auditLogs.map((log, i) => {
                        const style = ACTION_STYLES[log.action] ?? ACTION_STYLES.updated!;
                        const Icon = style.icon;
                        return (
                          <motion.div
                            key={log.id}
                            initial={{ opacity: 0, x: 8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.03 }}
                            className="flex items-start gap-3 px-4 sm:px-6 py-3 sm:py-4 hover:bg-accent/5 transition-colors group"
                          >
                            <div className={cn(
                              "h-7 w-7 rounded-sm flex items-center justify-center border shrink-0 mt-0.5",
                              style.type === "success" ? "bg-success/5 border-success/20 text-success" :
                              style.type === "warning" ? "bg-warning/5 border-warning/20 text-warning" :
                              style.type === "system"  ? "bg-brand/5 border-brand/20 text-brand" :
                              "bg-muted/5 border-border text-muted-foreground"
                            )}>
                              <Icon size={12} />
                            </div>
                            <div className="flex-1 min-w-0 space-y-0.5">
                              <p className="text-[10px] font-black uppercase tracking-tight text-foreground truncate group-hover:text-brand transition-colors">
                                {activityLabel(log, t)}
                              </p>
                              <div className="flex items-center gap-2">
                                <User size={9} className="opacity-30 shrink-0" />
                                <span className="technical-label text-[8px] opacity-40 uppercase">{log.entity_type}</span>
                              </div>
                              <p className="technical-label text-[8px] opacity-30">
                                {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                              </p>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
