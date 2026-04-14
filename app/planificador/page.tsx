'use client';

import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader } from "@/components/PageHeader";
import { ChevronLeft, ChevronRight, X, Plus, Clock, Trash2 } from "lucide-react";
import { useState } from "react";

interface HourlyTask {
  id: string;
  title: string;
  hour: number;
  color: string;
}

const colorOptions = [
  { label: "Azul", value: "bg-primary" },
  { label: "Verde", value: "bg-success" },
  { label: "Rojo", value: "bg-destructive" },
  { label: "Naranja", value: "bg-warning" },
  { label: "Morado", value: "bg-chart-4" },
  { label: "Cyan", value: "bg-info" },
];

const calendarEvents: Record<number, { title: string; color: string }[]> = {
  3: [{ title: "Briefing Q2", color: "bg-primary" }],
  7: [{ title: "Launch IG", color: "bg-success" }],
  10: [{ title: "Deadline copy", color: "bg-destructive" }],
  13: [{ title: "Hoy", color: "bg-primary" }],
  15: [{ title: "Review ads", color: "bg-warning" }],
  20: [{ title: "Newsletter", color: "bg-info" }],
  25: [{ title: "Reporte", color: "bg-chart-4" }],
  28: [{ title: "Lanzamiento", color: "bg-success" }],
};

const hours = Array.from({ length: 16 }, (_, i) => i + 7); // 7:00 - 22:00

function formatHour(h: number) {
  return `${h.toString().padStart(2, "0")}:00`;
}

