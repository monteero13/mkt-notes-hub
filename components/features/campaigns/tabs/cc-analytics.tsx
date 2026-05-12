"use client";

import { AnalyticsSnapshot, CampaignPlatform } from "@/types";
import { BarChart2 } from "lucide-react";
import { format } from "date-fns";

interface Props {
  snapshots: AnalyticsSnapshot[];
  platform: CampaignPlatform | null;
}

const KPI_KEYS = [
  { key: "reach",           label: "Alcance",      fmt: (v: number) => v.toLocaleString("es") },
  { key: "impressions",     label: "Impresiones",  fmt: (v: number) => v.toLocaleString("es") },
  { key: "engagement_rate", label: "Engagement",   fmt: (v: number) => `${(v * 100).toFixed(2)}%` },
  { key: "conversions",     label: "Conversiones", fmt: (v: number) => v.toLocaleString("es") },
  { key: "spend",           label: "Gasto",        fmt: (v: number) => `€${v.toFixed(2)}` },
  { key: "revenue",         label: "Ingresos",     fmt: (v: number) => `€${v.toFixed(2)}` },
  { key: "roas",            label: "ROAS",         fmt: (v: number) => `${v.toFixed(2)}x` },
  { key: "cpc",             label: "CPC",          fmt: (v: number) => `€${v.toFixed(2)}` },
] as const;

export function CcAnalytics({ snapshots, platform }: Props) {
  if (snapshots.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center rounded-xl border border-dashed border-border">
        <BarChart2 size={32} className="mb-4 text-muted-foreground/20" />
        <p className="text-sm font-semibold text-muted-foreground">Sin métricas registradas</p>
        <p className="text-xs text-muted-foreground/50 mt-1">
          Añade snapshots de analítica para esta campaña desde el módulo Analítica.
        </p>
      </div>
    );
  }

  // Aggregate totals across all snapshots
  const totals: Record<string, number> = {};
  for (const snap of snapshots) {
    for (const { key } of KPI_KEYS) {
      const val = snap.metrics?.[key];
      if (typeof val === "number") totals[key] = (totals[key] ?? 0) + val;
    }
  }

  // For rate-type metrics (engagement_rate, roas, cpc) use average
  const avgKeys = ["engagement_rate", "roas", "cpc"];
  for (const k of avgKeys) {
    if (totals[k] != null) totals[k] = totals[k] / snapshots.length;
  }

  const visibleKpis = KPI_KEYS.filter(({ key }) => totals[key] != null);

  return (
    <div className="space-y-8">
      {/* Aggregated KPI cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {visibleKpis.map(({ key, label, fmt }) => (
          <div key={key} className="border border-border bg-card rounded-xl p-5 space-y-2">
            <p className="text-[10px] text-muted-foreground/60 uppercase tracking-widest">{label}</p>
            <p className="text-2xl font-light" style={{ fontFamily: "var(--font-clash), sans-serif" }}>
              {fmt(totals[key] ?? 0)}
            </p>
          </div>
        ))}
      </div>

      {/* Per-snapshot history */}
      <div className="border border-border bg-card rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <p className="text-[10px] text-muted-foreground/60 uppercase tracking-widest">Historial de Snapshots</p>
        </div>
        <div className="divide-y divide-border">
          {snapshots.map((snap) => {
            const m = snap.metrics ?? {};
            return (
              <div key={snap.id} className="px-6 py-4 flex items-center justify-between gap-4 hover:bg-accent/5 transition-colors">
                <div className="space-y-0.5">
                  <p className="text-sm font-semibold">{format(new Date(snap.metric_date), "d MMM yyyy")}</p>
                  {snap.platform && (
                    <p className="text-[10px] text-muted-foreground/50 uppercase tracking-wider">{snap.platform}</p>
                  )}
                </div>
                <div className="flex items-center gap-6 flex-wrap justify-end">
                  {KPI_KEYS.filter(({ key }) => m[key] != null).slice(0, 4).map(({ key, label, fmt }) => (
                    <div key={key} className="text-right">
                      <p className="text-xs font-bold">{fmt(m[key] as number)}</p>
                      <p className="text-[9px] text-muted-foreground/40 uppercase">{label}</p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
