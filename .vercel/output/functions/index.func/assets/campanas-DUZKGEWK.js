import { jsx, jsxs } from "react/jsx-runtime";
import { D as DashboardLayout, P as PageHeader } from "./PageHeader-CBRNsxuw.js";
import { Plus } from "lucide-react";
import "@tanstack/react-router";
import "react";
import "react-i18next";
import "./button-CjC9Szlf.js";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "clsx";
import "tailwind-merge";
import "./badge-DCKZzNGZ.js";
const campaigns = [{
  name: "Lanzamiento Producto Q2",
  objective: "Awareness",
  channel: "Multi-canal",
  budget: "€2,500",
  kpi: "Alcance 50K",
  result: "32K",
  progress: 64
}, {
  name: "Campaña Email Mayo",
  objective: "Conversión",
  channel: "Email",
  budget: "€500",
  kpi: "CTR 5%",
  result: "4.2%",
  progress: 84
}, {
  name: "Instagram Ads Primavera",
  objective: "Leads",
  channel: "Instagram",
  budget: "€1,200",
  kpi: "200 leads",
  result: "145",
  progress: 72
}, {
  name: "Content LinkedIn",
  objective: "Engagement",
  channel: "LinkedIn",
  budget: "€0",
  kpi: "500 interacciones",
  result: "380",
  progress: 76
}, {
  name: "TikTok Viral Challenge",
  objective: "Awareness",
  channel: "TikTok",
  budget: "€800",
  kpi: "100K views",
  result: "45K",
  progress: 45
}];
function CampanasPage() {
  return /* @__PURE__ */ jsx(DashboardLayout, { children: /* @__PURE__ */ jsxs("div", { className: "space-y-6 p-4 sm:p-6 lg:p-8", children: [
    /* @__PURE__ */ jsx(PageHeader, { title: "Seguimiento de Campañas", description: "Monitoriza el rendimiento de tus campañas", children: /* @__PURE__ */ jsxs("button", { className: "inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90", children: [
      /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4" }),
      "Nueva campaña"
    ] }) }),
    /* @__PURE__ */ jsx("div", { className: "hidden rounded-xl border border-border bg-card md:block overflow-hidden", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-sm", children: [
      /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "border-b border-border", children: [
        /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-left font-semibold text-muted-foreground text-xs uppercase tracking-wider", children: "Campaña" }),
        /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-left font-semibold text-muted-foreground text-xs uppercase tracking-wider", children: "Objetivo" }),
        /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-left font-semibold text-muted-foreground text-xs uppercase tracking-wider", children: "Canal" }),
        /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-left font-semibold text-muted-foreground text-xs uppercase tracking-wider", children: "Presupuesto" }),
        /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-left font-semibold text-muted-foreground text-xs uppercase tracking-wider", children: "KPI" }),
        /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-left font-semibold text-muted-foreground text-xs uppercase tracking-wider", children: "Resultado" }),
        /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-left font-semibold text-muted-foreground text-xs uppercase tracking-wider w-32", children: "Progreso" })
      ] }) }),
      /* @__PURE__ */ jsx("tbody", { children: campaigns.map((c, i) => /* @__PURE__ */ jsxs("tr", { className: "border-b border-border last:border-0 hover:bg-muted/40 transition-colors", children: [
        /* @__PURE__ */ jsx("td", { className: "px-4 py-3 font-medium text-card-foreground", children: c.name }),
        /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-muted-foreground", children: c.objective }),
        /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-muted-foreground", children: c.channel }),
        /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-muted-foreground", children: c.budget }),
        /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-muted-foreground", children: c.kpi }),
        /* @__PURE__ */ jsx("td", { className: "px-4 py-3 font-medium text-card-foreground", children: c.result }),
        /* @__PURE__ */ jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx("div", { className: "flex-1 h-2 rounded-full bg-muted overflow-hidden", children: /* @__PURE__ */ jsx("div", { className: "h-full rounded-full bg-primary", style: {
            width: `${c.progress}%`
          } }) }),
          /* @__PURE__ */ jsxs("span", { className: "text-xs text-muted-foreground", children: [
            c.progress,
            "%"
          ] })
        ] }) })
      ] }, i)) })
    ] }) }),
    /* @__PURE__ */ jsx("div", { className: "space-y-4 md:hidden", children: campaigns.map((c, i) => /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-border bg-card p-4", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-semibold text-card-foreground", children: c.name }),
      /* @__PURE__ */ jsxs("div", { className: "mt-2 grid grid-cols-2 gap-2 text-xs", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "Objetivo:" }),
          " ",
          /* @__PURE__ */ jsx("span", { className: "text-card-foreground", children: c.objective })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "Canal:" }),
          " ",
          /* @__PURE__ */ jsx("span", { className: "text-card-foreground", children: c.channel })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "Presupuesto:" }),
          " ",
          /* @__PURE__ */ jsx("span", { className: "text-card-foreground", children: c.budget })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "Resultado:" }),
          " ",
          /* @__PURE__ */ jsx("span", { className: "text-card-foreground", children: c.result })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mt-3 flex items-center gap-2", children: [
        /* @__PURE__ */ jsx("div", { className: "flex-1 h-2 rounded-full bg-muted overflow-hidden", children: /* @__PURE__ */ jsx("div", { className: "h-full rounded-full bg-primary", style: {
          width: `${c.progress}%`
        } }) }),
        /* @__PURE__ */ jsxs("span", { className: "text-xs font-medium text-muted-foreground", children: [
          c.progress,
          "%"
        ] })
      ] })
    ] }, i)) })
  ] }) });
}
export {
  CampanasPage as component
};
