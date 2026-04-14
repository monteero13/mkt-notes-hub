import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { Link } from "@tanstack/react-router";
import { Zap, Crown, Sparkles, Shield, Check } from "lucide-react";
import { B as Button } from "./button-CjC9Szlf.js";
import { C as Card, a as CardHeader, b as CardTitle, c as CardDescription, d as CardContent, e as CardFooter } from "./card-BL80elSP.js";
import { B as Badge } from "./badge-DCKZzNGZ.js";
import { useTranslation } from "react-i18next";
import "react";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "clsx";
import "tailwind-merge";
function PricingPage() {
  const {
    t,
    i18n
  } = useTranslation();
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-background py-20 px-4", children: [
    /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-5xl text-center mb-16", children: [
      /* @__PURE__ */ jsx(Badge, { variant: "secondary", className: "mb-4 px-4 py-1.5 bg-primary/10 text-primary border-none font-bold uppercase tracking-widest text-[10px]", children: t("pricing.badge") }),
      /* @__PURE__ */ jsx("h1", { className: "font-heading text-4xl md:text-6xl font-bold tracking-tight text-foreground mb-6", children: i18n.language === "es" ? /* @__PURE__ */ jsxs(Fragment, { children: [
        "Lleva tu marketing al ",
        /* @__PURE__ */ jsx("span", { className: "text-primary tracking-tighter italic", children: "siguiente nivel" })
      ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
        "Take your marketing to the ",
        /* @__PURE__ */ jsx("span", { className: "text-primary tracking-tighter italic", children: "next level" })
      ] }) }),
      /* @__PURE__ */ jsx("p", { className: "text-lg text-muted-foreground max-w-2xl mx-auto", children: t("pricing.subtitle") })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto", children: [
      /* @__PURE__ */ jsxs(Card, { className: "relative border-border bg-card/50 backdrop-blur-sm transition-all hover:border-primary/20 hover:shadow-2xl hover:shadow-primary/5", children: [
        /* @__PURE__ */ jsxs(CardHeader, { children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-2", children: [
            /* @__PURE__ */ jsx(Zap, { className: "h-5 w-5 text-muted-foreground" }),
            /* @__PURE__ */ jsx(CardTitle, { className: "text-xl", children: t("pricing.free_plan") })
          ] }),
          /* @__PURE__ */ jsx(CardDescription, { children: t("pricing.free_desc") }),
          /* @__PURE__ */ jsxs("div", { className: "mt-4 flex items-baseline gap-1", children: [
            /* @__PURE__ */ jsx("span", { className: "text-4xl font-bold tracking-tight", children: "0€" }),
            /* @__PURE__ */ jsx("span", { className: "text-sm font-medium text-muted-foreground", children: t("pricing.free_price_suffix") })
          ] })
        ] }),
        /* @__PURE__ */ jsxs(CardContent, { className: "space-y-4", children: [
          /* @__PURE__ */ jsx(FeatureItem, { text: t("pricing.features.active_campaigns") }),
          /* @__PURE__ */ jsx(FeatureItem, { text: t("pricing.features.basic_library") }),
          /* @__PURE__ */ jsx(FeatureItem, { text: t("pricing.features.monthly_planner") }),
          /* @__PURE__ */ jsx(FeatureItem, { text: t("pricing.features.one_device") })
        ] }),
        /* @__PURE__ */ jsx(CardFooter, { children: /* @__PURE__ */ jsx(Link, { to: "/", className: "w-full", children: /* @__PURE__ */ jsx(Button, { variant: "outline", className: "w-full h-11 font-bold", children: t("pricing.keep_free") }) }) })
      ] }),
      /* @__PURE__ */ jsxs(Card, { className: "relative border-primary bg-card shadow-2xl shadow-primary/10 transition-all hover:scale-[1.02] overflow-hidden", children: [
        /* @__PURE__ */ jsx("div", { className: "absolute top-0 right-0", children: /* @__PURE__ */ jsx("div", { className: "bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-widest py-1 px-10 rotate-45 translate-x-[30%] translate-y-[50%]", children: t("pricing.recommended") }) }),
        /* @__PURE__ */ jsxs(CardHeader, { children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-2", children: [
            /* @__PURE__ */ jsx(Crown, { className: "h-5 w-5 text-primary" }),
            /* @__PURE__ */ jsx(CardTitle, { className: "text-xl", children: t("pricing.pro_plan") })
          ] }),
          /* @__PURE__ */ jsx(CardDescription, { children: t("pricing.pro_desc") }),
          /* @__PURE__ */ jsxs("div", { className: "mt-4 flex items-baseline gap-1", children: [
            /* @__PURE__ */ jsx("span", { className: "text-4xl font-bold tracking-tight", children: "5€" }),
            /* @__PURE__ */ jsx("span", { className: "text-sm font-medium text-muted-foreground", children: t("pricing.pro_price_suffix") })
          ] })
        ] }),
        /* @__PURE__ */ jsxs(CardContent, { className: "space-y-4", children: [
          /* @__PURE__ */ jsx(FeatureItem, { text: t("pricing.features.unlimited_campaigns"), isPro: true }),
          /* @__PURE__ */ jsx(FeatureItem, { text: t("pricing.features.advanced_analytics"), isPro: true }),
          /* @__PURE__ */ jsx(FeatureItem, { text: t("pricing.features.full_library"), isPro: true }),
          /* @__PURE__ */ jsx(FeatureItem, { text: t("pricing.features.team_collaboration"), isPro: true }),
          /* @__PURE__ */ jsx(FeatureItem, { text: t("pricing.features.priority_support"), isPro: true }),
          /* @__PURE__ */ jsx(FeatureItem, { text: t("pricing.features.multi_device"), isPro: true })
        ] }),
        /* @__PURE__ */ jsx(CardFooter, { children: /* @__PURE__ */ jsxs(Button, { className: "w-full h-11 bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30", children: [
          /* @__PURE__ */ jsx(Sparkles, { className: "h-4 w-4 mr-2" }),
          t("pricing.get_pro")
        ] }) })
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "mt-20 text-center", children: /* @__PURE__ */ jsxs("div", { className: "inline-flex items-center gap-2 p-2 px-4 rounded-full bg-muted/50 border border-border text-sm text-muted-foreground", children: [
      /* @__PURE__ */ jsx(Shield, { className: "h-4 w-4" }),
      /* @__PURE__ */ jsx("span", { children: t("pricing.secure_payment") })
    ] }) })
  ] });
}
function FeatureItem({
  text,
  isPro = false
}) {
  return /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3", children: [
    /* @__PURE__ */ jsx("div", { className: `mt-0.5 rounded-full p-0.5 ${isPro ? "bg-primary/20" : "bg-muted"}`, children: /* @__PURE__ */ jsx(Check, { className: `h-3 w-3 ${isPro ? "text-primary" : "text-muted-foreground"}` }) }),
    /* @__PURE__ */ jsx("span", { className: `text-sm ${isPro ? "font-medium text-foreground" : "text-muted-foreground"}`, children: text })
  ] });
}
export {
  PricingPage as component
};
