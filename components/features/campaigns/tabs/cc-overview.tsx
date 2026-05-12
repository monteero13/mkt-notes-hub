"use client";

import { Campaign, Task, ActivityLog, Client, Profile } from "@/types";
import { AlertTriangle, CheckCircle2, Clock, Circle, TrendingUp, Zap, FileText, FolderOpen, MessageSquare, Plus, Edit2, ArrowRight, Shield } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow, isPast, format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils/cn";
import { formatCurrency } from "@/lib/utils/workspace";

interface Props {
  campaign: Campaign & { client?: Client | null; owner?: Profile | null };
  tasks: Task[];
  activity: ActivityLog[];
  contentCount?: number;
  assetCount?: number;
}

// ── Campaign Health ──────────────────────────────────────
type Health = "on_track" | "attention" | "delayed";

function computeHealth(tasks: Task[]): { status: Health; reason: string } {
  const active = tasks.filter((t) => t.status !== "done" && t.status !== "canceled");
  const overdue = active.filter((t) => t.due_date && isPast(new Date(t.due_date)));
  const inReview = tasks.filter((t) => t.status === "in_review");

  if (overdue.length >= 2) return { status: "delayed", reason: `${overdue.length} tareas vencidas` };
  if (overdue.length === 1) return { status: "attention", reason: "1 tarea vencida" };
  if (inReview.length >= 3) return { status: "attention", reason: `${inReview.length} contenidos en revisión` };
  return { status: "on_track", reason: "Todo en orden" };
}

const HEALTH_CONFIG = {
  on_track:  { label: "On Track",         dot: "bg-green-400",  text: "text-green-400",  border: "border-green-500/20", bg: "bg-green-500/5" },
  attention: { label: "Attention Needed", dot: "bg-yellow-400", text: "text-yellow-400", border: "border-yellow-500/20", bg: "bg-yellow-500/5" },
  delayed:   { label: "Delayed",          dot: "bg-red-400",    text: "text-red-400",    border: "border-red-500/20",   bg: "bg-red-500/5" },
};

// ── Activity icons ───────────────────────────────────────
const ACTION_ICON: Record<string, { Icon: React.ElementType; color: string }> = {
  created:  { Icon: Plus,          color: "text-green-400 bg-green-500/10" },
  updated:  { Icon: Edit2,         color: "text-blue-400 bg-blue-500/10" },
  commented:{ Icon: MessageSquare, color: "text-purple-400 bg-purple-500/10" },
  approved: { Icon: CheckCircle2,  color: "text-brand bg-brand/10" },
  deleted:  { Icon: AlertTriangle, color: "text-red-400 bg-red-500/10" },
  moved:    { Icon: ArrowRight,    color: "text-yellow-400 bg-yellow-500/10" },
};

// ── Status colors for stacked bar ───────────────────────
const STATUS_BAR: Record<string, string> = {
  backlog:     "bg-muted-foreground/20",
  todo:        "bg-muted-foreground/40",
  in_progress: "bg-blue-500",
  in_review:   "bg-yellow-400",
  done:        "bg-brand",
  canceled:    "bg-red-500/60",
};

const STATUS_LABEL_MAP: Record<string, string> = {
  backlog: "Backlog", todo: "Por Hacer", in_progress: "En Curso",
  in_review: "Revisión", done: "Hecho", canceled: "Cancelado",
};

const STATUS_ORDER = ["in_progress", "in_review", "todo", "backlog", "done", "canceled"] as const;

