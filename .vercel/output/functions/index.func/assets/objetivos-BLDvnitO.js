import { jsx, jsxs } from "react/jsx-runtime";
import { D as DashboardLayout, P as PageHeader } from "./PageHeader-CBRNsxuw.js";
import "@tanstack/react-router";
import "lucide-react";
import "react";
import "react-i18next";
import "./button-CjC9Szlf.js";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "clsx";
import "tailwind-merge";
import "./badge-DCKZzNGZ.js";
const objectives = [{
  title: "Aumentar seguidores IG a 10K",
  metric: "Seguidores",
  current: 7200,
  target: 1e4,
  quarter: "Q2"
}, {
  title: "Generar 500 leads cualificados",
  metric: "Leads",
  current: 310,
  target: 500,
  quarter: "Q2"
}, {
  title: "Alcanzar CTR del 4% en email",
  metric: "CTR",
  current: 3.2,
  target: 4,
  quarter: "Q2",
  unit: "%"
}, {
  title: "Publicar 60 posts al mes",
  metric: "Posts",
  current: 42,
  target: 60,
  quarter: "Q2"
}, {
  title: "Reducir CAC a €15",
  metric: "CAC",
  current: 22,
  target: 15,
  quarter: "Q2",
  unit: "€",
  inverse: true
}, {
  title: "Engagement rate > 5%",
  metric: "Engagement",
  current: 3.8,
  target: 5,
  quarter: "Q2",
  unit: "%"
}];
function ObjetivosPage() {
  return /* @__PURE__ */ jsx(DashboardLayout, { children: /* @__PURE__ */ jsxs("div", { className: "space-y-6 p-4 sm:p-6 lg:p-8", children: [
    /* @__PURE__ */ jsx(PageHeader, { title: "Objetivos de Marketing", description: "Seguimiento de objetivos trimestrales — Q2 2026" }),
    /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3", children: objectives.map((obj, i) => {
      const progress = obj.inverse ? Math.min(100, obj.target / obj.current * 100) : Math.min(100, obj.current / obj.target * 100);
      const isOnTrack = progress >= 60;
      return /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-border bg-card p-5", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between", children: [
          /* @__PURE__ */ jsx("h3", { className: "text-sm font-semibold text-card-foreground leading-tight", children: obj.title }),
          /* @__PURE__ */ jsx("span", { className: `rounded-full px-2 py-0.5 text-[10px] font-medium ${isOnTrack ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive"}`, children: isOnTrack ? "En camino" : "Atrasado" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "mt-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-xs text-muted-foreground mb-1.5", children: [
            /* @__PURE__ */ jsx("span", { children: obj.unit === "€" ? `€${obj.current}` : `${obj.current}${obj.unit || ""}` }),
            /* @__PURE__ */ jsxs("span", { children: [
              "Meta: ",
              obj.unit === "€" ? `€${obj.target}` : `${obj.target}${obj.unit || ""}`
            ] })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "h-2 rounded-full bg-muted overflow-hidden", children: /* @__PURE__ */ jsx("div", { className: `h-full rounded-full transition-all ${isOnTrack ? "bg-success" : "bg-destructive"}`, style: {
            width: `${progress}%`
          } }) }),
          /* @__PURE__ */ jsxs("p", { className: "mt-2 text-xs font-medium text-muted-foreground text-right", children: [
            Math.round(progress),
            "%"
          ] })
        ] })
      ] }, i);
    }) })
  ] }) });
}
export {
  ObjetivosPage as component
};
