import { jsx, jsxs } from "react/jsx-runtime";
import { D as DashboardLayout, P as PageHeader } from "./PageHeader-CBRNsxuw.js";
import { ChevronLeft, ChevronRight, Plus, X, Clock, Trash2 } from "lucide-react";
import { useState } from "react";
import "@tanstack/react-router";
import "react-i18next";
import "./button-CjC9Szlf.js";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "clsx";
import "tailwind-merge";
import "./badge-DCKZzNGZ.js";
const colorOptions = [{
  label: "Azul",
  value: "bg-primary"
}, {
  label: "Verde",
  value: "bg-success"
}, {
  label: "Rojo",
  value: "bg-destructive"
}, {
  label: "Naranja",
  value: "bg-warning"
}, {
  label: "Morado",
  value: "bg-chart-4"
}, {
  label: "Cyan",
  value: "bg-info"
}];
const calendarEvents = {
  3: [{
    title: "Briefing Q2",
    color: "bg-primary"
  }],
  7: [{
    title: "Launch IG",
    color: "bg-success"
  }],
  10: [{
    title: "Deadline copy",
    color: "bg-destructive"
  }],
  13: [{
    title: "Hoy",
    color: "bg-primary"
  }],
  15: [{
    title: "Review ads",
    color: "bg-warning"
  }],
  20: [{
    title: "Newsletter",
    color: "bg-info"
  }],
  25: [{
    title: "Reporte",
    color: "bg-chart-4"
  }],
  28: [{
    title: "Lanzamiento",
    color: "bg-success"
  }]
};
const hours = Array.from({
  length: 16
}, (_, i) => i + 7);
function formatHour(h) {
  return `${h.toString().padStart(2, "0")}:00`;
}
function PlanificadorPage() {
  const daysInMonth = 30;
  const startDay = 2;
  const days = Array.from({
    length: daysInMonth
  }, (_, i) => i + 1);
  const blanks = Array.from({
    length: startDay
  }, (_, i) => i);
  const [selectedDay, setSelectedDay] = useState(null);
  const [tasks, setTasks] = useState({
    13: [{
      id: "1",
      title: "Reunión equipo creativo",
      hour: 10,
      color: "bg-primary"
    }, {
      id: "2",
      title: "Review campaña Instagram",
      hour: 14,
      color: "bg-success"
    }, {
      id: "3",
      title: "Deadline envío copy",
      hour: 18,
      color: "bg-destructive"
    }],
    15: [{
      id: "4",
      title: "Revisión anuncios Google Ads",
      hour: 9,
      color: "bg-warning"
    }, {
      id: "5",
      title: "Call con cliente",
      hour: 16,
      color: "bg-info"
    }]
  });
  const [showForm, setShowForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newHour, setNewHour] = useState(9);
  const [newColor, setNewColor] = useState("bg-primary");
  const dayTasks = selectedDay ? tasks[selectedDay] || [] : [];
  const addTask = () => {
    if (!selectedDay || !newTitle.trim()) return;
    const task = {
      id: Date.now().toString(),
      title: newTitle.trim(),
      hour: newHour,
      color: newColor
    };
    setTasks((prev) => ({
      ...prev,
      [selectedDay]: [...prev[selectedDay] || [], task].sort((a, b) => a.hour - b.hour)
    }));
    setNewTitle("");
    setNewHour(9);
    setNewColor("bg-primary");
    setShowForm(false);
  };
  const removeTask = (taskId) => {
    if (!selectedDay) return;
    setTasks((prev) => ({
      ...prev,
      [selectedDay]: (prev[selectedDay] || []).filter((t) => t.id !== taskId)
    }));
  };
  const getDayTaskCount = (day) => (tasks[day]?.length || 0) + (calendarEvents[day]?.length || 0);
  return /* @__PURE__ */ jsx(DashboardLayout, { children: /* @__PURE__ */ jsxs("div", { className: "space-y-6 p-4 sm:p-6 lg:p-8", children: [
    /* @__PURE__ */ jsx(PageHeader, { title: "Planificador Mensual", description: "Abril 2026 · Haz clic en un día para ver la planificación horaria", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsx("button", { className: "rounded-lg border border-border p-2 text-muted-foreground hover:bg-muted transition-colors", children: /* @__PURE__ */ jsx(ChevronLeft, { className: "h-4 w-4" }) }),
      /* @__PURE__ */ jsx("span", { className: "font-heading text-sm font-semibold text-foreground", children: "Abril 2026" }),
      /* @__PURE__ */ jsx("button", { className: "rounded-lg border border-border p-2 text-muted-foreground hover:bg-muted transition-colors", children: /* @__PURE__ */ jsx(ChevronRight, { className: "h-4 w-4" }) })
    ] }) }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 gap-6 lg:grid-cols-3", children: [
      /* @__PURE__ */ jsxs("div", { className: `rounded-xl border border-border bg-card overflow-hidden ${selectedDay ? "lg:col-span-2" : "lg:col-span-3"}`, children: [
        /* @__PURE__ */ jsx("div", { className: "grid grid-cols-7 border-b border-border", children: ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map((d) => /* @__PURE__ */ jsx("div", { className: "py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider", children: d }, d)) }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-7", children: [
          blanks.map((b) => /* @__PURE__ */ jsx("div", { className: "min-h-20 border-b border-r border-border bg-muted/30" }, `blank-${b}`)),
          days.map((day) => {
            const isSelected = selectedDay === day;
            const isToday = day === 13;
            const taskCount = getDayTaskCount(day);
            return /* @__PURE__ */ jsxs("button", { onClick: () => setSelectedDay(isSelected ? null : day), className: `min-h-20 border-b border-r border-border p-1.5 text-left transition-colors hover:bg-muted/40 ${isSelected ? "bg-primary/10 ring-2 ring-primary ring-inset" : isToday ? "bg-primary/5" : ""}`, children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
                /* @__PURE__ */ jsx("span", { className: `inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${isToday ? "bg-primary text-primary-foreground" : "text-card-foreground"}`, children: day }),
                taskCount > 0 && /* @__PURE__ */ jsx("span", { className: "inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-muted px-1 text-[9px] font-semibold text-muted-foreground", children: taskCount })
              ] }),
              calendarEvents[day]?.map((ev, i) => /* @__PURE__ */ jsx("div", { className: `mt-1 truncate rounded px-1.5 py-0.5 text-[10px] font-medium text-primary-foreground ${ev.color}`, children: ev.title }, i)),
              (tasks[day]?.length || 0) > 0 && /* @__PURE__ */ jsx("div", { className: "mt-1 flex gap-0.5", children: tasks[day].slice(0, 3).map((t) => /* @__PURE__ */ jsx("div", { className: `h-1.5 flex-1 rounded-full ${t.color}` }, t.id)) })
            ] }, day);
          })
        ] })
      ] }),
      selectedDay && /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-border bg-card overflow-hidden lg:col-span-1", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between border-b border-border px-4 py-3", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsxs("h2", { className: "font-heading text-base font-semibold text-card-foreground", children: [
              selectedDay,
              " de Abril"
            ] }),
            /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground", children: [
              dayTasks.length,
              " tarea",
              dayTasks.length !== 1 ? "s" : "",
              " programada",
              dayTasks.length !== 1 ? "s" : ""
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1", children: [
            /* @__PURE__ */ jsx("button", { onClick: () => setShowForm(!showForm), className: "rounded-lg bg-primary p-1.5 text-primary-foreground transition-colors hover:bg-primary/90", children: /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4" }) }),
            /* @__PURE__ */ jsx("button", { onClick: () => {
              setSelectedDay(null);
              setShowForm(false);
            }, className: "rounded-lg p-1.5 text-muted-foreground hover:bg-muted transition-colors", children: /* @__PURE__ */ jsx(X, { className: "h-4 w-4" }) })
          ] })
        ] }),
        showForm && /* @__PURE__ */ jsxs("div", { className: "border-b border-border p-4 space-y-3 bg-muted/30", children: [
          /* @__PURE__ */ jsx("input", { type: "text", value: newTitle, onChange: (e) => setNewTitle(e.target.value), placeholder: "Nombre de la tarea...", className: "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring", onKeyDown: (e) => e.key === "Enter" && addTask(), autoFocus: true }),
          /* @__PURE__ */ jsx("div", { className: "flex items-center gap-3", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 flex-1", children: [
            /* @__PURE__ */ jsx(Clock, { className: "h-4 w-4 text-muted-foreground shrink-0" }),
            /* @__PURE__ */ jsx("select", { value: newHour, onChange: (e) => setNewHour(Number(e.target.value)), className: "flex-1 rounded-lg border border-input bg-background px-2 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring", children: hours.map((h) => /* @__PURE__ */ jsx("option", { value: h, children: formatHour(h) }, h)) })
          ] }) }),
          /* @__PURE__ */ jsx("div", { className: "flex items-center gap-1.5", children: colorOptions.map((c) => /* @__PURE__ */ jsx("button", { onClick: () => setNewColor(c.value), className: `h-5 w-5 rounded-full ${c.value} transition-transform ${newColor === c.value ? "ring-2 ring-ring ring-offset-2 ring-offset-card scale-110" : "hover:scale-110"}`, title: c.label }, c.value)) }),
          /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
            /* @__PURE__ */ jsx("button", { onClick: addTask, disabled: !newTitle.trim(), className: "flex-1 rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50", children: "Añadir" }),
            /* @__PURE__ */ jsx("button", { onClick: () => setShowForm(false), className: "rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-muted-foreground hover:bg-muted transition-colors", children: "Cancelar" })
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "overflow-y-auto max-h-[calc(100vh-16rem)]", children: hours.map((hour) => {
          const hourTasks = dayTasks.filter((t) => t.hour === hour);
          return /* @__PURE__ */ jsxs("div", { className: "flex border-b border-border last:border-0", children: [
            /* @__PURE__ */ jsx("div", { className: "w-14 shrink-0 border-r border-border py-2.5 text-center text-[11px] font-medium text-muted-foreground", children: formatHour(hour) }),
            /* @__PURE__ */ jsx("div", { className: "flex-1 min-h-[2.75rem] p-1", children: hourTasks.length > 0 ? /* @__PURE__ */ jsx("div", { className: "space-y-1", children: hourTasks.map((task) => /* @__PURE__ */ jsxs("div", { className: `group flex items-center justify-between rounded-md px-2.5 py-1.5 text-xs font-medium text-primary-foreground ${task.color}`, children: [
              /* @__PURE__ */ jsx("span", { className: "truncate", children: task.title }),
              /* @__PURE__ */ jsx("button", { onClick: () => removeTask(task.id), className: "ml-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity", children: /* @__PURE__ */ jsx(Trash2, { className: "h-3 w-3" }) })
            ] }, task.id)) }) : /* @__PURE__ */ jsx("button", { onClick: () => {
              setNewHour(hour);
              setShowForm(true);
            }, className: "flex h-full w-full items-center justify-center rounded-md text-[10px] text-muted-foreground/40 hover:bg-muted/50 hover:text-muted-foreground transition-colors", children: "+" }) })
          ] }, hour);
        }) })
      ] })
    ] })
  ] }) });
}
export {
  PlanificadorPage as component
};
