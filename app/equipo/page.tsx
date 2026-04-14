'use client';

import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader } from "@/components/PageHeader";
import { Users, MessageSquare, CheckCircle2, Clock, Plus } from "lucide-react";

const teamMembers = [
  { name: "Ana García", role: "Social Media Manager", avatar: "AG", tasks: 5, color: "bg-chart-1" },
  { name: "Carlos López", role: "Content Creator", avatar: "CL", tasks: 3, color: "bg-chart-2" },
  { name: "María Fernández", role: "Diseñadora", avatar: "MF", tasks: 7, color: "bg-chart-3" },
  { name: "Tú", role: "Marketing Lead", avatar: "TÚ", tasks: 8, color: "bg-primary" },
];

const sharedTasks = [
  { title: "Revisar estrategia Q2", assignee: "Ana García", status: "done", date: "10 Abr" },
  { title: "Crear briefing campaña nueva", assignee: "Carlos López", status: "in_progress", date: "15 Abr" },
  { title: "Diseñar creatividades para ads", assignee: "María Fernández", status: "in_progress", date: "16 Abr" },
  { title: "Aprobar presupuesto TikTok", assignee: "Tú", status: "todo", date: "18 Abr" },
  { title: "Preparar reporte mensual", assignee: "Ana García", status: "todo", date: "20 Abr" },
];

const comments = [
  { author: "Ana García", text: "¿Podemos mover el lanzamiento al jueves?", time: "Hace 2h" },
  { author: "Carlos López", text: "Creatividades listas para revisión 👆", time: "Hace 4h" },
  { author: "María Fernández", text: "Actualicé la paleta de colores en el drive", time: "Ayer" },
];

const statusIcons: Record<string, React.ReactNode> = {
  done: <CheckCircle2 className="h-4 w-4 text-success" />,
  in_progress: <Clock className="h-4 w-4 text-warning" />,
  todo: <div className="h-4 w-4 rounded-full border-2 border-muted-foreground" />,
};

export default function EquipoPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6 p-4 sm:p-6 lg:p-8">
        <PageHeader title="Zona Colaborativa" description="Trabaja en equipo con tu agencia o clientes">
          <button className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
            <Plus className="h-4 w-4" />
            Invitar
          </button>
        </PageHeader>

        {/* Team members */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {teamMembers.map((m, i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-4 text-center">
              <div className={`mx-auto flex h-10 w-10 items-center justify-center rounded-full ${m.color} text-sm font-bold text-primary-foreground`}>
                {m.avatar}
              </div>
              <p className="mt-2 text-sm font-semibold text-card-foreground">{m.name}</p>
              <p className="text-xs text-muted-foreground">{m.role}</p>
              <p className="mt-1 text-xs text-muted-foreground">{m.tasks} tareas</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Shared tasks */}
          <div className="lg:col-span-2 rounded-xl border border-border bg-card p-5">
            <h2 className="font-heading text-lg font-semibold text-card-foreground mb-4 flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Tareas del equipo
            </h2>
            <div className="space-y-3">
              {sharedTasks.map((t, i) => (
                <div key={i} className="flex items-center gap-3 rounded-lg border border-border p-3">
                  {statusIcons[t.status]}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${t.status === "done" ? "line-through text-muted-foreground" : "text-card-foreground"}`}>
                      {t.title}
                    </p>
                    <p className="text-xs text-muted-foreground">{t.assignee} · {t.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Comments */}
          <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="font-heading text-lg font-semibold text-card-foreground mb-4 flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              Comentarios recientes
            </h2>
            <div className="space-y-4">
              {comments.map((c, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-card-foreground">{c.author}</span>
                    <span className="text-[10px] text-muted-foreground">{c.time}</span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{c.text}</p>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <input
                type="text"
                placeholder="Escribe un comentario..."
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
