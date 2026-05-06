"use client";

import { useState } from "react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Lock, TrendingUp, Users, DollarSign, CheckSquare, LayoutGrid, Download, FileText, Loader2 } from "lucide-react";
import { formatCurrency, formatNumber } from "@/lib/utils/workspace";
import type { AnalyticsSnapshot } from "@/types";
import { format } from "date-fns";
import { cn } from "@/lib/utils/cn";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useWorkspace } from "@/hooks/use-workspace";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils/workspace";
import { AddSnapshotDialog } from "./add-snapshot-dialog";
import { exportAnalyticsCSV, exportAnalyticsPDF } from "@/lib/utils/export";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

export interface AnalyticsDashboardProps {
  isPro: boolean;
  snapshots: AnalyticsSnapshot[];
  campaigns: { id: string; name: string; status: string; budget?: number | null; platform?: string | null }[];
  clients: { id: string; company_name: string; monthly_retainer?: number | null; status: string }[];
  completedTasks: number;
  workspaceId: string;
}

export function AnalyticsDashboard({ isPro, snapshots, campaigns, clients, completedTasks, workspaceId }: AnalyticsDashboardProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "social" | "paid" | "business" | "team">("overview");
  const supabase = createClient();
  const { activeWorkspace } = useWorkspace();
  const t = useTranslations("analisis");

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { data: teamStats = [] } = useQuery({
    queryKey: ["team-task-stats", workspaceId],
    enabled: !!workspaceId && activeTab === "team",
    queryFn: async () => {
      const { data } = await supabase
        .from("tasks")
        .select("assignee_id, assignee:profiles!tasks_assignee_id_fkey(full_name, avatar_url)")
        .eq("workspace_id", workspaceId)
        .eq("status", "done")
        .gte("completed_at", thirtyDaysAgo.toISOString())
        .not("assignee_id", "is", null);

      if (!data) return [];

      const counts: Record<string, { name: string; avatar: string | null; count: number }> = {};
      for (const task of data) {
        const id = task.assignee_id as string;
        const profile = task.assignee as any;
        if (!counts[id]) counts[id] = { name: profile?.full_name ?? "Operator", avatar: profile?.avatar_url ?? null, count: 0 };
        counts[id]!.count++;
      }
      return Object.entries(counts)
        .map(([id, v]) => ({ id, ...v }))
        .sort((a, b) => b.count - a.count);
    },
  });

  const [exportingCSV, setExportingCSV] = useState(false);
  const [exportingPDF, setExportingPDF] = useState(false);

  async function handleExportCSV() {
    if (!isPro) { toast.error("Export requires a Pro plan"); return; }
    if (snapshots.length === 0) { toast.error("No data to export"); return; }
    setExportingCSV(true);
    exportAnalyticsCSV(snapshots, `analytics-${new Date().toISOString().split("T")[0]}.csv`);
    toast.success("CSV downloaded");
    setExportingCSV(false);
  }

  async function handleExportPDF() {
    if (!isPro) { toast.error("Export requires a Pro plan"); return; }
    if (snapshots.length === 0) { toast.error("No data to export"); return; }
    setExportingPDF(true);
    await exportAnalyticsPDF(snapshots, activeWorkspace?.name ?? "Workspace", `analytics-${new Date().toISOString().split("T")[0]}.pdf`);
    toast.success("PDF downloaded");
    setExportingPDF(false);
  }

  const totalMRR = clients
    .filter((c) => c.status === "active")
    .reduce((sum, c) => sum + (c.monthly_retainer ?? 0), 0);

  const activeCampaigns = campaigns.filter((c) => c.status === "active").length;
  const totalBudget = campaigns.reduce((sum, c) => sum + (c.budget ?? 0), 0);

  const chartData = snapshots.map((s) => ({
    date: format(new Date(s.metric_date), "MMM d"),
    impressions: (s.metrics.impressions ?? 0),
    reach: (s.metrics.reach ?? 0),
    engagement: (s.metrics.engagement_rate ?? 0),
    conversions: (s.metrics.conversions ?? 0),
    spend: (s.metrics.spend ?? 0),
    revenue: (s.metrics.revenue ?? 0),
    roas: (s.metrics.roas ?? 0),
  }));

  if (!isPro) {
    return (
      <div className="relative group overflow-hidden rounded-xl border border-border">
        {/* Blurred preview */}
        <div className="pointer-events-none select-none blur-xl opacity-20 transition-all group-hover:opacity-30">
          <div className="grid grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-accent/10 rounded-sm" />
            ))}
          </div>
          <div className="h-[400px] bg-accent/5 rounded-sm" />
        </div>

        {/* Upgrade CTA */}
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/40 backdrop-blur-md p-12 text-center">
          <div className="h-16 w-16 rounded-sm bg-brand/10 flex items-center justify-center mb-6 border border-brand/20">
            <Lock size={32} className="text-brand" />
          </div>
          <h3 className="text-2xl font-black uppercase tracking-tighter mb-2 text-foreground">{t("restricted_title")}</h3>
          <p className="max-w-md text-[11px] technical-label opacity-60 uppercase tracking-[0.2em] mb-8 leading-relaxed">
            {t("restricted_desc")}
          </p>
          <Button className="h-12 rounded-sm bg-brand px-12 technical-label text-[11px] text-white shadow-2xl shadow-brand/20 hover:scale-105 transition-transform" asChild>
            <a href="/billing">{t("restricted_btn")}</a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            onClick={handleExportCSV}
            disabled={exportingCSV}
            className="h-8 rounded-sm bg-accent/5 border border-border px-4 technical-label text-[10px] text-foreground hover:bg-brand/10 hover:text-brand gap-2 transition-all"
          >
            {exportingCSV ? <Loader2 size={12} className="animate-spin" /> : <Download size={12} />}
            {t("export_csv")}
            {!isPro && <span className="text-[8px] bg-brand/20 text-brand px-1 py-0.5 rounded-sm ml-1">PRO</span>}
          </Button>

          <Button
            onClick={handleExportPDF}
            disabled={exportingPDF}
            className="h-8 rounded-sm bg-accent/5 border border-border px-4 technical-label text-[10px] text-foreground hover:bg-brand/10 hover:text-brand gap-2 transition-all"
          >
            {exportingPDF ? <Loader2 size={12} className="animate-spin" /> : <FileText size={12} />}
            {t("export_pdf")}
            {!isPro && <span className="text-[8px] bg-brand/20 text-brand px-1 py-0.5 rounded-sm ml-1">PRO</span>}
          </Button>
        </div>

        <AddSnapshotDialog workspaceId={workspaceId} campaigns={campaigns.map(c => ({ id: c.id, name: c.name }))} />
      </div>

      {/* High-Contrast Metrics Matrix */}
      <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
        {[
          { label: t("metric_mrr"), value: formatCurrency(totalMRR), icon: DollarSign, color: "text-emerald-500", bg: "bg-emerald-500/10" },
          { label: t("metric_nodes"), value: activeCampaigns, icon: TrendingUp, color: "text-brand", bg: "bg-brand/10" },
          { label: t("metric_capital"), value: formatCurrency(totalBudget), icon: LayoutGrid, color: "text-brand", bg: "bg-brand/10" },
          { label: t("metric_tasks"), value: completedTasks, icon: CheckSquare, color: "text-amber-500", bg: "bg-amber-500/10" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="group relative flex flex-col rounded-xl border border-border bg-card p-6 transition-all hover:border-brand shadow-sm">
            <div className={cn("absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity", color)}>
              <Icon size={40} />
            </div>
            <div className="technical-label text-[10px] opacity-40 uppercase tracking-widest mb-1">{label}</div>
            <div className="contundente-number text-2xl">{value}</div>
          </div>
        ))}
      </div>

      {/* Strategic Navigation Matrix */}
      <div className="flex gap-1 bg-accent/5 p-1 rounded-xl w-fit border border-border/50">
        {(["overview","social","paid","business","team"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "px-6 py-2 rounded-sm technical-label text-[10px] uppercase tracking-[0.2em] transition-all",
              activeTab === tab 
                ? "bg-brand text-white shadow-lg shadow-brand/20" 
                : "text-muted-foreground hover:text-foreground hover:bg-accent/10"
            )}
          >
            {t(`tabs.${tab}`)}
          </button>
        ))}
      </div>

      {/* Intelligence Visualization */}
      {snapshots.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-accent/5 py-32 text-center flex flex-col items-center">
          <TrendingUp size={48} className="mb-4 text-muted-foreground opacity-10" />
          <h3 className="technical-label text-[11px] font-black uppercase tracking-widest text-muted-foreground">{t("empty_title")}</h3>
          <p className="mt-2 text-[10px] text-muted-foreground/40 uppercase tracking-widest max-w-xs">
            {t("empty_desc")}
          </p>
        </div>
      ) : (
        <div className="space-y-8 animate-in fade-in duration-700">
          {(activeTab === "overview" || activeTab === "social") && (
            <div className="rounded-xl border border-border bg-card p-8 shadow-sm">
              <div className="flex items-center justify-between mb-8 border-b border-border pb-4">
                <div className="technical-label text-[11px] flex items-center gap-2">
                  <TrendingUp size={16} className="text-brand" /> {t("chart_reach_title")}
                </div>
                <div className="text-[10px] technical-label opacity-40">{t("chart_reach_subtitle")}</div>
              </div>
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border/50" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }} 
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis 
                    tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }} 
                    tickFormatter={formatNumber}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '2px', fontSize: '10px' }}
                    labelStyle={{ fontWeight: 'black', textTransform: 'uppercase', marginBottom: '8px' }}
                  />
                  <Legend iconType="rect" wrapperStyle={{ paddingTop: '20px', fontSize: '9px', fontWeight: 'bold', textTransform: 'uppercase' }} />
                  <Line type="monotone" dataKey="impressions" stroke="#6366f1" strokeWidth={3} dot={false} activeDot={{ r: 4, strokeWidth: 0 }} />
                  <Line type="monotone" dataKey="reach" stroke="#a855f7" strokeWidth={3} dot={false} activeDot={{ r: 4, strokeWidth: 0 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {(activeTab === "overview" || activeTab === "paid") && (
            <div className="rounded-xl border border-border bg-card p-8 shadow-sm">
              <div className="flex items-center justify-between mb-8 border-b border-border pb-4">
                <div className="technical-label text-[11px] flex items-center gap-2">
                  <DollarSign size={16} className="text-emerald-500" /> {t("chart_financial_title")}
                </div>
                <div className="text-[10px] technical-label opacity-40">{t("chart_financial_subtitle")}</div>
              </div>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border/50" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }} 
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis 
                    tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }} 
                    tickFormatter={(v) => `$${formatNumber(v)}`}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '2px', fontSize: '10px' }}
                  />
                  <Legend iconType="rect" wrapperStyle={{ paddingTop: '20px', fontSize: '9px', fontWeight: 'bold', textTransform: 'uppercase' }} />
                  <Bar dataKey="spend" fill="#f59e0b" name={t("chart_spend")} radius={[2,2,0,0]} />
                  <Bar dataKey="revenue" fill="#10b981" name={t("chart_revenue")} radius={[2,2,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {(activeTab === "business") && (
            <div className="rounded-xl border border-border bg-card p-8 shadow-sm">
              <div className="flex items-center justify-between mb-8 border-b border-border pb-4">
                <div className="technical-label text-[11px] flex items-center gap-2">
                  <Users size={16} className="text-brand" /> {t("matrix_partner_title")}
                </div>
                <div className="text-[10px] technical-label opacity-40">{t("matrix_partner_subtitle")}</div>
              </div>
              <div className="space-y-6">
                {clients.filter(c => c.monthly_retainer).sort((a,b) => (b.monthly_retainer ?? 0) - (a.monthly_retainer ?? 0)).map((client) => {
                  const percentage = ((client.monthly_retainer ?? 0) / totalMRR) * 100;
                  return (
                    <div key={client.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="technical-label text-[10px] font-black uppercase text-foreground">{client.company_name}</span>
                          <Badge variant="outline" className="text-[7px] technical-label px-1 py-0 opacity-40 rounded-sm">{t("matrix_active")}</Badge>
                        </div>
                        <span className="technical-label text-[11px] font-black text-foreground">{formatCurrency(client.monthly_retainer ?? 0)}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 rounded-sm bg-accent/5 h-2 overflow-hidden border border-border/30">
                          <div
                            className="h-full bg-brand transition-all duration-1000"
                            style={{ width: `${Math.min(100, percentage)}%` }}
                          />
                        </div>
                        <span className="technical-label text-[9px] opacity-40 w-10 text-right">{percentage.toFixed(1)}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {(activeTab === "team") && (
            <div className="rounded-xl border border-border bg-card p-8 shadow-sm">
              <div className="flex items-center justify-between mb-8 border-b border-border pb-4">
                <div className="technical-label text-[11px] flex items-center gap-2">
                  <Users size={16} className="text-brand" /> {t("team_velocity_title")}
                </div>
                <div className="text-[10px] technical-label opacity-40">{t("team_velocity_subtitle")}</div>
              </div>

              {teamStats.length === 0 ? (
                <div className="py-16 text-center">
                  <div className="technical-label text-[10px] opacity-20 uppercase tracking-widest">{t("team_empty")}</div>
                </div>
              ) : (
                <div className="space-y-6">
                  {teamStats.map((member, i) => {
                    const max = teamStats[0]?.count ?? 1;
                    const pct = Math.round((member.count / max) * 100);
                    return (
                      <div key={member.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-7 w-7 rounded-sm border border-border">
                              <img src={member.avatar ?? undefined} alt="" />
                              <AvatarFallback className="text-[9px] font-black">{getInitials(member.name)}</AvatarFallback>
                            </Avatar>
                            <span className="technical-label text-[10px] font-black uppercase text-foreground">
                              {member.name}
                            </span>
                            {i === 0 && (
                              <span className="technical-label text-[7px] px-1.5 py-0.5 bg-brand text-white rounded-sm">{t("team_top")}</span>
                            )}
                          </div>
                          <span className="technical-label text-[11px] font-black text-foreground">
                            {member.count} <span className="opacity-40 text-[9px]">{t("team_tasks")}</span>
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex-1 rounded-sm bg-accent/5 h-2 overflow-hidden border border-border/30">
                            <div
                              className="h-full bg-brand transition-all duration-1000"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="technical-label text-[9px] opacity-40 w-10 text-right">{pct}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
