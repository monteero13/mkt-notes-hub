"use client";

import { useState, useEffect, useTransition } from "react";
import { Bell, Check, CheckCheck, Trash2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { createClient } from "@/lib/supabase/client";
import { markNotificationRead, markAllNotificationsRead, deleteNotification } from "@/actions/notifications";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils/cn";
import { toast } from "sonner";
import Link from "next/link";

interface Notification {
  id: string;
  type: string;
  title: string;
  body?: string | null;
  entity_type?: string | null;
  entity_id?: string | null;
  is_read: boolean;
  created_at: string;
}

interface Props {
  workspaceId: string;
  userId: string;
}

export function NotificationsPopover({ workspaceId, userId }: Props) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const [, startTransition] = useTransition();

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  useEffect(() => {
    const supabase = createClient();

    // Initial load
    supabase
      .from("notifications")
      .select("*")
      .eq("workspace_id", workspaceId)
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(30)
      .then(({ data }: { data: Notification[] | null }) => { if (data) setNotifications(data); });

    // Realtime subscription
    const channel = supabase
      .channel(`notifications-${userId}-${Date.now()}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "notifications",
        filter: `user_id=eq.${userId}`,
      }, (payload: { new: Notification }) => {
        setNotifications((prev) => [payload.new, ...prev]);
      })
      .on("postgres_changes", {
        event: "UPDATE",
        schema: "public",
        table: "notifications",
        filter: `user_id=eq.${userId}`,
      }, (payload: { new: Notification }) => {
        setNotifications((prev) => prev.map((n) => n.id === payload.new.id ? payload.new : n));
      })
      .on("postgres_changes", {
        event: "DELETE",
        schema: "public",
        table: "notifications",
        filter: `user_id=eq.${userId}`,
      }, (payload: { old: { id: string } }) => {
        setNotifications((prev) => prev.filter((n) => n.id !== payload.old.id));
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [workspaceId, userId]);

  function handleMarkRead(id: string) {
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, is_read: true } : n));
    startTransition(async () => {
      const result = await markNotificationRead(id);
      if (result.error) toast.error(result.error);
    });
  }

  function handleMarkAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    startTransition(async () => {
      const result = await markAllNotificationsRead(workspaceId);
      if (result.error) toast.error(result.error);
    });
  }

  function handleDelete(id: string) {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    startTransition(async () => {
      const result = await deleteNotification(id);
      if (result.error) toast.error(result.error);
    });
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-lg">
          <Bell size={18} />
          {unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-brand text-[9px] font-black text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
          <span className="sr-only">Notificaciones</span>
        </Button>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-96 p-0 rounded-sm border-border bg-card shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div className="flex items-center gap-2">
            <Bell size={14} className="text-brand" />
            <span className="technical-label text-[11px] font-black uppercase tracking-widest">
              Notificaciones
            </span>
            {unreadCount > 0 && (
              <span className="rounded-sm bg-brand/10 px-1.5 py-0.5 text-[9px] font-black text-brand">
                {unreadCount} nuevas
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllRead}
              className="h-7 rounded-sm technical-label text-[9px] gap-1 hover:bg-accent/10"
            >
              <CheckCheck size={12} /> Leer todas
            </Button>
          )}
        </div>

        {/* List */}
        <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Bell size={24} className="mb-3 text-muted-foreground opacity-20" />
              <p className="technical-label text-[10px] uppercase tracking-widest text-muted-foreground opacity-40">
                Sin notificaciones
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className={cn(
                    "group flex items-start gap-3 px-4 py-3 transition-colors hover:bg-accent/5",
                    !n.is_read && "bg-brand/5"
                  )}
                >
                  {!n.is_read && (
                    <div className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                  )}
                  <div className={cn("flex-1 min-w-0", n.is_read && "pl-[18px]")}>
                    <p className="text-[11px] font-black uppercase tracking-tight text-foreground truncate">
                      {n.title}
                    </p>
                    {n.body && (
                      <p className="mt-0.5 text-[10px] text-muted-foreground truncate">{n.body}</p>
                    )}
                    <p className="mt-1 technical-label text-[8px] opacity-40">
                      {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {!n.is_read && (
                      <button
                        onClick={() => handleMarkRead(n.id)}
                        className="h-6 w-6 rounded-sm flex items-center justify-center hover:bg-accent/20 text-muted-foreground hover:text-foreground"
                        title="Marcar como leída"
                      >
                        <Check size={11} />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(n.id)}
                      className="h-6 w-6 rounded-sm flex items-center justify-center hover:bg-error/10 text-muted-foreground hover:text-error"
                      title="Eliminar"
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="h-10 border-t border-border flex items-center justify-center bg-accent/5">
          <Link
            href="/notifications"
            onClick={() => setOpen(false)}
            className="technical-label text-[9px] text-muted-foreground hover:text-brand transition-colors flex items-center gap-1.5"
          >
            See All <ArrowRight size={10} />
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}
