import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { Target, BarChart3, FileText, CheckCircle2, Clock, TrendingUp } from "lucide-react";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute("/")({
  component: Dashboard,
});

function Dashboard() {
  const { t } = useTranslation();

  const tasks = [
    { title: "Revisar copy para campaña de Instagram", priority: t('common.high'), status: t('common.in_progress') },
    { title: "Diseñar creatividades para TikTok", priority: t('common.medium'), status: t('common.pending') },
    { title: "Enviar reporte mensual al cliente", priority: t('common.high'), status: t('common.pending') },
    { title: "Programar posts de la semana", priority: t('common.low'), status: t('common.in_progress') },
  ];

  const campaigns = [
    { name: "Lanzamiento Q2", channel: "Multi-canal", status: t('common.active'), progress: 65 },
    { name: "Black Friday Early", channel: "Instagram", status: t('common.planning'), progress: 20 },
    { name: "Newsletter Mayo", channel: "Email", status: t('common.active'), progress: 80 },
  ];

  const weekDays = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

  return (
    <DashboardLayout>
      <div className="space-y-6 p-4 sm:p-6 lg:p-8">
        <PageHeader
          title={t('dashboard.title')}
          description={t('dashboard.desc')}
        />

        {/* Stats */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title={t('dashboard.active_campaigns')}
            value="4"
            icon={BarChart3}
            trend={{ value: "+2 este mes", positive: true }}
          />
          <StatCard
            title={t('dashboard.planned_posts')}
            value="23"
            subtitle={t('dashboard.this_week')}
            icon={FileText}
          />
          <StatCard
            title={t('dashboard.goals_achieved')}
            value="7/12"
            subtitle="Q2 2026"
            icon={Target}
            trend={{ value: "58%", positive: true }}
          />
          <StatCard
            title={t('dashboard.pending_tasks')}
            value="8"
            icon={CheckCircle2}
            trend={{ value: "3 urgentes", positive: false }}
          />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Tasks */}
          <div className="lg:col-span-2 rounded-xl border border-border bg-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading text-lg font-semibold text-card-foreground">{t('dashboard.priority_tasks')}</h2>
              <span className="text-xs text-muted-foreground">{t('common.today')}</span>
            </div>
            <div className="space-y-3">
              {tasks.map((task, i) => (
                <div key={i} className="flex items-center gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-muted/50">
                  <div className={`h-2 w-2 rounded-full shrink-0 ${
                    task.priority === t('common.high') ? "bg-destructive" : task.priority === t('common.medium') ? "bg-warning" : "bg-success"
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
            <h2 className="font-heading text-lg font-semibold text-card-foreground mb-4">{t('dashboard.current_week')}</h2>
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
            <h2 className="font-heading text-lg font-semibold text-card-foreground">{t('dashboard.active_campaigns')}</h2>
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
