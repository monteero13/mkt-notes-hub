import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { Target, BarChart3, FileText, CheckCircle2, Clock, TrendingUp } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Dashboard,
});

const tasks = [
  { title: "Revisar copy para campaña de Instagram", priority: "Alta", status: "En proceso" },
  { title: "Diseñar creatividades para TikTok", priority: "Media", status: "Pendiente" },
  { title: "Enviar reporte mensual al cliente", priority: "Alta", status: "Pendiente" },
  { title: "Programar posts de la semana", priority: "Baja", status: "En proceso" },
];

const campaigns = [
  { name: "Lanzamiento Q2", channel: "Multi-canal", status: "Activa", progress: 65 },
  { name: "Black Friday Early", channel: "Instagram", status: "Planificación", progress: 20 },
  { name: "Newsletter Mayo", channel: "Email", status: "Activa", progress: 80 },
];

const weekDays = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

function Dashboard() {
  return (
    <DashboardLayout>
      <div className="space-y-6 p-4 sm:p-6 lg:p-8">
        <PageHeader
          title="Dashboard"
          description="Resumen de tu actividad de marketing"
        />

        {/* Stats */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Campañas activas"
            value="4"
            icon={BarChart3}
            trend={{ value: "+2 este mes", positive: true }}
          />
          <StatCard
            title="Posts planificados"
            value="23"
            subtitle="Esta semana"
            icon={FileText}
          />
          <StatCard
            title="Objetivos cumplidos"
            value="7/12"
            subtitle="Q2 2026"
            icon={Target}
            trend={{ value: "58%", positive: true }}
          />
          <StatCard
            title="Tareas pendientes"
            value="8"
            icon={CheckCircle2}
            trend={{ value: "3 urgentes", positive: false }}
          />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Tasks */}
          <div className="lg:col-span-2 rounded-xl border border-border bg-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading text-lg font-semibold text-card-foreground">Tareas prioritarias</h2>
              <span className="text-xs text-muted-foreground">Hoy</span>
            </div>
            <div className="space-y-3">
              {tasks.map((task, i) => (
                <div key={i} className="flex items-center gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-muted/50">
                  <div className={`h-2 w-2 rounded-full shrink-0 ${
                    task.priority === "Alta" ? "bg-destructive" : task.priority === "Media" ? "bg-warning" : "bg-success"
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-card-foreground truncate">{task.title}</p>
                    <p className="text-xs text-muted-foreground">{task.priority} · {task.status}</p>
                  </div>
                  <Clock className="h-4 w-4 shrink-0 text-muted-foreground" />
                </div>
              ))}
            </div>
          </div>

          {/* Mini calendar */}
          <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="font-heading text-lg font-semibold text-card-foreground mb-4">Semana actual</h2>
            <div className="grid grid-cols-7 gap-1">
              {weekDays.map((d) => (
                <div key={d} className="text-center text-xs font-medium text-muted-foreground py-1">{d}</div>
              ))}
              {[12, 13, 14, 15, 16, 17, 18].map((d) => (
                <button
                  key={d}
                  className={`rounded-lg py-2 text-sm font-medium transition-colors ${
                    d === 13
                      ? "bg-primary text-primary-foreground"
                      : "text-card-foreground hover:bg-muted"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                <span className="text-card-foreground">Reunión con cliente — 10:00</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="h-1.5 w-1.5 rounded-full bg-warning" />
                <span className="text-card-foreground">Deadline campaña — 18:00</span>
              </div>
            </div>
          </div>
        </div>

        {/* Active Campaigns */}
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading text-lg font-semibold text-card-foreground">Campañas activas</h2>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="space-y-4">
            {campaigns.map((c, i) => (
              <div key={i} className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-card-foreground">{c.name}</p>
                  <p className="text-xs text-muted-foreground">{c.channel} · {c.status}</p>
                </div>
                <div className="flex items-center gap-3 sm:w-48">
                  <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${c.progress}%` }} />
                  </div>
                  <span className="text-xs font-medium text-muted-foreground w-8 text-right">{c.progress}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
