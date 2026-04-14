'use client';

import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader } from "@/components/PageHeader";
import { Lightbulb, Plus, TrendingUp } from "lucide-react";

const ideas = [
  { title: "Meme sobre SEO vs SEM", trend: "SEO Trends", format: "Imagen", platform: "Instagram", color: "bg-chart-1" },
  { title: "Storytelling de marca personal", trend: "Personal branding", format: "Carrusel", platform: "LinkedIn", color: "bg-chart-2" },
  { title: "Tutorial Google Analytics 4", trend: "GA4 Migration", format: "Video", platform: "YouTube", color: "bg-chart-3" },
  { title: "POV: cuando el cliente cambia el brief", trend: "Memes agencia", format: "Reel", platform: "TikTok", color: "bg-chart-4" },
  { title: "Checklist para lanzar campaña", trend: "Marketing ops", format: "Infografía", platform: "Instagram", color: "bg-chart-5" },
  { title: "Comparativa herramientas email mkt", trend: "Email marketing", format: "Post", platform: "LinkedIn", color: "bg-chart-1" },
  { title: "Trend jacking con evento tech", trend: "Eventos tech", format: "Short", platform: "TikTok", color: "bg-chart-2" },
  { title: "Caso de éxito: de 0 a 10K", trend: "Growth", format: "Hilo", platform: "LinkedIn", color: "bg-chart-3" },
];

export default function IdeasPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6 p-4 sm:p-6 lg:p-8">
        <PageHeader title="Banco de Ideas" description="Captura ideas rápidas para tu contenido">
          <button className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
            <Plus className="h-4 w-4" />
            Nueva idea
          </button>
        </PageHeader>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {ideas.map((idea, i) => (
            <div key={i} className="group rounded-xl border border-border bg-card p-4 transition-all hover:shadow-sm hover:-translate-y-0.5">
              <div className={`inline-flex rounded-lg p-2 ${idea.color}/10`}>
                <Lightbulb className={`h-4 w-4 text-primary`} />
              </div>
              <h3 className="mt-3 text-sm font-semibold text-card-foreground leading-snug">{idea.title}</h3>
              <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                <TrendingUp className="h-3 w-3" />
                <span>{idea.trend}</span>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">{idea.format}</span>
                <span className="text-[10px] font-medium text-muted-foreground">{idea.platform}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
