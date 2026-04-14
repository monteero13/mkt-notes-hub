'use client';

import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader } from "@/components/PageHeader";
import { Plus } from "lucide-react";

const campaigns = [
  { name: "Lanzamiento Producto Q2", objective: "Awareness", channel: "Multi-canal", budget: "€2,500", kpi: "Alcance 50K", result: "32K", progress: 64 },
  { name: "Campaña Email Mayo", objective: "Conversión", channel: "Email", budget: "€500", kpi: "CTR 5%", result: "4.2%", progress: 84 },
  { name: "Instagram Ads Primavera", objective: "Leads", channel: "Instagram", budget: "€1,200", kpi: "200 leads", result: "145", progress: 72 },
  { name: "Content LinkedIn", objective: "Engagement", channel: "LinkedIn", budget: "€0", kpi: "500 interacciones", result: "380", progress: 76 },
  { name: "TikTok Viral Challenge", objective: "Awareness", channel: "TikTok", budget: "€800", kpi: "100K views", result: "45K", progress: 45 },
];

export default function CampanasPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6 p-4 sm:p-6 lg:p-8">
        <PageHeader title="Seguimiento de Campañas" description="Monitoriza el rendimiento de tus campañas">
          <button className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
            <Plus className="h-4 w-4" />
            Nueva campaña
          </button>
        </PageHeader>

        {/* Table - desktop */}
        <div className="hidden rounded-xl border border-border bg-card md:block overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-xs uppercase tracking-wider">Campaña</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-xs uppercase tracking-wider">Objetivo</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-xs uppercase tracking-wider">Canal</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-xs uppercase tracking-wider">Presupuesto</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-xs uppercase tracking-wider">KPI</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-xs uppercase tracking-wider">Resultado</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-xs uppercase tracking-wider w-32">Progreso</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((c, i) => (
                <tr key={i} className="border-b border-border last:border-0 hover:bg-muted/40 transition-colors">
                  <td className="px-4 py-3 font-medium text-card-foreground">{c.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{c.objective}</td>
                  <td className="px-4 py-3 text-muted-foreground">{c.channel}</td>
                  <td className="px-4 py-3 text-muted-foreground">{c.budget}</td>
                  <td className="px-4 py-3 text-muted-foreground">{c.kpi}</td>
                  <td className="px-4 py-3 font-medium text-card-foreground">{c.result}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                        <div className="h-full rounded-full bg-primary" style={{ width: `${c.progress}%` }} />
                      </div>
                      <span className="text-xs text-muted-foreground">{c.progress}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Cards - mobile */}
        <div className="space-y-4 md:hidden">
          {campaigns.map((c, i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-4">
              <h3 className="font-semibold text-card-foreground">{c.name}</h3>
              <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                <div><span className="text-muted-foreground">Objetivo:</span> <span className="text-card-foreground">{c.objective}</span></div>
                <div><span className="text-muted-foreground">Canal:</span> <span className="text-card-foreground">{c.channel}</span></div>
                <div><span className="text-muted-foreground">Presupuesto:</span> <span className="text-card-foreground">{c.budget}</span></div>
                <div><span className="text-muted-foreground">Resultado:</span> <span className="text-card-foreground">{c.result}</span></div>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${c.progress}%` }} />
                </div>
                <span className="text-xs font-medium text-muted-foreground">{c.progress}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
