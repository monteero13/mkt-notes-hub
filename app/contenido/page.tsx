'use client';

import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader } from "@/components/PageHeader";
import { Instagram, Youtube, Linkedin, Music2, Plus } from "lucide-react";
import { useState } from "react";

type ContentStatus = "idea" | "en_proceso" | "publicado";

interface ContentItem {
  id: number;
  title: string;
  platform: string;
  type: string;
  status: ContentStatus;
  date: string;
}

const initialContent: ContentItem[] = [
  { id: 1, title: "Reel tendencia #marketing", platform: "Instagram", type: "Reel", status: "idea", date: "14 Abr" },
  { id: 2, title: "Guía SEO 2026", platform: "LinkedIn", type: "Carrusel", status: "en_proceso", date: "15 Abr" },
  { id: 3, title: "Tutorial Ads", platform: "YouTube", type: "Video", status: "publicado", date: "10 Abr" },
  { id: 4, title: "Tips branding", platform: "TikTok", type: "Short", status: "en_proceso", date: "16 Abr" },
  { id: 5, title: "Caso de éxito cliente", platform: "LinkedIn", type: "Post", status: "idea", date: "18 Abr" },
  { id: 6, title: "Behind the scenes agencia", platform: "Instagram", type: "Story", status: "publicado", date: "11 Abr" },
];

const platformIcons: Record<string, React.ElementType> = {
  Instagram,
  YouTube: Youtube,
  LinkedIn: Linkedin,
  TikTok: Music2,
};

const statusConfig: Record<ContentStatus, { label: string; classes: string }> = {
  idea: { label: "Idea", classes: "bg-muted text-muted-foreground" },
  en_proceso: { label: "En proceso", classes: "bg-warning/15 text-warning-foreground" },
  publicado: { label: "Publicado", classes: "bg-success/15 text-success" },
};

const FileTextIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
    <path d="M14 2v4a2 2 0 0 0 2 2h4" />
  </svg>
);

export default function ContenidoPage() {
  const [filter, setFilter] = useState<ContentStatus | "all">("all");
  const filtered = filter === "all" ? initialContent : initialContent.filter((c) => c.status === filter);

  return (
    <DashboardLayout>
      <div className="space-y-6 p-4 sm:p-6 lg:p-8">
        <PageHeader title="Calendario de Contenido" description="Planifica y organiza tus publicaciones">
          <button className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
            <Plus className="h-4 w-4" />
            Nuevo
          </button>
        </PageHeader>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          {(["all", "idea", "en_proceso", "publicado"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                filter === s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-accent"
              }`}
            >
              {s === "all" ? "Todos" : statusConfig[s].label}
            </button>
          ))}
        </div>

        {/* Content grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item) => {
            const PlatformIcon = platformIcons[item.platform] || FileTextIcon;
            const status = statusConfig[item.status];
            return (
              <div key={item.id} className="rounded-xl border border-border bg-card p-4 transition-shadow hover:shadow-sm">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <PlatformIcon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs font-medium text-muted-foreground">{item.platform}</span>
                  </div>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${status.classes}`}>
                    {status.label}
                  </span>
                </div>
                <h3 className="mt-2 text-sm font-semibold text-card-foreground">{item.title}</h3>
                <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                  <span>{item.type}</span>
                  <span>{item.date}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}
