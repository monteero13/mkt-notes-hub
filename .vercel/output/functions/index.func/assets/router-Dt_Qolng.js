import { jsxs, jsx } from "react/jsx-runtime";
import { createRootRoute, Link, Outlet, HeadContent, Scripts, createFileRoute, lazyRouteComponent, createRouter, useRouter } from "@tanstack/react-router";
import { initReactI18next, useTranslation, I18nextProvider } from "react-i18next";
import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { useState, useEffect, Suspense, lazy } from "react";
const translation$1 = { "sidebar": { "dashboard": "Dashboard", "planificador": "Planner", "contenido": "Content", "campanas": "Campaigns", "objetivos": "Goals", "ideas": "Ideas", "biblioteca": "Library", "equipo": "Team", "pro": "Pro", "premium_access": "Premium Access", "premium_desc": "Unlock unlimited campaigns and advanced analytics for just 5€/month.", "upgrade_now": "Upgrade Now", "light_mode": "Light Mode", "dark_mode": "Dark Mode" }, "tutorial": { "next": "Next", "back": "Back", "skip": "Skip Tour", "last": "Get Started", "step1_title": "Welcome to mkt.notes", "step1_content": "Let's take a quick tour so you can make the most out of your new tool.", "step_dashboard_title": "Dashboard", "step_dashboard_content": "This is your main screen. Get an overview of your strategy execution, metrics, and upcoming tasks.", "step_planificador_title": "Planner", "step_planificador_content": "A calendar where you can schedule and organize your launches and posted content over time.", "step_contenido_title": "Content", "step_contenido_content": "Your content operations hub. Draft, manage copy, and keep your materials organized.", "step_campanas_title": "Campaigns", "step_campanas_content": "Evaluate and control your ad campaigns, targeting, and ROI. (Pro Feature).", "step_objetivos_title": "Goals", "step_objetivos_content": "Set clear objectives (OKRs, KPIs) and regularly track your strategic achievements.", "step_ideas_title": "Ideas", "step_ideas_content": "Experiencing a creative block? Write down brain dumps and fleeting ideas so they never slip away.", "step_biblioteca_title": "Library", "step_biblioteca_content": "Your repository for references, visual inspiration, and brand guidelines.", "step_equipo_title": "Team", "step_equipo_content": "Manage permissions, invite collaborators, and coordinate your entire department asynchronously.", "step3_title": "Premium Features", "step3_content": "If you need to scale, you can unlock Pro features anytime for 5€." }, "common": { "not_found_title": "404", "not_found_subtitle": "Page Not Found", "not_found_desc": "The page you looking for doesn't exist or has been moved.", "back_to_home": "Back to Home", "today": "Today", "high": "High", "medium": "Medium", "low": "Low", "in_progress": "In Progress", "pending": "Pending", "active": "Active", "planning": "Planning" }, "dashboard": { "title": "Dashboard", "desc": "Summary of your marketing activity", "active_campaigns": "Active Campaigns", "planned_posts": "Planned Posts", "this_week": "This week", "goals_achieved": "Goals achieved", "pending_tasks": "Pending tasks", "priority_tasks": "Priority tasks", "current_week": "Current week" }, "pricing": { "badge": "Plans & Pricing", "title": "Take your marketing to the next level", "subtitle": "Choose the plan that best fits your needs. Start for free or unlock full potential with our Pro plan.", "free_plan": "Free Plan", "free_desc": "Ideal for starting to organize your notes.", "free_price_suffix": "/forever", "pro_plan": "Pro Plan", "pro_desc": "For professionals who want no limits.", "pro_price_suffix": "/month", "recommended": "Recommended", "get_pro": "Get Pro Now", "keep_free": "Stay with Free", "secure_payment": "Secure payment with Stripe. Cancel at any time.", "features": { "active_campaigns": "Up to 3 active campaigns", "basic_library": "Basic resource library", "monthly_planner": "Monthly planner", "one_device": "Access on one device", "unlimited_campaigns": "Unlimited campaigns", "advanced_analytics": "Advanced Analytics (Beta)", "full_library": "Full premium library", "team_collaboration": "Team collaboration", "priority_support": "Priority support", "multi_device": "Multi-device access" } } };
const en = {
  translation: translation$1
};
const translation = { "sidebar": { "dashboard": "Dashboard", "planificador": "Planificador", "contenido": "Contenido", "campanas": "Campañas", "objetivos": "Objetivos", "ideas": "Ideas", "biblioteca": "Biblioteca", "equipo": "Equipo", "pro": "Pro", "premium_access": "Acceso Premium", "premium_desc": "Desbloquea campañas ilimitadas y análisis avanzado por solo 5€/mes.", "upgrade_now": "Actualizar Ahora", "light_mode": "Modo Claro", "dark_mode": "Modo Oscuro" }, "tutorial": { "next": "Siguiente", "back": "Atrás", "skip": "Omitir Tour", "last": "Empezar", "step1_title": "Bienvenido a mkt.notes", "step1_content": "Te vamos a dar un breve tour para que le saques el máximo partido a tu nueva herramienta.", "step_dashboard_title": "Dashboard", "step_dashboard_content": "Esta es tu pantalla principal. Aquí tendrás una visión general del rendimiento de tus estrategias, métricas y próximos pasos.", "step_planificador_title": "Planificador", "step_planificador_content": "Un calendario donde podrás agendar y organizar temporalmente todos tus lanzamientos y publicaciones pautadas.", "step_contenido_title": "Contenido", "step_contenido_content": "El centro de operaciones de tu contenido. Redacta, gestiona copys y mantén todo tu material aquí.", "step_campanas_title": "Campañas", "step_campanas_content": "Evalúa y controla tus campañas publicitarias, segmentaciones y retornos de inversión. (Característica Pro).", "step_objetivos_title": "Objetivos", "step_objetivos_content": "Define metas claras (OKRs, KPIs) y haz un seguimiento periódico de tus logros estratégicos.", "step_ideas_title": "Ideas", "step_ideas_content": "¿Tienes un bloque creativo? Anota lluvias de ideas, braimstormings fugaces y no dejes escapar nada.", "step_biblioteca_title": "Biblioteca", "step_biblioteca_content": "Tu archivo de recursos, referencias, inspiración visual y guías de la marca.", "step_equipo_title": "Equipo", "step_equipo_content": "Gestiona permisos, invita colaboradores y coordina a todo tu departamento asíncronamente.", "step3_title": "Funciones Premium", "step3_content": "Si necesitas escalar, puedes desbloquear las características Pro en cualquier momento por 5€." }, "common": { "not_found_title": "404", "not_found_subtitle": "Página no encontrada", "not_found_desc": "La página que buscas no existe o ha sido movida.", "back_to_home": "Volver al inicio", "today": "Hoy", "high": "Alta", "medium": "Media", "low": "Baja", "in_progress": "En proceso", "pending": "Pendiente", "active": "Activa", "planning": "Planificación" }, "dashboard": { "title": "Dashboard", "desc": "Resumen de tu actividad de marketing", "active_campaigns": "Campañas activas", "planned_posts": "Posts planificados", "this_week": "Esta semana", "goals_achieved": "Objetivos cumplidos", "pending_tasks": "Tareas pendientes", "priority_tasks": "Tareas prioritarias", "current_week": "Semana actual" }, "pricing": { "badge": "Planes y Precios", "title": "Lleva tu marketing al siguiente nivel", "subtitle": "Elige el plan que mejor se adapte a tus necesidades. Empieza gratis o desbloquea todo el potencial con nuestro plan Pro.", "free_plan": "Plan Gratuito", "free_desc": "Ideal para empezar a organizar tus notas.", "free_price_suffix": "/siempre", "pro_plan": "Plan Pro", "pro_desc": "Para profesionales que no quieren límites.", "pro_price_suffix": "/mes", "recommended": "Recomendado", "get_pro": "Obtener Pro Ahora", "keep_free": "Seguir con Free", "secure_payment": "Pago seguro con Stripe. Cancela en cualquier momento.", "features": { "active_campaigns": "Hasta 3 campañas activas", "basic_library": "Biblioteca de recursos básica", "monthly_planner": "Planificador mensual", "one_device": "Acceso en un dispositivo", "unlimited_campaigns": "Campañas ilimitadas", "advanced_analytics": "Análisis avanzado (Beta)", "full_library": "Biblioteca premium completa", "team_collaboration": "Colaboración en equipo", "priority_support": "Soporte prioritario", "multi_device": "Acceso multidispositivo" } } };
const es = {
  translation
};
i18n.use(LanguageDetector).use(initReactI18next).init({
  resources: {
    en,
    es
  },
  fallbackLng: "es",
  interpolation: {
    escapeValue: false
    // React already escapes by default
  }
});
const STATUS = {
  FINISHED: "finished",
  SKIPPED: "skipped"
};
const Joyride = lazy(
  () => import("./index-CxMPFg72.js").then((mod) => ({
    default: mod.Joyride
  }))
);
function OnboardingTutorial() {
  const { t } = useTranslation();
  const [run, setRun] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  useEffect(() => {
    setIsMounted(true);
    setIsDarkMode(document.documentElement.classList.contains("dark"));
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === "class") {
          setIsDarkMode(document.documentElement.classList.contains("dark"));
        }
      });
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"]
    });
    const hasSeenTutorial = localStorage.getItem("mkt_notes_tutorial_completed");
    if (!hasSeenTutorial) {
      setRun(true);
    }
    return () => observer.disconnect();
  }, []);
  const handleJoyrideCallback = (data) => {
    const { status } = data;
    const finishedStatuses = [STATUS.FINISHED, STATUS.SKIPPED];
    if (finishedStatuses.includes(status)) {
      setRun(false);
      localStorage.setItem("mkt_notes_tutorial_completed", "true");
    }
  };
  const steps = [
    {
      target: "body",
      placement: "center",
      disableBeacon: true,
      content: /* @__PURE__ */ jsxs("div", { className: "text-left", children: [
        /* @__PURE__ */ jsx("h3", { className: "text-2xl font-heading font-bold mb-4 text-primary tracking-tight", children: t("tutorial.step1_title") }),
        /* @__PURE__ */ jsx("p", { className: "text-base font-body text-foreground/80 leading-relaxed", children: t("tutorial.step1_content") })
      ] })
    },
    {
      target: ".tour-item-dashboard",
      disableBeacon: true,
      content: /* @__PURE__ */ jsxs("div", { className: "text-left font-body", children: [
        /* @__PURE__ */ jsx("h3", { className: "text-xl font-heading font-bold mb-3 text-primary", children: t("tutorial.step_dashboard_title") }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-foreground/80 leading-relaxed", children: t("tutorial.step_dashboard_content") })
      ] }),
      placement: "right"
    },
    {
      target: ".tour-item-planificador",
      content: /* @__PURE__ */ jsxs("div", { className: "text-left font-body", children: [
        /* @__PURE__ */ jsx("h3", { className: "text-xl font-heading font-bold mb-3 text-primary", children: t("tutorial.step_planificador_title") }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-foreground/80 leading-relaxed", children: t("tutorial.step_planificador_content") })
      ] }),
      placement: "right"
    },
    {
      target: ".tour-item-contenido",
      disableBeacon: true,
      content: /* @__PURE__ */ jsxs("div", { className: "text-left font-body", children: [
        /* @__PURE__ */ jsx("h3", { className: "text-xl font-heading font-bold mb-3 text-primary", children: t("tutorial.step_contenido_title") }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-foreground/80 leading-relaxed", children: t("tutorial.step_contenido_content") })
      ] }),
      placement: "right"
    },
    {
      target: ".tour-item-campanas",
      disableBeacon: true,
      content: /* @__PURE__ */ jsxs("div", { className: "text-left font-body", children: [
        /* @__PURE__ */ jsx("h3", { className: "text-xl font-heading font-bold mb-3 text-primary", children: t("tutorial.step_campanas_title") }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-foreground/80 leading-relaxed", children: t("tutorial.step_campanas_content") })
      ] }),
      placement: "right"
    },
    {
      target: ".tour-item-objetivos",
      disableBeacon: true,
      content: /* @__PURE__ */ jsxs("div", { className: "text-left font-body", children: [
        /* @__PURE__ */ jsx("h3", { className: "text-xl font-heading font-bold mb-3 text-primary", children: t("tutorial.step_objetivos_title") }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-foreground/80 leading-relaxed", children: t("tutorial.step_objetivos_content") })
      ] }),
      placement: "right"
    },
    {
      target: ".tour-item-ideas",
      disableBeacon: true,
      content: /* @__PURE__ */ jsxs("div", { className: "text-left font-body", children: [
        /* @__PURE__ */ jsx("h3", { className: "text-xl font-heading font-bold mb-3 text-primary", children: t("tutorial.step_ideas_title") }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-foreground/80 leading-relaxed", children: t("tutorial.step_ideas_content") })
      ] }),
      placement: "right"
    },
    {
      target: ".tour-item-biblioteca",
      disableBeacon: true,
      content: /* @__PURE__ */ jsxs("div", { className: "text-left font-body", children: [
        /* @__PURE__ */ jsx("h3", { className: "text-xl font-heading font-bold mb-3 text-primary", children: t("tutorial.step_biblioteca_title") }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-foreground/80 leading-relaxed", children: t("tutorial.step_biblioteca_content") })
      ] }),
      placement: "right"
    },
    {
      target: ".tour-item-equipo",
      disableBeacon: true,
      content: /* @__PURE__ */ jsxs("div", { className: "text-left font-body", children: [
        /* @__PURE__ */ jsx("h3", { className: "text-xl font-heading font-bold mb-3 text-primary", children: t("tutorial.step_equipo_title") }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-foreground/80 leading-relaxed", children: t("tutorial.step_equipo_content") })
      ] }),
      placement: "right"
    },
    {
      target: ".tour-upgrade-card",
      disableBeacon: true,
      content: /* @__PURE__ */ jsxs("div", { className: "text-left font-body", children: [
        /* @__PURE__ */ jsx("h3", { className: "text-xl font-heading font-bold mb-3 text-primary", children: t("tutorial.step3_title") }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-foreground/80 leading-relaxed", children: t("tutorial.step3_content") })
      ] }),
      placement: "right"
    }
  ];
  if (!isMounted) return null;
  return /* @__PURE__ */ jsx(Suspense, { fallback: null, children: /* @__PURE__ */ jsx(
    Joyride,
    {
      callback: handleJoyrideCallback,
      continuous: true,
      hideCloseButton: true,
      run,
      scrollToFirstStep: true,
      showProgress: true,
      showSkipButton: true,
      disableBeacons: true,
      disableOverlayClose: true,
      steps,
      locale: {
        last: t("tutorial.last"),
        skip: t("tutorial.skip"),
        next: t("tutorial.next"),
        back: t("tutorial.back")
      },
      styles: {
        options: {
          arrowColor: isDarkMode ? "rgba(30, 41, 59, 1)" : "rgba(255, 255, 255, 1)",
          backgroundColor: isDarkMode ? "rgba(30, 41, 59, 1)" : "rgba(255, 255, 255, 1)",
          overlayColor: isDarkMode ? "rgba(0, 0, 0, 0.85)" : "rgba(0, 0, 0, 0.7)",
          primaryColor: "var(--primary)",
          textColor: isDarkMode ? "rgba(255, 255, 255, 1)" : "var(--foreground)",
          zIndex: 1e3
        },
        tooltip: {
          borderRadius: "24px",
          backdropFilter: "blur(20px) saturate(180%)",
          backgroundColor: isDarkMode ? "rgba(15, 23, 42, 0.98)" : "rgba(255, 255, 255, 0.98)",
          border: isDarkMode ? "1px solid rgba(255, 255, 255, 0.15)" : "1px solid rgba(0, 0, 0, 0.1)",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
          padding: "40px"
          // Aumentado para que la X no se salga
        },
        tooltipContainer: {
          textAlign: "left"
        },
        tooltipTitle: {
          fontFamily: "var(--font-heading)",
          fontSize: "22px",
          fontWeight: 800,
          marginBottom: "16px",
          color: "var(--primary)",
          letterSpacing: "-0.02em"
        },
        tooltipContent: {
          fontFamily: "var(--font-body)",
          padding: "0",
          fontSize: "15px",
          lineHeight: 1.7,
          color: isDarkMode ? "rgba(255, 255, 255, 0.8)" : "var(--foreground)",
          opacity: 0.8
        },
        buttonNext: {
          backgroundColor: "var(--primary)",
          borderRadius: "14px",
          color: "#fff",
          fontSize: "15px",
          fontWeight: 700,
          padding: "12px 24px",
          fontFamily: "var(--font-heading)",
          boxShadow: "0 10px 15px -3px rgba(94, 129, 244, 0.4)",
          transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
        },
        buttonBack: {
          color: isDarkMode ? "rgba(255, 255, 255, 0.5)" : "var(--muted-foreground)",
          marginRight: "16px",
          fontSize: "14px",
          fontWeight: 600,
          fontFamily: "var(--font-heading)"
        },
        buttonSkip: {
          color: isDarkMode ? "rgba(255, 255, 255, 0.5)" : "var(--muted-foreground)",
          fontSize: "13px",
          fontWeight: 500,
          fontFamily: "var(--font-heading)"
        },
        buttonClose: {
          top: "16px",
          right: "16px",
          color: isDarkMode ? "rgba(255, 255, 255, 0.5)" : "rgba(0, 0, 0, 0.3)",
          transition: "all 0.2s"
        },
        spotlight: {
          borderRadius: "20px",
          boxShadow: isDarkMode ? "0 0 0 9999px rgba(0, 0, 0, 0.85), 0 0 40px var(--primary)" : "0 0 0 9999px rgba(0, 0, 0, 0.6), 0 0 25px var(--primary)"
        }
      }
    }
  ) });
}
const appCss = "/assets/styles-DTKlinPm.css";
function NotFoundComponent() {
  const { t } = useTranslation();
  return /* @__PURE__ */ jsx("div", { className: "flex min-h-screen items-center justify-center bg-background px-4", children: /* @__PURE__ */ jsxs("div", { className: "max-w-md text-center", children: [
    /* @__PURE__ */ jsx("h1", { className: "font-heading text-7xl font-bold text-foreground", children: t("common.not_found_title") }),
    /* @__PURE__ */ jsx("h2", { className: "mt-4 font-heading text-xl font-semibold text-foreground", children: t("common.not_found_subtitle") }),
    /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: t("common.not_found_desc") }),
    /* @__PURE__ */ jsx("div", { className: "mt-6", children: /* @__PURE__ */ jsx(
      Link,
      {
        to: "/",
        className: "inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
        children: t("common.back_to_home")
      }
    ) })
  ] }) });
}
const Route$a = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "mkt.notes — Agenda Digital para Marketing" },
      { name: "description", content: "Agenda digital interactiva para profesionales del marketing. Planifica campañas, organiza contenido y colabora con tu equipo." },
      { name: "author", content: "mkt.notes" },
      { property: "og:title", content: "mkt.notes — Agenda Digital para Marketing" },
      { property: "og:description", content: "Planifica campañas, organiza contenido y colabora con tu equipo." },
      { property: "og:type", content: "website" }
    ],
    links: [
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg?v=1" },
      { rel: "shortcut icon", href: "/favicon.svg?v=1" },
      { rel: "apple-touch-icon", href: "/favicon.svg?v=1" },
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=Manrope:wght@300;400;500;600;700&display=swap" }
    ]
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent
});
function RootShell({ children }) {
  return /* @__PURE__ */ jsxs("html", { lang: "es", children: [
    /* @__PURE__ */ jsx("head", { children: /* @__PURE__ */ jsx(HeadContent, {}) }),
    /* @__PURE__ */ jsxs("body", { children: [
      children,
      /* @__PURE__ */ jsx(Scripts, {})
    ] })
  ] });
}
function RootComponent() {
  return /* @__PURE__ */ jsxs(I18nextProvider, { i18n, children: [
    /* @__PURE__ */ jsx(OnboardingTutorial, {}),
    /* @__PURE__ */ jsx(Outlet, {})
  ] });
}
const $$splitComponentImporter$9 = () => import("./pricing-CSiZsvIR.js");
const Route$9 = createFileRoute("/pricing")({
  component: lazyRouteComponent($$splitComponentImporter$9, "component")
});
const $$splitComponentImporter$8 = () => import("./planificador-hF5Q-1QU.js");
const Route$8 = createFileRoute("/planificador")({
  head: () => ({
    meta: [{
      title: "Planificador Mensual — mkt.notes"
    }, {
      name: "description",
      content: "Planifica tus campañas, deadlines y reuniones mes a mes."
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$8, "component")
});
const $$splitComponentImporter$7 = () => import("./objetivos-BLDvnitO.js");
const Route$7 = createFileRoute("/objetivos")({
  head: () => ({
    meta: [{
      title: "Objetivos de Marketing — mkt.notes"
    }, {
      name: "description",
      content: "Define y mide tus objetivos trimestrales de marketing."
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$7, "component")
});
const $$splitComponentImporter$6 = () => import("./login-BU1RmncO.js");
const Route$6 = createFileRoute("/login")({
  component: lazyRouteComponent($$splitComponentImporter$6, "component")
});
const $$splitComponentImporter$5 = () => import("./ideas-D3AtA1tw.js");
const Route$5 = createFileRoute("/ideas")({
  head: () => ({
    meta: [{
      title: "Banco de Ideas — mkt.notes"
    }, {
      name: "description",
      content: "Guarda y organiza tus ideas de contenido para redes sociales."
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$5, "component")
});
const $$splitComponentImporter$4 = () => import("./equipo-BywNKkD-.js");
const Route$4 = createFileRoute("/equipo")({
  head: () => ({
    meta: [{
      title: "Zona Colaborativa — mkt.notes"
    }, {
      name: "description",
      content: "Colabora con tu equipo: tareas compartidas, proyectos y comentarios."
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$4, "component")
});
const $$splitComponentImporter$3 = () => import("./contenido-D23b-Kmk.js");
const Route$3 = createFileRoute("/contenido")({
  head: () => ({
    meta: [{
      title: "Calendario de Contenido — mkt.notes"
    }, {
      name: "description",
      content: "Planifica y organiza tus publicaciones en redes sociales."
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$3, "component")
});
const $$splitComponentImporter$2 = () => import("./campanas-DUZKGEWK.js");
const Route$2 = createFileRoute("/campanas")({
  head: () => ({
    meta: [{
      title: "Seguimiento de Campañas — mkt.notes"
    }, {
      name: "description",
      content: "Haz seguimiento de tus campañas de marketing: objetivos, presupuesto y KPIs."
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
const $$splitComponentImporter$1 = () => import("./biblioteca-CxDwD71B.js");
const Route$1 = createFileRoute("/biblioteca")({
  head: () => ({
    meta: [{
      title: "Biblioteca de Aprendizaje — mkt.notes"
    }, {
      name: "description",
      content: "Videos, cursos y recursos útiles para profesionales del marketing."
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
const $$splitComponentImporter = () => import("./index-B7OtM8-w.js");
const Route = createFileRoute("/")({
  component: lazyRouteComponent($$splitComponentImporter, "component")
});
const PricingRoute = Route$9.update({
  id: "/pricing",
  path: "/pricing",
  getParentRoute: () => Route$a
});
const PlanificadorRoute = Route$8.update({
  id: "/planificador",
  path: "/planificador",
  getParentRoute: () => Route$a
});
const ObjetivosRoute = Route$7.update({
  id: "/objetivos",
  path: "/objetivos",
  getParentRoute: () => Route$a
});
const LoginRoute = Route$6.update({
  id: "/login",
  path: "/login",
  getParentRoute: () => Route$a
});
const IdeasRoute = Route$5.update({
  id: "/ideas",
  path: "/ideas",
  getParentRoute: () => Route$a
});
const EquipoRoute = Route$4.update({
  id: "/equipo",
  path: "/equipo",
  getParentRoute: () => Route$a
});
const ContenidoRoute = Route$3.update({
  id: "/contenido",
  path: "/contenido",
  getParentRoute: () => Route$a
});
const CampanasRoute = Route$2.update({
  id: "/campanas",
  path: "/campanas",
  getParentRoute: () => Route$a
});
const BibliotecaRoute = Route$1.update({
  id: "/biblioteca",
  path: "/biblioteca",
  getParentRoute: () => Route$a
});
const IndexRoute = Route.update({
  id: "/",
  path: "/",
  getParentRoute: () => Route$a
});
const rootRouteChildren = {
  IndexRoute,
  BibliotecaRoute,
  CampanasRoute,
  ContenidoRoute,
  EquipoRoute,
  IdeasRoute,
  LoginRoute,
  ObjetivosRoute,
  PlanificadorRoute,
  PricingRoute
};
const routeTree = Route$a._addFileChildren(rootRouteChildren)._addFileTypes();
function DefaultErrorComponent({
  error,
  reset
}) {
  const router = useRouter();
  return /* @__PURE__ */ jsx("div", { className: "flex min-h-screen items-center justify-center bg-background px-4", children: /* @__PURE__ */ jsxs("div", { className: "max-w-md text-center", children: [
    /* @__PURE__ */ jsx("div", { className: "mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10", children: /* @__PURE__ */ jsx(
      "svg",
      {
        xmlns: "http://www.w3.org/2000/svg",
        className: "h-8 w-8 text-destructive",
        fill: "none",
        viewBox: "0 0 24 24",
        stroke: "currentColor",
        strokeWidth: 2,
        children: /* @__PURE__ */ jsx(
          "path",
          {
            strokeLinecap: "round",
            strokeLinejoin: "round",
            d: "M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
          }
        )
      }
    ) }),
    /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold tracking-tight text-foreground", children: "Something went wrong" }),
    /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "An unexpected error occurred. Please try again." }),
    false,
    /* @__PURE__ */ jsxs("div", { className: "mt-6 flex items-center justify-center gap-3", children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => {
            router.invalidate();
            reset();
          },
          className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
          children: "Try again"
        }
      ),
      /* @__PURE__ */ jsx(
        "a",
        {
          href: "/",
          className: "inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent",
          children: "Go home"
        }
      )
    ] })
  ] }) });
}
const getRouter = () => {
  const router = createRouter({
    routeTree,
    context: {},
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
    defaultErrorComponent: DefaultErrorComponent
  });
  return router;
};
export {
  getRouter
};
