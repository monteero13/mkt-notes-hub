import { jsx, jsxs } from "react/jsx-runtime";
import { useLocation, Link } from "@tanstack/react-router";
import { Instagram, ChevronRight, ChevronLeft, LayoutDashboard, Calendar, FileText, BarChart3, Target, Lightbulb, BookOpen, Users, Sun, Moon, Globe, Crown, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { c as cn, B as Button } from "./button-CjC9Szlf.js";
import { B as Badge } from "./badge-DCKZzNGZ.js";
function DeveloperSignature({ collapsed }) {
  if (collapsed) {
    return /* @__PURE__ */ jsx("div", { className: "mt-auto border-t border-border p-4 flex justify-center opacity-50 hover:opacity-100 transition-opacity", children: /* @__PURE__ */ jsx("a", { href: "https://instagram.com/albeertomontero_", target: "_blank", rel: "noopener noreferrer", children: /* @__PURE__ */ jsx(Instagram, { className: "h-4 w-4 text-primary" }) }) });
  }
  return /* @__PURE__ */ jsx("div", { className: "mt-auto border-t border-white/5 bg-background/30 backdrop-blur-md p-4 transition-all duration-300", children: /* @__PURE__ */ jsx(
    "a",
    {
      href: "https://instagram.com/albeertomontero_",
      target: "_blank",
      rel: "noopener noreferrer",
      className: "group flex items-center justify-between gap-2 rounded-xl p-2 transition-all hover:bg-white/5",
      children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 opacity-50 group-hover:opacity-100 transition-opacity", children: [
        /* @__PURE__ */ jsx(Instagram, { className: "h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" }),
        /* @__PURE__ */ jsx("span", { className: "text-[11px] text-muted-foreground font-medium group-hover:text-foreground", children: "@albeertomontero_" })
      ] })
    }
  ) });
}
const navItems = [
  { id: "dashboard", to: "/", icon: LayoutDashboard },
  { id: "planificador", to: "/planificador", icon: Calendar },
  { id: "contenido", to: "/contenido", icon: FileText },
  { id: "campanas", to: "/campanas", icon: BarChart3, isPro: true },
  { id: "objetivos", to: "/objetivos", icon: Target },
  { id: "ideas", to: "/ideas", icon: Lightbulb },
  { id: "biblioteca", to: "/biblioteca", icon: BookOpen },
  { id: "equipo", to: "/equipo", icon: Users, isPro: true }
];
function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const [isDark, setIsDark] = useState(false);
  useEffect(() => {
    const savedTheme = localStorage.getItem("mkt-theme");
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (savedTheme === "dark" || !savedTheme && systemPrefersDark) {
      setIsDark(true);
      document.documentElement.classList.add("dark");
    }
  }, []);
  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    if (newIsDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("mkt-theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("mkt-theme", "light");
    }
  };
  const toggleLanguage = () => {
    const nextLang = i18n.language === "es" ? "en" : "es";
    i18n.changeLanguage(nextLang);
  };
  return /* @__PURE__ */ jsxs(
    "aside",
    {
      className: cn(
        "fixed inset-y-0 left-0 z-30 hidden md:flex flex-col transition-all duration-300",
        "bg-sidebar/95 backdrop-blur-xl border-r border-border/50 shadow-2xl",
        collapsed ? "w-16" : "w-64"
      ),
      children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => setCollapsed(!collapsed),
            className: "absolute -right-3 top-6 z-40 flex h-6 w-6 items-center justify-center rounded-full border border-border bg-background shadow-md text-muted-foreground hover:text-foreground transition-all hover:scale-110",
            children: collapsed ? /* @__PURE__ */ jsx(ChevronRight, { className: "h-3 w-3" }) : /* @__PURE__ */ jsx(ChevronLeft, { className: "h-3 w-3" })
          }
        ),
        /* @__PURE__ */ jsx("div", { className: cn("flex h-20 items-center px-6", collapsed ? "justify-center px-0" : "justify-between"), children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsx("div", { className: "relative", children: /* @__PURE__ */ jsx("div", { className: cn(
            "relative flex shrink-0 items-center justify-center transition-all duration-300",
            collapsed ? "h-11 w-11 mx-auto" : "h-14 w-14"
          ), children: /* @__PURE__ */ jsx(
            "img",
            {
              src: isDark ? "/dark_logo.png" : "/logo.png",
              alt: "mkt.notes",
              className: cn(
                "h-full w-full object-contain transition-all duration-500",
                !isDark && "mix-blend-multiply"
              )
            }
          ) }) }),
          !collapsed && /* @__PURE__ */ jsxs("div", { className: "flex flex-col", children: [
            /* @__PURE__ */ jsx("span", { className: "font-heading text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70", children: "mkt.notes" }),
            /* @__PURE__ */ jsx("span", { className: "text-[9px] font-bold text-primary tracking-[0.2em] uppercase opacity-80 -mt-1", children: "Marketing Hub" })
          ] })
        ] }) }),
        /* @__PURE__ */ jsx("nav", { className: "tour-sidebar-nav flex-1 space-y-1 px-3 py-6 overflow-y-auto overflow-x-hidden scrollbar-none", children: navItems.map((item) => {
          const isActive = item.to === "/" ? location.pathname === "/" : location.pathname.startsWith(item.to);
          return /* @__PURE__ */ jsxs(
            Link,
            {
              to: item.to,
              className: cn(
                `tour-item-${item.id}`,
                "group relative flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-300",
                isActive ? "bg-primary/10 text-primary shadow-[0_0_20px_rgba(94,129,244,0.1)]" : "text-sidebar-foreground hover:bg-sidebar-accent/40 hover:text-sidebar-accent-foreground",
                collapsed ? "justify-center" : ""
              ),
              children: [
                isActive && /* @__PURE__ */ jsx("div", { className: "absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full" }),
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
                  /* @__PURE__ */ jsx(item.icon, { className: cn("shrink-0 transition-transform duration-300 group-hover:scale-110", collapsed ? "h-5 w-5" : "h-[18px] w-[18px]", isActive ? "text-primary" : "text-muted-foreground") }),
                  !collapsed && /* @__PURE__ */ jsx("span", { children: t(`sidebar.${item.id}`) })
                ] }),
                !collapsed && item.isPro && /* @__PURE__ */ jsx(Badge, { variant: "secondary", className: "h-4 px-1.5 text-[8px] bg-primary/10 text-primary border-none font-bold uppercase tracking-wider", children: t("sidebar.pro") })
              ]
            },
            item.to
          );
        }) }),
        /* @__PURE__ */ jsxs("div", { className: cn("px-4 py-4 space-y-2 transition-all", collapsed ? "flex flex-col items-center gap-2" : ""), children: [
          /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: toggleTheme,
              className: cn(
                "flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-2 px-3 transition-all hover:bg-white/10 hover:border-white/20",
                collapsed ? "p-2 px-2" : "w-full"
              ),
              title: isDark ? "Switch to Light Mode" : "Switch to Dark Mode",
              children: [
                /* @__PURE__ */ jsx("div", { className: "flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary", children: isDark ? /* @__PURE__ */ jsx(Sun, { className: "h-3 w-3" }) : /* @__PURE__ */ jsx(Moon, { className: "h-3 w-3" }) }),
                !collapsed && /* @__PURE__ */ jsx("span", { className: "text-xs font-semibold text-foreground/80", children: isDark ? t("sidebar.light_mode") : t("sidebar.dark_mode") })
              ]
            }
          ),
          /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: toggleLanguage,
              className: cn(
                "flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-2 px-3 transition-all hover:bg-white/10 hover:border-white/20",
                collapsed ? "p-2 px-2" : "w-full"
              ),
              title: "Toggle Language",
              children: [
                /* @__PURE__ */ jsx("div", { className: "flex h-5 w-5 shrink-0 items-center justify-center rounded-full overflow-hidden shadow-sm ring-1 ring-white/20", children: i18n.language === "es" ? /* @__PURE__ */ jsx("img", { src: "https://flagcdn.com/w40/es.png", alt: "ES", className: "h-full w-full object-cover" }) : /* @__PURE__ */ jsx("img", { src: "https://flagcdn.com/w40/gb.png", alt: "EN", className: "h-full w-full object-cover" }) }),
                !collapsed && /* @__PURE__ */ jsxs("div", { className: "flex flex-1 items-center justify-between", children: [
                  /* @__PURE__ */ jsx("span", { className: "text-xs font-semibold text-foreground/80", children: i18n.language === "es" ? "Español" : "English" }),
                  /* @__PURE__ */ jsx(Globe, { className: "h-3 w-3 text-muted-foreground opacity-50" })
                ] })
              ]
            }
          )
        ] }),
        !collapsed && /* @__PURE__ */ jsx("div", { className: "tour-upgrade-card px-4 py-3", children: /* @__PURE__ */ jsxs("div", { className: "relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-primary/80 p-4 text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:shadow-primary/30 group", children: [
          /* @__PURE__ */ jsxs("div", { className: "relative z-10", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-2", children: [
              /* @__PURE__ */ jsx("div", { className: "p-1 rounded-md bg-white/20", children: /* @__PURE__ */ jsx(Crown, { className: "h-4 w-4" }) }),
              /* @__PURE__ */ jsx("span", { className: "text-xs font-bold uppercase tracking-wider", children: t("sidebar.premium_access") })
            ] }),
            /* @__PURE__ */ jsx("p", { className: "text-[11px] leading-relaxed opacity-90 mb-3", children: t("sidebar.premium_desc") }),
            /* @__PURE__ */ jsx(Link, { to: "/pricing", className: "block", children: /* @__PURE__ */ jsxs(Button, { size: "sm", variant: "secondary", className: "w-full text-xs font-bold h-8 bg-white text-primary hover:bg-white/90 transition-transform group-hover:scale-[1.02]", children: [
              /* @__PURE__ */ jsx(Sparkles, { className: "h-3 w-3 mr-2" }),
              t("sidebar.upgrade_now")
            ] }) })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/10 blur-2xl group-hover:bg-white/20 transition-all duration-500" }),
          /* @__PURE__ */ jsx("div", { className: "absolute -bottom-4 -left-4 h-20 w-20 rounded-full bg-black/10 blur-xl group-hover:bg-black/20 transition-all duration-500" })
        ] }) }),
        /* @__PURE__ */ jsx(DeveloperSignature, { collapsed })
      ]
    }
  );
}
function MobileNav() {
  const location = useLocation();
  const { t } = useTranslation();
  const mobileItems = navItems.slice(0, 5);
  return /* @__PURE__ */ jsx("nav", { className: "fixed inset-x-0 bottom-0 z-30 flex items-center justify-around border-t border-border/50 bg-background/80 backdrop-blur-xl py-3 md:hidden", children: mobileItems.map((item) => {
    const isActive = item.to === "/" ? location.pathname === "/" : location.pathname.startsWith(item.to);
    return /* @__PURE__ */ jsxs(
      Link,
      {
        to: item.to,
        className: cn(
          "flex flex-col items-center gap-1 text-[10px] transition-all",
          isActive ? "text-primary scale-110" : "text-muted-foreground hover:text-foreground"
        ),
        children: [
          /* @__PURE__ */ jsx(item.icon, { className: "h-5 w-5" }),
          /* @__PURE__ */ jsx("span", { className: "font-medium", children: t(`sidebar.${item.id}`) })
        ]
      },
      item.to
    );
  }) });
}
function DashboardLayout({ children }) {
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-background", children: [
    /* @__PURE__ */ jsx(AppSidebar, {}),
    /* @__PURE__ */ jsx(MobileNav, {}),
    /* @__PURE__ */ jsx("main", { className: "md:ml-60 pb-20 md:pb-0", children })
  ] });
}
function PageHeader({ title, description, children }) {
  return /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between", children: [
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("h1", { className: "font-heading text-2xl font-semibold tracking-tight text-foreground", children: title }),
      description && /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: description })
    ] }),
    children && /* @__PURE__ */ jsx("div", { className: "flex items-center gap-2 mt-3 sm:mt-0", children })
  ] });
}
export {
  DashboardLayout as D,
  PageHeader as P
};
