import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader } from "@/components/PageHeader";
import { Play, BookOpen, ExternalLink, Star } from "lucide-react";

export const Route = createFileRoute("/biblioteca")({
  head: () => ({
    meta: [
      { title: "Biblioteca de Aprendizaje — mkt.notes" },
      { name: "description", content: "Videos, cursos y recursos útiles para profesionales del marketing." },
    ],
  }),
  component: BibliotecaPage,
});

const videos = [
  { title: "Cómo crear una estrategia de contenido", channel: "Think Media", duration: "18 min", saved: true },
  { title: "Facebook Ads para principiantes 2026", channel: "HubSpot", duration: "45 min", saved: false },
  { title: "Storytelling en marketing digital", channel: "GaryVee", duration: "12 min", saved: true },
];

const courses = [
  { title: "Google Analytics Certification", provider: "Google", level: "Intermedio", free: true },
  { title: "Social Media Marketing", provider: "Coursera", level: "Básico", free: true },
  { title: "SEO Fundamentals", provider: "HubSpot Academy", level: "Básico", free: true },
  { title: "Email Marketing Mastery", provider: "Mailchimp", level: "Avanzado", free: true },
];

const resources = [
  { title: "Canva Templates Marketing", type: "Herramienta", url: "#" },
  { title: "Guía de tamaños de imagen RRSS 2026", type: "Guía", url: "#" },
  { title: "Calendario editorial template", type: "Plantilla", url: "#" },
  { title: "Paleta de colores para RRSS", type: "Herramienta", url: "#" },
];

function BibliotecaPage() {
  return (
    <DashboardLayout>
      <div className="space-y-8 p-4 sm:p-6 lg:p-8">
        <PageHeader title="Biblioteca de Aprendizaje" description="Recursos curados para tu crecimiento profesional" />

        {/* Videos */}
        <section>
          <h2 className="font-heading text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Play className="h-5 w-5 text-primary" />
            Videos recomendados
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {videos.map((v, i) => (
              <div key={i} className="rounded-xl border border-border bg-card p-4 transition-shadow hover:shadow-sm">
                <div className="flex aspect-video items-center justify-center rounded-lg bg-muted mb-3">
                  <Play className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-sm font-semibold text-card-foreground">{v.title}</h3>
                <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
                  <span>{v.channel}</span>
                  <span>{v.duration}</span>
                </div>
                {v.saved && (
                  <Star className="mt-2 h-3.5 w-3.5 fill-warning text-warning" />
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Courses */}
        <section>
          <h2 className="font-heading text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            Cursos gratuitos recomendados
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {courses.map((c, i) => (
              <div key={i} className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 transition-shadow hover:shadow-sm">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <BookOpen className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-card-foreground">{c.title}</h3>
                  <p className="text-xs text-muted-foreground">{c.provider} · {c.level}</p>
                </div>
                <span className="rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-medium text-success">Gratis</span>
              </div>
            ))}
          </div>
        </section>

        {/* Resources */}
        <section>
          <h2 className="font-heading text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <ExternalLink className="h-5 w-5 text-primary" />
            Recursos útiles
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {resources.map((r, i) => (
              <a key={i} href={r.url} className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 transition-all hover:shadow-sm hover:border-primary/30">
                <ExternalLink className="h-4 w-4 shrink-0 text-muted-foreground" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-card-foreground truncate">{r.title}</p>
                  <p className="text-xs text-muted-foreground">{r.type}</p>
                </div>
              </a>
            ))}
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}