export function CcOverview({ campaign, tasks, activity, contentCount = 0, assetCount = 0 }: Props) {
  const doneTasks   = tasks.filter((t) => t.status === "done").length;
  const totalTasks  = tasks.length;
  const progress    = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;
  const blocked     = tasks.filter((t) => t.due_date && isPast(new Date(t.due_date)) && t.status !== "done").length;
  const kpiEntries  = Object.entries(campaign.kpi_targets ?? {}).filter(([, v]) => v != null);
  const { status: health, reason: healthReason } = computeHealth(tasks);
  const hc = HEALTH_CONFIG[health];

  const statusCounts = STATUS_ORDER.map((s) => ({
    s,
    count: tasks.filter((t) => t.status === s).length,
  })).filter(({ count }) => count > 0);

  return (
    <div className="space-y-6">

      {/* ══════════════════════════════════════════════════════
          HERO — Campaign Command Header
      ══════════════════════════════════════════════════════ */}
      <div className="relative rounded-2xl border border-brand/20 bg-gradient-to-br from-brand/5 via-card to-card overflow-hidden p-6 sm:p-8">
        {/* Background glow */}
        <div className="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-brand/10 blur-3xl pointer-events-none" />

        {/* Top row: platform + health */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <div className="space-y-1">
            {campaign.platform && (
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand/70">
                {campaign.platform.replace("_", " ")}
              </p>
            )}
            <h1 className="text-3xl sm:text-4xl font-light tracking-tight" style={{ fontFamily: "var(--font-clash), sans-serif" }}>
              {campaign.name}
            </h1>
            {campaign.client && (
              <p className="text-sm text-muted-foreground/70 font-medium">{campaign.client.company_name}</p>
            )}
          </div>

          {/* Campaign Health badge */}
          <div className={cn("shrink-0 flex items-center gap-2 rounded-xl border px-4 py-3", hc.border, hc.bg)}>
            <Shield size={14} className={hc.text} />
            <div>
              <p className="text-[9px] text-muted-foreground/50 uppercase tracking-widest">Campaign Health</p>
              <p className={cn("text-xs font-black", hc.text)}>{hc.label}</p>
              <p className="text-[9px] text-muted-foreground/50">{healthReason}</p>
            </div>
          </div>
        </div>

        {/* Live KPI strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            {
              label: "Presupuesto",
              value: campaign.budget ? formatCurrency(campaign.budget) : "—",
              icon: <Zap size={12} className="text-brand" />,
              accent: false,
            },
            {
              label: "Progreso",
              value: `${progress}%`,
              icon: <TrendingUp size={12} className="text-brand" />,
              accent: false,
              sub: `${doneTasks}/${totalTasks} tareas`,
            },
            {
              label: "Contenidos",
              value: String(contentCount),
              icon: <FileText size={12} className="text-brand" />,
              accent: false,
            },
            {
              label: blocked > 0 ? "Tareas vencidas" : "Assets",
              value: blocked > 0 ? String(blocked) : String(assetCount),
              icon: blocked > 0 ? <AlertTriangle size={12} className="text-red-400" /> : <FolderOpen size={12} className="text-brand" />,
              accent: blocked > 0,
            },
          ].map(({ label, value, icon, accent, sub }) => (
            <div
              key={label}
              className={cn(
                "rounded-xl border p-4 space-y-1.5",
                accent ? "border-red-500/20 bg-red-500/5" : "border-border/50 bg-card/50 backdrop-blur-sm"
              )}
            >
              <div className="flex items-center gap-1.5">
                {icon}
                <span className="text-[10px] text-muted-foreground/60 uppercase tracking-widest">{label}</span>
              </div>
              <p className={cn("text-2xl font-light", accent ? "text-red-400" : "text-foreground")}
                style={{ fontFamily: "var(--font-clash), sans-serif" }}>
                {value}
              </p>
              {sub && <p className="text-[10px] text-muted-foreground/40">{sub}</p>}
            </div>
          ))}
        </div>

        {/* Team avatars + dates */}
        <div className="mt-5 pt-5 border-t border-border/30 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            {campaign.owner && (
              <div className="flex items-center gap-2">
                <Avatar className="h-7 w-7 rounded-lg border border-border">
                  <AvatarImage src={campaign.owner.avatar_url ?? undefined} />
                  <AvatarFallback className="text-[10px] font-bold rounded-lg bg-brand/10 text-brand">
                    {campaign.owner.full_name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs font-semibold text-muted-foreground">{campaign.owner.full_name}</span>
                <span className="text-[10px] text-muted-foreground/40">· Responsable</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-3 text-[10px] text-muted-foreground/50">
            {campaign.start_date && (
              <span>{format(new Date(campaign.start_date), "d MMM")}</span>
            )}
            {campaign.start_date && campaign.end_date && <span>→</span>}
            {campaign.end_date && (
              <span>{format(new Date(campaign.end_date), "d MMM yyyy")}</span>
            )}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
          MAIN GRID
      ══════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* ── LEFT: task progress + KPIs + objective ────── */}
        <div className="lg:col-span-3 space-y-5">

          {/* Stacked Task Progress */}
          <div className="border border-border bg-card rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Progreso de Tareas</p>
              <span className="text-xs font-bold text-brand">{progress}% completado</span>
            </div>

            {/* Stacked segmented bar */}
            {totalTasks > 0 ? (
              <div className="flex h-2.5 w-full rounded-full overflow-hidden gap-px">
                {statusCounts.map(({ s, count }) => (
                  <div
                    key={s}
                    className={cn("h-full transition-all duration-500", STATUS_BAR[s])}
                    style={{ width: `${(count / totalTasks) * 100}%` }}
                    title={`${STATUS_LABEL_MAP[s]}: ${count}`}
                  />
                ))}
              </div>
            ) : (
              <div className="h-2.5 w-full rounded-full bg-border" />
            )}

            {/* Legend */}
            <div className="flex flex-wrap gap-3">
              {statusCounts.map(({ s, count }) => (
                <div key={s} className="flex items-center gap-1.5">
                  <div className={cn("h-2 w-2 rounded-full", STATUS_BAR[s])} />
                  <span className="text-[10px] text-muted-foreground/60">
                    {STATUS_LABEL_MAP[s]} <span className="font-bold text-foreground">{count}</span>
                  </span>
                </div>
              ))}
            </div>

            {/* Urgent tasks */}
            {tasks.filter((t) => t.priority === "urgent" && t.status !== "done").length > 0 && (
              <div className="pt-3 border-t border-border/50 space-y-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-red-400">🔴 Urgente</p>
                {tasks
                  .filter((t) => t.priority === "urgent" && t.status !== "done")
                  .slice(0, 3)
                  .map((t) => (
                    <div key={t.id} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <Circle size={10} className="text-red-400 shrink-0" />
                        <span className="font-medium truncate">{t.title}</span>
                      </div>
                      {t.due_date && (
                        <span className={cn("text-[10px] shrink-0 ml-2", isPast(new Date(t.due_date)) ? "text-red-400 font-bold" : "text-muted-foreground/50")}>
                          {format(new Date(t.due_date), "d MMM")}
                        </span>
                      )}
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* Objective */}
          {campaign.objective && (
            <div className="border border-border bg-card rounded-xl p-5 space-y-2">
              <p className="text-[10px] font-black uppercase tracking-widest text-brand">Objetivo</p>
              <p className="text-sm text-muted-foreground leading-relaxed">{campaign.objective}</p>
            </div>
          )}

          {/* KPI Targets */}
          {kpiEntries.length > 0 && (
            <div className="border border-border bg-card rounded-xl p-5 space-y-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-brand">KPI Targets</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {kpiEntries.map(([key, value]) => (
                  <div key={key} className="rounded-xl bg-accent/5 border border-border/50 p-3 space-y-0.5">
                    <p className="text-[9px] text-muted-foreground/50 uppercase tracking-wider">{key.replace(/_/g, " ")}</p>
                    <p className="text-lg font-light" style={{ fontFamily: "var(--font-clash), sans-serif" }}>
                      {String(value)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── RIGHT: Activity feed (dominant) ─────────── */}
        <div className="lg:col-span-2">
          <div className="border border-border bg-card rounded-xl overflow-hidden h-full">
            <div className="px-5 py-4 border-b border-border flex items-center justify-between">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                Actividad · Campaign Pulse
              </p>
              {activity.length > 0 && (
                <span className="text-[10px] text-brand font-bold">{activity.length} eventos</span>
              )}
            </div>

            {activity.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                <Clock size={24} className="mb-3 text-muted-foreground/20" />
                <p className="text-xs font-semibold text-muted-foreground/50">Sin actividad registrada</p>
              </div>
            ) : (
              <div className="divide-y divide-border/50">
                {activity.map((log) => {
                  const actionConfig = ACTION_ICON[log.action] ?? { Icon: Zap, color: "text-brand bg-brand/10" };
                  const { Icon, color } = actionConfig;
                  const user = (log.user as any);

                  return (
                    <div key={log.id} className="px-5 py-4 flex items-start gap-3 hover:bg-accent/5 transition-colors">
                      {/* Action icon */}
                      <div className={cn("h-7 w-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5", color)}>
                        <Icon size={12} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 space-y-0.5">
                        <p className="text-xs font-semibold text-foreground leading-snug">
                          <span className="text-brand">{user?.full_name ?? "Sistema"}</span>
                          {" "}
                          <span className="text-muted-foreground/70 font-normal">
                            {log.action}{" "}
                            {(log.metadata as any)?.title
                              ? <span className="text-foreground font-semibold">"{(log.metadata as any).title}"</span>
                              : log.entity_type}
                          </span>
                        </p>
                        <p className="text-[10px] text-muted-foreground/40">
                          {formatDistanceToNow(new Date(log.created_at), { addSuffix: true, locale: es })}
                        </p>
                      </div>

                      {/* User avatar */}
                      {user && (
                        <Avatar className="h-6 w-6 rounded-lg border border-border shrink-0">
                          <AvatarImage src={user.avatar_url ?? undefined} />
                          <AvatarFallback className="text-[9px] font-bold rounded-lg bg-brand/10 text-brand">
                            {user.full_name?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
