import { jsx, jsxs } from "react/jsx-runtime";
import { D as DashboardLayout, P as PageHeader } from "./PageHeader-CBRNsxuw.js";
import { Play, Star, BookOpen, ExternalLink } from "lucide-react";
import "@tanstack/react-router";
import "react";
import "react-i18next";
import "./button-CjC9Szlf.js";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "clsx";
import "tailwind-merge";
import "./badge-DCKZzNGZ.js";
const videos = [{
  title: "Cómo crear una estrategia de contenido",
  channel: "Think Media",
  duration: "18 min",
  saved: true
}, {
  title: "Facebook Ads para principiantes 2026",
  channel: "HubSpot",
  duration: "45 min",
  saved: false
}, {
  title: "Storytelling en marketing digital",
  channel: "GaryVee",
  duration: "12 min",
  saved: true
}];
const courses = [{
  title: "Google Analytics Certification",
  provider: "Google",
  level: "Intermedio",
  free: true
}, {
  title: "Social Media Marketing",
  provider: "Coursera",
  level: "Básico",
  free: true
}, {
  title: "SEO Fundamentals",
  provider: "HubSpot Academy",
  level: "Básico",
  free: true
}, {
  title: "Email Marketing Mastery",
  provider: "Mailchimp",
  level: "Avanzado",
  free: true
}];
const resources = [{
  title: "Canva Templates Marketing",
  type: "Herramienta",
  url: "#"
}, {
  title: "Guía de tamaños de imagen RRSS 2026",
  type: "Guía",
  url: "#"
}, {
  title: "Calendario editorial template",
  type: "Plantilla",
  url: "#"
}, {
  title: "Paleta de colores para RRSS",
  type: "Herramienta",
  url: "#"
}];
function BibliotecaPage() {
  return /* @__PURE__ */ jsx(DashboardLayout, { children: /* @__PURE__ */ jsxs("div", { className: "space-y-8 p-4 sm:p-6 lg:p-8", children: [
    /* @__PURE__ */ jsx(PageHeader, { title: "Biblioteca de Aprendizaje", description: "Recursos curados para tu crecimiento profesional" }),
    /* @__PURE__ */ jsxs("section", { children: [
      /* @__PURE__ */ jsxs("h2", { className: "font-heading text-lg font-semibold text-foreground mb-4 flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(Play, { className: "h-5 w-5 text-primary" }),
        "Videos recomendados"
      ] }),
      /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3", children: videos.map((v, i) => /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-border bg-card p-4 transition-shadow hover:shadow-sm", children: [
        /* @__PURE__ */ jsx("div", { className: "flex aspect-video items-center justify-center rounded-lg bg-muted mb-3", children: /* @__PURE__ */ jsx(Play, { className: "h-8 w-8 text-muted-foreground" }) }),
        /* @__PURE__ */ jsx("h3", { className: "text-sm font-semibold text-card-foreground", children: v.title }),
        /* @__PURE__ */ jsxs("div", { className: "mt-1 flex items-center justify-between text-xs text-muted-foreground", children: [
          /* @__PURE__ */ jsx("span", { children: v.channel }),
          /* @__PURE__ */ jsx("span", { children: v.duration })
        ] }),
        v.saved && /* @__PURE__ */ jsx(Star, { className: "mt-2 h-3.5 w-3.5 fill-warning text-warning" })
      ] }, i)) })
    ] }),
    /* @__PURE__ */ jsxs("section", { children: [
      /* @__PURE__ */ jsxs("h2", { className: "font-heading text-lg font-semibold text-foreground mb-4 flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(BookOpen, { className: "h-5 w-5 text-primary" }),
        "Cursos gratuitos recomendados"
      ] }),
      /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 gap-4 sm:grid-cols-2", children: courses.map((c, i) => /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4 rounded-xl border border-border bg-card p-4 transition-shadow hover:shadow-sm", children: [
        /* @__PURE__ */ jsx("div", { className: "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10", children: /* @__PURE__ */ jsx(BookOpen, { className: "h-5 w-5 text-primary" }) }),
        /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
          /* @__PURE__ */ jsx("h3", { className: "text-sm font-semibold text-card-foreground", children: c.title }),
          /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground", children: [
            c.provider,
            " · ",
            c.level
          ] })
        ] }),
        /* @__PURE__ */ jsx("span", { className: "rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-medium text-success", children: "Gratis" })
      ] }, i)) })
    ] }),
    /* @__PURE__ */ jsxs("section", { children: [
      /* @__PURE__ */ jsxs("h2", { className: "font-heading text-lg font-semibold text-foreground mb-4 flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(ExternalLink, { className: "h-5 w-5 text-primary" }),
        "Recursos útiles"
      ] }),
      /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4", children: resources.map((r, i) => /* @__PURE__ */ jsxs("a", { href: r.url, className: "flex items-center gap-3 rounded-xl border border-border bg-card p-4 transition-all hover:shadow-sm hover:border-primary/30", children: [
        /* @__PURE__ */ jsx(ExternalLink, { className: "h-4 w-4 shrink-0 text-muted-foreground" }),
        /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
          /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-card-foreground truncate", children: r.title }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: r.type })
        ] })
      ] }, i)) })
    ] })
  ] }) });
}
export {
  BibliotecaPage as component
};
