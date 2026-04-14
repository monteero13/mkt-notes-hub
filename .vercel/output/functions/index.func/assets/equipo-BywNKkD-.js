import { jsx, jsxs } from "react/jsx-runtime";
import { D as DashboardLayout, P as PageHeader } from "./PageHeader-CBRNsxuw.js";
import { Plus, Users, MessageSquare, Clock, CheckCircle2 } from "lucide-react";
import "@tanstack/react-router";
import "react";
import "react-i18next";
import "./button-CjC9Szlf.js";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "clsx";
import "tailwind-merge";
import "./badge-DCKZzNGZ.js";
const teamMembers = [{
  name: "Ana García",
  role: "Social Media Manager",
  avatar: "AG",
  tasks: 5,
  color: "bg-chart-1"
}, {
  name: "Carlos López",
  role: "Content Creator",
  avatar: "CL",
  tasks: 3,
  color: "bg-chart-2"
}, {
  name: "María Fernández",
  role: "Diseñadora",
  avatar: "MF",
  tasks: 7,
  color: "bg-chart-3"
}, {
  name: "Tú",
  role: "Marketing Lead",
  avatar: "TÚ",
  tasks: 8,
  color: "bg-primary"
}];
const sharedTasks = [{
  title: "Revisar estrategia Q2",
  assignee: "Ana García",
  status: "done",
  date: "10 Abr"
}, {
  title: "Crear briefing campaña nueva",
  assignee: "Carlos López",
  status: "in_progress",
  date: "15 Abr"
}, {
  title: "Diseñar creatividades para ads",
  assignee: "María Fernández",
  status: "in_progress",
  date: "16 Abr"
}, {
  title: "Aprobar presupuesto TikTok",
  assignee: "Tú",
  status: "todo",
  date: "18 Abr"
}, {
  title: "Preparar reporte mensual",
  assignee: "Ana García",
  status: "todo",
  date: "20 Abr"
}];
const comments = [{
  author: "Ana García",
  text: "¿Podemos mover el lanzamiento al jueves?",
  time: "Hace 2h"
}, {
  author: "Carlos López",
  text: "Creatividades listas para revisión 👆",
  time: "Hace 4h"
}, {
  author: "María Fernández",
  text: "Actualicé la paleta de colores en el drive",
  time: "Ayer"
}];
const statusIcons = {
  done: /* @__PURE__ */ jsx(CheckCircle2, { className: "h-4 w-4 text-success" }),
  in_progress: /* @__PURE__ */ jsx(Clock, { className: "h-4 w-4 text-warning" }),
  todo: /* @__PURE__ */ jsx("div", { className: "h-4 w-4 rounded-full border-2 border-muted-foreground" })
};
function EquipoPage() {
  return /* @__PURE__ */ jsx(DashboardLayout, { children: /* @__PURE__ */ jsxs("div", { className: "space-y-6 p-4 sm:p-6 lg:p-8", children: [
    /* @__PURE__ */ jsx(PageHeader, { title: "Zona Colaborativa", description: "Trabaja en equipo con tu agencia o clientes", children: /* @__PURE__ */ jsxs("button", { className: "inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90", children: [
      /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4" }),
      "Invitar"
    ] }) }),
    /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 gap-3 sm:grid-cols-4", children: teamMembers.map((m, i) => /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-border bg-card p-4 text-center", children: [
      /* @__PURE__ */ jsx("div", { className: `mx-auto flex h-10 w-10 items-center justify-center rounded-full ${m.color} text-sm font-bold text-primary-foreground`, children: m.avatar }),
      /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm font-semibold text-card-foreground", children: m.name }),
      /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: m.role }),
      /* @__PURE__ */ jsxs("p", { className: "mt-1 text-xs text-muted-foreground", children: [
        m.tasks,
        " tareas"
      ] })
    ] }, i)) }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 gap-6 lg:grid-cols-3", children: [
      /* @__PURE__ */ jsxs("div", { className: "lg:col-span-2 rounded-xl border border-border bg-card p-5", children: [
        /* @__PURE__ */ jsxs("h2", { className: "font-heading text-lg font-semibold text-card-foreground mb-4 flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(Users, { className: "h-5 w-5 text-primary" }),
          "Tareas del equipo"
        ] }),
        /* @__PURE__ */ jsx("div", { className: "space-y-3", children: sharedTasks.map((t, i) => /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 rounded-lg border border-border p-3", children: [
          statusIcons[t.status],
          /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
            /* @__PURE__ */ jsx("p", { className: `text-sm font-medium ${t.status === "done" ? "line-through text-muted-foreground" : "text-card-foreground"}`, children: t.title }),
            /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground", children: [
              t.assignee,
              " · ",
              t.date
            ] })
          ] })
        ] }, i)) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-border bg-card p-5", children: [
        /* @__PURE__ */ jsxs("h2", { className: "font-heading text-lg font-semibold text-card-foreground mb-4 flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(MessageSquare, { className: "h-5 w-5 text-primary" }),
          "Comentarios recientes"
        ] }),
        /* @__PURE__ */ jsx("div", { className: "space-y-4", children: comments.map((c, i) => /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsx("span", { className: "text-sm font-medium text-card-foreground", children: c.author }),
            /* @__PURE__ */ jsx("span", { className: "text-[10px] text-muted-foreground", children: c.time })
          ] }),
          /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: c.text })
        ] }, i)) }),
        /* @__PURE__ */ jsx("div", { className: "mt-4", children: /* @__PURE__ */ jsx("input", { type: "text", placeholder: "Escribe un comentario...", className: "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" }) })
      ] })
    ] })
  ] }) });
}
export {
  EquipoPage as component
};