export default function PlanificadorPage() {
  const daysInMonth = 30;
  const startDay = 2;
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: startDay }, (_, i) => i);

  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [tasks, setTasks] = useState<Record<number, HourlyTask[]>>({
    13: [
      { id: "1", title: "Reunión equipo creativo", hour: 10, color: "bg-primary" },
      { id: "2", title: "Review campaña Instagram", hour: 14, color: "bg-success" },
      { id: "3", title: "Deadline envío copy", hour: 18, color: "bg-destructive" },
    ],
    15: [
      { id: "4", title: "Revisión anuncios Google Ads", hour: 9, color: "bg-warning" },
      { id: "5", title: "Call con cliente", hour: 16, color: "bg-info" },
    ],
  });

  // New task form
  const [showForm, setShowForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newHour, setNewHour] = useState(9);
  const [newColor, setNewColor] = useState("bg-primary");

  const dayTasks = selectedDay ? tasks[selectedDay] || [] : [];

  const addTask = () => {
    if (!selectedDay || !newTitle.trim()) return;
    const task: HourlyTask = {
      id: Date.now().toString(),
      title: newTitle.trim(),
      hour: newHour,
      color: newColor,
    };
    setTasks((prev) => ({
      ...prev,
      [selectedDay]: [...(prev[selectedDay] || []), task].sort((a, b) => a.hour - b.hour),
    }));
    setNewTitle("");
    setNewHour(9);
    setNewColor("bg-primary");
    setShowForm(false);
  };

  const removeTask = (taskId: string) => {
    if (!selectedDay) return;
    setTasks((prev) => ({
      ...prev,
      [selectedDay]: (prev[selectedDay] || []).filter((t) => t.id !== taskId),
    }));
  };

  const getDayTaskCount = (day: number) => (tasks[day]?.length || 0) + (calendarEvents[day]?.length || 0);

  return (
    <DashboardLayout>
      <div className="space-y-6 p-4 sm:p-6 lg:p-8">
        <PageHeader title="Planificador Mensual" description="Abril 2026 · Haz clic en un día para ver la planificación horaria">
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

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Calendar */}
          <div className={`rounded-xl border border-border bg-card overflow-hidden ${selectedDay ? "lg:col-span-2" : "lg:col-span-3"}`}>
            <div className="grid grid-cols-7 border-b border-border">
              {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map((d) => (
                <div key={d} className="py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {d}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7">
              {blanks.map((b) => (
                <div key={`blank-${b}`} className="min-h-20 border-b border-r border-border bg-muted/30" />
              ))}
              {days.map((day) => {
                const isSelected = selectedDay === day;
                const isToday = day === 13;
                const taskCount = getDayTaskCount(day);

                return (
                  <button
                    key={day}
                    onClick={() => setSelectedDay(isSelected ? null : day)}
                    className={`min-h-20 border-b border-r border-border p-1.5 text-left transition-colors hover:bg-muted/40 ${
                      isSelected ? "bg-primary/10 ring-2 ring-primary ring-inset" : isToday ? "bg-primary/5" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${
                        isToday ? "bg-primary text-primary-foreground" : "text-card-foreground"
                      }`}>
                        {day}
                      </span>
                      {taskCount > 0 && (
                        <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-muted px-1 text-[9px] font-semibold text-muted-foreground">
                          {taskCount}
                        </span>
                      )}
                    </div>
                    {calendarEvents[day]?.map((ev, i) => (
                      <div key={i} className={`mt-1 truncate rounded px-1.5 py-0.5 text-[10px] font-medium text-primary-foreground ${ev.color}`}>
                        {ev.title}
                      </div>
                    ))}
                    {(tasks[day]?.length || 0) > 0 && (
                      <div className="mt-1 flex gap-0.5">
                        {tasks[day]!.slice(0, 3).map((t) => (
                          <div key={t.id} className={`h-1.5 flex-1 rounded-full ${t.color}`} />
                        ))}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Hourly panel */}
          {selectedDay && (
            <div className="rounded-xl border border-border bg-card overflow-hidden lg:col-span-1">
              {/* Panel header */}
              <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <div>
                  <h2 className="font-heading text-base font-semibold text-card-foreground">
                    {selectedDay} de Abril
                  </h2>
                  <p className="text-xs text-muted-foreground">{dayTasks.length} tarea{dayTasks.length !== 1 ? "s" : ""} programada{dayTasks.length !== 1 ? "s" : ""}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setShowForm(!showForm)}
                    className="rounded-lg bg-primary p-1.5 text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => { setSelectedDay(null); setShowForm(false); }}
                    className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Add task form */}
              {showForm && (
                <div className="border-b border-border p-4 space-y-3 bg-muted/30">
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Nombre de la tarea..."
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    onKeyDown={(e) => e.key === "Enter" && addTask()}
                    autoFocus
                  />
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 flex-1">
                      <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                      <select
                        value={newHour}
                        onChange={(e) => setNewHour(Number(e.target.value))}
                        className="flex-1 rounded-lg border border-input bg-background px-2 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                      >
                        {hours.map((h) => (
                          <option key={h} value={h}>{formatHour(h)}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {colorOptions.map((c) => (
                      <button
                        key={c.value}
                        onClick={() => setNewColor(c.value)}
                        className={`h-5 w-5 rounded-full ${c.value} transition-transform ${
                          newColor === c.value ? "ring-2 ring-ring ring-offset-2 ring-offset-card scale-110" : "hover:scale-110"
                        }`}
                        title={c.label}
                      />
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={addTask}
                      disabled={!newTitle.trim()}
                      className="flex-1 rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
                    >
                      Añadir
                    </button>
                    <button
                      onClick={() => setShowForm(false)}
                      className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}

              {/* Hourly timeline */}
              <div className="overflow-y-auto max-h-[calc(100vh-16rem)]">
                {hours.map((hour) => {
                  const hourTasks = dayTasks.filter((t) => t.hour === hour);
                  return (
                    <div key={hour} className="flex border-b border-border last:border-0">
                      <div className="w-14 shrink-0 border-r border-border py-2.5 text-center text-[11px] font-medium text-muted-foreground">
                        {formatHour(hour)}
                      </div>
                      <div className="flex-1 min-h-[2.75rem] p-1">
                        {hourTasks.length > 0 ? (
                          <div className="space-y-1">
                            {hourTasks.map((task) => (
                              <div
                                key={task.id}
                                className={`group flex items-center justify-between rounded-md px-2.5 py-1.5 text-xs font-medium text-primary-foreground ${task.color}`}
                              >
                                <span className="truncate">{task.title}</span>
                                <button
                                  onClick={() => removeTask(task.id)}
                                  className="ml-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <button
                            onClick={() => { setNewHour(hour); setShowForm(true); }}
                            className="flex h-full w-full items-center justify-center rounded-md text-[10px] text-muted-foreground/40 hover:bg-muted/50 hover:text-muted-foreground transition-colors"
                          >
                            +
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
