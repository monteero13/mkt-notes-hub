import { jsx, jsxs } from "react/jsx-runtime";
import { D as DashboardLayout, P as PageHeader } from "./PageHeader-CBRNsxuw.js";
import { Plus, Music2, Linkedin, Youtube, Instagram } from "lucide-react";
import { useState } from "react";
import "@tanstack/react-router";
import "react-i18next";
import "./button-CjC9Szlf.js";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "clsx";
import "tailwind-merge";
import "./badge-DCKZzNGZ.js";
const initialContent = [{
  id: 1,
  title: "Reel tendencia #marketing",
  platform: "Instagram",
  type: "Reel",
  status: "idea",
  date: "14 Abr"
}, {
  id: 2,
  title: "Guía SEO 2026",
  platform: "LinkedIn",
  type: "Carrusel",
  status: "en_proceso",
  date: "15 Abr"
}, {
  id: 3,
  title: "Tutorial Ads",
  platform: "YouTube",
  type: "Video",
  status: "publicado",
  date: "10 Abr"
}, {
  id: 4,
  title: "Tips branding",
  platform: "TikTok",
  type: "Short",
  status: "en_proceso",
  date: "16 Abr"
}, {
  id: 5,
  title: "Caso de éxito cliente",
  platform: "LinkedIn",
  type: "Post",
  status: "idea",
  date: "18 Abr"
}, {
  id: 6,
  title: "Behind the scenes agencia",
  platform: "Instagram",
  type: "Story",
  status: "publicado",
  date: "11 Abr"
}];
const platformIcons = {
  Instagram,
  YouTube: Youtube,
  LinkedIn: Linkedin,
  TikTok: Music2
};
const statusConfig = {
  idea: {
    label: "Idea",
    classes: "bg-muted text-muted-foreground"
  },
  en_proceso: {
    label: "En proceso",
    classes: "bg-warning/15 text-warning-foreground"
  },
  publicado: {
    label: "Publicado",
    classes: "bg-success/15 text-success"
  }
};
function ContenidoPage() {
  const [filter, setFilter] = useState("all");
  const filtered = filter === "all" ? initialContent : initialContent.filter((c) => c.status === filter);
  return /* @__PURE__ */ jsx(DashboardLayout, { children: /* @__PURE__ */ jsxs("div", { className: "space-y-6 p-4 sm:p-6 lg:p-8", children: [
    /* @__PURE__ */ jsx(PageHeader, { title: "Calendario de Contenido", description: "Planifica y organiza tus publicaciones", children: /* @__PURE__ */ jsxs("button", { className: "inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90", children: [
      /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4" }),
      "Nuevo"
    ] }) }),
    /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-2", children: ["all", "idea", "en_proceso", "publicado"].map((s) => /* @__PURE__ */ jsx("button", { onClick: () => setFilter(s), className: `rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${filter === s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-accent"}`, children: s === "all" ? "Todos" : statusConfig[s].label }, s)) }),
    /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3", children: filtered.map((item) => {
      const PlatformIcon = platformIcons[item.platform] || FileText;
      const status = statusConfig[item.status];
      return /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-border bg-card p-4 transition-shadow hover:shadow-sm", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(PlatformIcon, { className: "h-4 w-4 text-muted-foreground" }),
            /* @__PURE__ */ jsx("span", { className: "text-xs font-medium text-muted-foreground", children: item.platform })
          ] }),
          /* @__PURE__ */ jsx("span", { className: `rounded-full px-2 py-0.5 text-[10px] font-medium ${status.classes}`, children: status.label })
        ] }),
        /* @__PURE__ */ jsx("h3", { className: "mt-2 text-sm font-semibold text-card-foreground", children: item.title }),
        /* @__PURE__ */ jsxs("div", { className: "mt-2 flex items-center justify-between text-xs text-muted-foreground", children: [
          /* @__PURE__ */ jsx("span", { children: item.type }),
          /* @__PURE__ */ jsx("span", { children: item.date })
        ] })
      ] }, item.id);
    }) })
  ] }) });
}
const FileText = ({
  className
}) => /* @__PURE__ */ jsxs("svg", { className, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", children: [
  /* @__PURE__ */ jsx("path", { d: "M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" }),
  /* @__PURE__ */ jsx("path", { d: "M14 2v4a2 2 0 0 0 2 2h4" })
] });
export {
  ContenidoPage as component
};
