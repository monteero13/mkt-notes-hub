import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader } from "@/components/PageHeader";
import { ChevronLeft, ChevronRight } from "lucide-react";

export const Route = createFileRoute("/planificador")({
  head: () => ({
    meta: [
      { title: "Planificador Mensual — mkt.notes" },
      { name: "description", content: "Planifica tus campañas, deadlines y reuniones mes a mes." },
    ],
  }),
  component: PlanificadorPage,
});

const events: Record<number, { title: string; color: string }[]> = {
  3: [{ title: "Briefing Q2", color: "bg-primary" }],
  7: [{ title: "Launch IG", color: "bg-success" }],
  10: [{ title: "Deadline copy", color: "bg-destructive" }],
  13: [{ title: "Hoy", color: "bg-primary" }],
  15: [{ title: "Review ads", color: "bg-warning" }],
  20: [{ title: "Newsletter", color: "bg-info" }],
  25: [{ title: "Reporte", color: "bg-chart-4" }],
  28: [{ title: "Lanzamiento", color: "bg-success" }],
};

function PlanificadorPage() {
  const daysInMonth = 30;
  const startDay = 2; // Tuesday
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: startDay }, (_, i) => i);

  return (
    <DashboardLayout>
      <div className="space-y-6 p-4 sm:p-6 lg:p-8">
        <PageHeader title="Planificador Mensual" description="Abril 2026">
          <div className="flex items-center gap-2">
            <button className="rounded-lg border border-border p-2 text-muted-foreground hover:bg-muted transition-colors">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="font-heading text-sm font-semibold text-foreground">Abril 2026</span>
            <button className="rounded-lg border border-border p-2 text-muted-foreground hover:bg-muted transition-colors">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </PageHeader>

        <div className="rounded-xl border border-border bg-card overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-7 border-b border-border">
            {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map((d) => (
              <div key={d} className="py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {d}
              </div>
            ))}
          </div>

          {/* Grid */}
          <div className="grid grid-cols-7">
            {blanks.map((b) => (
              <div key={`blank-${b}`} className="min-h-20 border-b border-r border-border bg-muted/30" />
            ))}
            {days.map((day) => (
              <div
                key={day}
                className={`min-h-20 border-b border-r border-border p-1.5 transition-colors hover:bg-muted/40 ${
                  day === 13 ? "bg-primary/5" : ""
                }`}
              >
                <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${
                  day === 13 ? "bg-primary text-primary-foreground" : "text-card-foreground"
                }`}>
                  {day}
                </span>
                {events[day]?.map((ev, i) => (
                  <div key={i} className={`mt-1 truncate rounded px-1.5 py-0.5 text-[10px] font-medium text-primary-foreground ${ev.color}`}>
                    {ev.title}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
