import { jsx, jsxs } from "react/jsx-runtime";
import { D as DashboardLayout, P as PageHeader } from "./PageHeader-CBRNsxuw.js";
import { BarChart3, FileText, Target, CheckCircle2, Clock, TrendingUp } from "lucide-react";
import { useTranslation } from "react-i18next";
import "@tanstack/react-router";
import "react";
import "./button-CjC9Szlf.js";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "clsx";
import "tailwind-merge";
import "./badge-DCKZzNGZ.js";
function StatCard({ title, value, subtitle, icon: Icon, trend }) {
  return /* @__PURE__ */ jsx("div", { className: "rounded-xl border border-border bg-card p-5 transition-shadow hover:shadow-sm", children: /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between", children: [
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-muted-foreground", children: title }),
      /* @__PURE__ */ jsx("p", { className: "mt-1 font-heading text-2xl font-semibold text-card-foreground", children: value }),
      subtitle && /* @__PURE__ */ jsx("p", { className: "mt-0.5 text-xs text-muted-foreground", children: subtitle }),
      trend && /* @__PURE__ */ jsxs("p", { className: `mt-1 text-xs font-medium ${trend.positive ? "text-success" : "text-destructive"}`, children: [
        trend.positive ? "↑" : "↓",
        " ",
        trend.value
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "rounded-lg bg-primary/10 p-2.5", children: /* @__PURE__ */ jsx(Icon, { className: "h-5 w-5 text-primary" }) })
  ] }) });
}
function Dashboard() {
  const {
    t
  } = useTranslation();
  const tasks = [{
    title: "Revisar copy para campaña de Instagram",
    priority: t("common.high"),
    status: t("common.in_progress")
  }, {
    title: "Diseñar creatividades para TikTok",
    priority: t("common.medium"),
    status: t("common.pending")
  }, {
    title: "Enviar reporte mensual al cliente",
    priority: t("common.high"),
    status: t("common.pending")
  }, {
    title: "Programar posts de la semana",
    priority: t("common.low"),
    status: t("common.in_progress")
  }];
  const campaigns = [{
    name: "Lanzamiento Q2",
    channel: "Multi-canal",
    status: t("common.active"),
    progress: 65
  }, {
    name: "Black Friday Early",
    channel: "Instagram",
    status: t("common.planning"),
    progress: 20
  }, {
    name: "Newsletter Mayo",
    channel: "Email",
    status: t("common.active"),
    progress: 80
  }];
  const weekDays = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
  return /* @__PURE__ */ jsx(DashboardLayout, { children: /* @__PURE__ */ jsxs("div", { className: "space-y-6 p-4 sm:p-6 lg:p-8", children: [
    /* @__PURE__ */ jsx(PageHeader, { title: t("dashboard.title"), description: t("dashboard.desc") }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4", children: [
      /* @__PURE__ */ jsx(StatCard, { title: t("dashboard.active_campaigns"), value: "4", icon: BarChart3, trend: {
        value: "+2 este mes",
        positive: true
      } }),
      /* @__PURE__ */ jsx(StatCard, { title: t("dashboard.planned_posts"), value: "23", subtitle: t("dashboard.this_week"), icon: FileText }),
      /* @__PURE__ */ jsx(StatCard, { title: t("dashboard.goals_achieved"), value: "7/12", subtitle: "Q2 2026", icon: Target, trend: {
        value: "58%",
        positive: true
      } }),
      /* @__PURE__ */ jsx(StatCard, { title: t("dashboard.pending_tasks"), value: "8", icon: CheckCircle2, trend: {
        value: "3 urgentes",
        positive: false
      } })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 gap-6 lg:grid-cols-3", children: [
      /* @__PURE__ */ jsxs("div", { className: "lg:col-span-2 rounded-xl border border-border bg-card p-5", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-4", children: [
          /* @__PURE__ */ jsx("h2", { className: "font-heading text-lg font-semibold text-card-foreground", children: t("dashboard.priority_tasks") }),
          /* @__PURE__ */ jsx("span", { className: "text-xs text-muted-foreground", children: t("common.today") })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "space-y-3", children: tasks.map((task, i) => /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-muted/50", children: [
          /* @__PURE__ */ jsx("div", { className: `h-2 w-2 rounded-full shrink-0 ${task.priority === t("common.high") ? "bg-destructive" : task.priority === t("common.medium") ? "bg-warning" : "bg-success"}` }),
          /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
            /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-card-foreground truncate", children: task.title }),
            /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground", children: [
              task.priority,
              " · ",
              task.status
            ] })
          ] }),
          /* @__PURE__ */ jsx(Clock, { className: "h-4 w-4 shrink-0 text-muted-foreground" })
        ] }, i)) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-border bg-card p-5", children: [
        /* @__PURE__ */ jsx("h2", { className: "font-heading text-lg font-semibold text-card-foreground mb-4", children: t("dashboard.current_week") }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-7 gap-1", children: [
          weekDays.map((d) => /* @__PURE__ */ jsx("div", { className: "text-center text-xs font-medium text-muted-foreground py-1", children: d }, d)),
          [12, 13, 14, 15, 16, 17, 18].map((d) => /* @__PURE__ */ jsx("button", { className: `rounded-lg py-2 text-sm font-medium transition-colors ${d === 13 ? "bg-primary text-primary-foreground" : "text-card-foreground hover:bg-muted"}`, children: d }, d))
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "mt-4 space-y-2", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-sm", children: [
            /* @__PURE__ */ jsx("div", { className: "h-1.5 w-1.5 rounded-full bg-primary" }),
            /* @__PURE__ */ jsx("span", { className: "text-card-foreground", children: "Reunión con cliente — 10:00" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-sm", children: [
            /* @__PURE__ */ jsx("div", { className: "h-1.5 w-1.5 rounded-full bg-warning" }),
            /* @__PURE__ */ jsx("span", { className: "text-card-foreground", children: "Deadline campaña — 18:00" })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-border bg-card p-5", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-4", children: [
        /* @__PURE__ */ jsx("h2", { className: "font-heading text-lg font-semibold text-card-foreground", children: t("dashboard.active_campaigns") }),
        /* @__PURE__ */ jsx(TrendingUp, { className: "h-4 w-4 text-muted-foreground" })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "space-y-4", children: campaigns.map((c, i) => /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between", children: [
        /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
          /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-card-foreground", children: c.name }),
          /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground", children: [
            c.channel,
            " · ",
            c.status
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 sm:w-48", children: [
          /* @__PURE__ */ jsx("div", { className: "flex-1 h-2 rounded-full bg-muted overflow-hidden", children: /* @__PURE__ */ jsx("div", { className: "h-full rounded-full bg-primary transition-all", style: {
            width: `${c.progress}%`
          } }) }),
          /* @__PURE__ */ jsxs("span", { className: "text-xs font-medium text-muted-foreground w-8 text-right", children: [
            c.progress,
            "%"
          ] })
        ] })
      ] }, i)) })
    ] })
  ] }) });
}
export {
  Dashboard as component
};
