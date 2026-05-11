"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import {
  LayoutDashboard,
  Users,
  Zap,
  Calendar,
  Brain,
  FileText,
  FolderOpen,
  BarChart3,
  ChevronRight,
  ChevronLeft,
  X,
  Sparkles,
  HelpCircle,
  Eye,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TourStep {
  id: number;
  titleEs: string;
  titleEn: string;
  descriptionEs: string;
  descriptionEn: string;
  icon: any;
  path: string;
  targetId: string | null;
  highlightTextEs: string;
  highlightTextEn: string;
  featuresEs: string[];
  featuresEn: string[];
}

const TOUR_STEPS: TourStep[] = [
  {
    id: 1,
    titleEs: "¡Te damos la bienvenida a MKT.NOTES Hub!",
    titleEn: "Welcome to MKT.NOTES Hub!",
    descriptionEs: "Tu nuevo centro de mando estratégico y operativo para marketing. Hemos diseñado esta breve guía interactiva para que conozcas las secciones principales y comiences a dominar la plataforma.",
    descriptionEn: "Your new strategic and operational marketing command center. We've designed this quick interactive guide to help you discover the key areas and master the platform.",
    icon: Sparkles,
    path: "/dashboard",
    targetId: null,
    highlightTextEs: "Centro de Inteligencia de Marketing",
    highlightTextEn: "Marketing Intelligence Hub",
    featuresEs: [
      "Planificación y tracking en tiempo real",
      "Administración ágil de clientes y retainers",
      "Colaboración segura y organizada para tu equipo",
    ],
    featuresEn: [
      "Real-time strategic planning & tracking",
      "Agile client & retainer administration",
      "Secure, organized team collaboration",
    ],
  },
  {
    id: 2,
    titleEs: "¡Empieza aquí! (Dashboard)",
    titleEn: "Start here! (Dashboard)",
    descriptionEs: "La pantalla principal del sistema. Monitorea de un vistazo el progreso de tus objetivos, tareas pendientes y el estado general del espacio de trabajo.",
    descriptionEn: "The main core of the platform. Monitor your annual objectives, pending tasks, and overall workspace health at a glance.",
    icon: LayoutDashboard,
    path: "/dashboard",
    targetId: "sidebar-dashboard",
    highlightTextEs: "Tu Cabina de Pilotaje Táctica",
    highlightTextEn: "Your Tactical Cockpit",
    featuresEs: [
      "Estadísticas clave consolidadas en tiempo real",
      "Control directo sobre objetivos estratégicos",
      "Alertas rápidas y actividades recientes del equipo",
    ],
    featuresEn: [
      "Consolidated real-time key metrics",
      "Direct control over strategic objectives",
      "Fast alerts and team activity feed",
    ],
  },
  {
    id: 3,
    titleEs: "Clientes y Cuentas",
    titleEn: "Clients & Accounts",
    descriptionEs: "El corazón de tu negocio. Registra y administra tus clientes activos, define presupuestos y realiza un seguimiento automático de tu valor de Retainer mensual.",
    descriptionEn: "The heart of your business. Register and manage active clients, define scopes, and automate monthly retainer value tracking.",
    icon: Users,
    path: "/clients",
    targetId: "sidebar-clients",
    highlightTextEs: "Gestión Profesional de Cuentas",
    highlightTextEn: "Professional Client Management",
    featuresEs: [
      "Directorio unificado de clientes con filtros rápidos",
      "Control de facturación estimada por Retainer",
      "Notas estratégicas específicas para cada marca",
    ],
    featuresEn: [
      "Unified client directory with smart filters",
      "Estimated Retainer billing tracking",
      "Brand-specific strategic notes",
    ],
  },
  {
    id: 4,
    titleEs: "Campañas Estratégicas",
    titleEn: "Strategic Campaigns",
    descriptionEs: "Define el rumbo de tus esfuerzos publicitarios. Crea planes tácticos, asigna presupuestos y plataformas (Meta Ads, Google, TikTok) y monitorea el estado del embudo.",
    descriptionEn: "Define the course of your advertising efforts. Create tactical plans, allocate budgets and channels, and monitor funnel health.",
    icon: Zap,
    path: "/campaigns",
    targetId: "sidebar-campaigns",
    highlightTextEs: "Motor de Activación Táctica",
    highlightTextEn: "Tactical Activation Engine",
    featuresEs: [
      "Presupuestos y distribución por canales",
      "Monitoreo de estado de implementación",
      "Seguimiento ágil por cliente y responsable",
    ],
    featuresEn: [
      "Budgets and channel distribution setup",
      "Deployment status tracking",
      "Agile owner and client assignments",
    ],
  },
  {
    id: 5,
    titleEs: "Planificador y Calendario",
    titleEn: "Planner & Timeline",
    descriptionEs: "Organiza tus lanzamientos visualmente. Programa hitos, distribuye las campañas a lo largo del tiempo y coordina fechas clave para evitar solapamientos.",
    descriptionEn: "Organize your launches visually. Schedule milestones, distribute campaigns across timelines, and coordinate key dates to prevent tactical overlaps.",
    icon: Calendar,
    path: "/planner",
    targetId: "sidebar-planner",
    highlightTextEs: "Línea Temporal de Lanzamientos",
    highlightTextEn: "Launch Timeline & Calendar",
    featuresEs: [
      "Calendario interactivo mensual de despliegue",
      "Control de hitos por cliente y color representativo",
      "Vistas organizadas para evitar cuellos de botella",
    ],
    featuresEn: [
      "Interactive monthly deployment calendar",
      "Client-specific color-coded milestones",
      "Organized views to eliminate bottlenecks",
    ],
  },
  {
    id: 6,
    titleEs: "Ideas y Brainstorming",
    titleEn: "Ideas & Brainstorming",
    descriptionEs: "La incubadora creativa del equipo. Registra ideas al vuelo, clasifícalas por categoría o red social y conviértelas en piezas de contenido publicables.",
    descriptionEn: "Your team's creative incubator. Record ideas instantly, organize by category or social channel, and turn them into publishable content pieces.",
    icon: Brain,
    path: "/ideas",
    targetId: "sidebar-ideas",
    highlightTextEs: "Fábrica Creativa de Contenidos",
    highlightTextEn: "Creative Content Factory",
    featuresEs: [
      "Banco ágil de ideas con categorías personalizadas",
      "Programación directa de borradores de contenido",
      "Planificación de copys listos para publicar",
    ],
    featuresEn: [
      "Agile idea board with custom categories",
      "Direct content draft creation and scheduling",
      "Publish-ready copywriting planning",
    ],
  },
  {
    id: 7,
    titleEs: "Gestión de Contenidos",
    titleEn: "Content Management",
    descriptionEs: "El pipeline editorial completo. Crea, revisa, aprueba y programa piezas de contenido para todos tus canales (Instagram, TikTok, YouTube, LinkedIn) desde un único lugar.",
    descriptionEn: "The complete editorial pipeline. Create, review, approve and schedule content pieces across all your channels from a single place.",
    icon: FileText,
    path: "/content",
    targetId: "sidebar-content",
    highlightTextEs: "Pipeline Editorial Centralizado",
    highlightTextEn: "Centralized Editorial Pipeline",
    featuresEs: [
      "Flujo editorial completo: borrador → publicado",
      "Programación y calendarización por canal",
      "Control de aprobaciones y revisiones del equipo",
    ],
    featuresEn: [
      "Full editorial flow: draft → published",
      "Scheduling and calendaring by channel",
      "Team review and approval management",
    ],
  },
  {
    id: 8,
    titleEs: "Biblioteca de Recursos",
    titleEn: "Resource Library",
    descriptionEs: "El repositorio centralizado de conocimiento. Guarda enlaces esenciales (Drive, Figma, Canva), briefs, manuales operativos y guías de marca de cada cliente.",
    descriptionEn: "Your centralized knowledge repository. Store essential links (Drive, Figma, Canva), organize briefs, and access client brand guides in one secure spot.",
    icon: FolderOpen,
    path: "/library",
    targetId: "sidebar-library",
    highlightTextEs: "Base de Conocimiento Compartido",
    highlightTextEn: "Shared Knowledge Base",
    featuresEs: [
      "Enlaces compartidos organizados por marca y tipo",
      "Acceso directo a briefs y assets estratégicos",
      "Ahorro masivo de tiempo en búsqueda de recursos",
    ],
    featuresEn: [
      "Shared links sorted by brand and resource type",
      "Direct access to briefs and brand assets",
      "Massive time savings on daily assets lookup",
    ],
  },
  {
    id: 9,
    titleEs: "Analíticas y Reportes",
    titleEn: "Analytics & Reports",
    descriptionEs: "Mide el impacto real de tus operaciones. Visualiza KPIs, snapshots de rendimiento y el historial de métricas de cada workspace para tomar decisiones basadas en datos.",
    descriptionEn: "Measure the real impact of your operations. Visualize KPIs, performance snapshots, and historical metrics for data-driven decisions.",
    icon: BarChart3,
    path: "/analytics",
    targetId: "sidebar-analytics",
    highlightTextEs: "Centro de Inteligencia de Datos",
    highlightTextEn: "Data Intelligence Center",
    featuresEs: [
      "Snapshots históricos de rendimiento por workspace",
      "KPIs consolidados de campañas y clientes",
      "Visualización de tendencias y métricas clave",
    ],
    featuresEn: [
      "Historical performance snapshots by workspace",
      "Consolidated campaign and client KPIs",
      "Trend visualization and key metric tracking",
    ],
  },
  {
    id: 10,
    titleEs: "Tu Equipo y Colaboradores",
    titleEn: "Your Team & Collaborators",
    descriptionEs: "Gestiona los miembros de tu agencia. Invita a colaboradores, asigna roles (editor, manager, cliente) y mantén la seguridad del workspace con control de acceso granular.",
    descriptionEn: "Manage your agency members. Invite collaborators, assign roles (editor, manager, client) and keep workspace security with granular access control.",
    icon: Users,
    path: "/team",
    targetId: "sidebar-team",
    highlightTextEs: "Colaboración Segura y Controlada",
    highlightTextEn: "Secure & Controlled Collaboration",
    featuresEs: [
      "Invitaciones por email con roles personalizados",
      "Control de acceso granular por sección",
      "Portal de clientes para visibilidad externa segura",
    ],
    featuresEn: [
      "Email invites with custom role assignments",
      "Granular access control per section",
      "Client portal for secure external visibility",
    ],
  },
];

interface FloatPosition {
  top: number;
  left: number;
  placement: "right" | "center";
}

function useElementPosition(targetId: string | null, active: boolean) {
  const [pos, setPos] = useState<FloatPosition | null>(null);

  const compute = useCallback(() => {
    if (!targetId || !active) { setPos(null); return; }
    const el = document.getElementById(targetId);
    if (!el || window.innerWidth < 768) {
      setPos({ top: 0, left: 0, placement: "center" });
      return;
    }
    const rect = el.getBoundingClientRect();
    const cardWidth = 400;
    const gap = 12;
    const top = rect.top + rect.height / 2;
    const left = rect.right + gap;
    if (left + cardWidth > window.innerWidth) {
      setPos({ top, left: rect.left - cardWidth - gap, placement: "right" });
    } else {
      setPos({ top, left, placement: "right" });
    }

    el.classList.add("tour-highlight", "tour-highlight-glow");
    return () => el.classList.remove("tour-highlight", "tour-highlight-glow");
  }, [targetId, active]);

  useEffect(() => {
    if (!active) return;
    const cleanups: (() => void)[] = [];

    const run = () => {
      const cleanup = compute();
      if (cleanup) cleanups.push(cleanup);
    };

    run();
    const t1 = setTimeout(run, 100);
    const t2 = setTimeout(run, 400);
    const t3 = setTimeout(run, 800);

    window.addEventListener("resize", run);
    return () => {
      clearTimeout(t1); clearTimeout(t2); clearTimeout(t3);
      window.removeEventListener("resize", run);
      cleanups.forEach((fn) => fn());
      if (targetId) {
        const el = document.getElementById(targetId);
        el?.classList.remove("tour-highlight", "tour-highlight-glow");
      }
    };
  }, [active, compute, targetId]);

  return pos;
}

export function OnboardingTour() {
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) || "es";
  const { user, profile } = useAuth();
  const supabase = createClient();
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const handleOpenTour = () => {
      setCurrentStep(0);
      setIsOpen(true);
      localStorage.setItem("mkt-notes-tour-active", "true");
      localStorage.setItem("mkt-notes-tour-current-step", "0");
    };
    window.addEventListener("open-onboarding-tour", handleOpenTour);
    return () => {
      window.removeEventListener("open-onboarding-tour", handleOpenTour);
    };
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;

    // 1. Check if we have an active tour running (across page transitions or refreshes)
    const active = localStorage.getItem("mkt-notes-tour-active") === "true";
    if (active) {
      const savedStep = localStorage.getItem("mkt-notes-tour-current-step");
      if (savedStep) {
        setCurrentStep(parseInt(savedStep, 10));
      }
      setIsOpen(true);
    } else if (profile?.onboarding_done) {
      // 2. Otherwise handle default new-user auto-start
      localStorage.setItem("mkt-notes-tour-completed", "true");
    } else {
      const completed = localStorage.getItem("mkt-notes-tour-completed");
      if (!completed) {
        timer = setTimeout(() => {
          localStorage.setItem("mkt-notes-tour-active", "true");
          localStorage.setItem("mkt-notes-tour-current-step", "0");
          setCurrentStep(0);
          setIsOpen(true);
        }, 1500);
      }
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [profile]);

  const step = (TOUR_STEPS[currentStep] || TOUR_STEPS[0]) as TourStep;
  const pos = useElementPosition(step.targetId, isOpen);

  if (!isOpen) {
    return (
      <button
        onClick={() => {
          localStorage.setItem("mkt-notes-tour-active", "true");
          localStorage.setItem("mkt-notes-tour-current-step", "0");
          setCurrentStep(0);
          setIsOpen(true);
        }}
        className="fixed bottom-6 right-6 z-[40] flex h-11 items-center gap-2 rounded-full border border-brand/20 bg-card px-4 text-xs font-bold text-foreground shadow-lg shadow-brand/5 backdrop-blur-md transition-all duration-300 hover:border-brand/40 hover:scale-[1.05] active:scale-[0.98] group"
        title={locale === "es" ? "Ayuda y Guía de Inicio" : "Help & System Guide"}
      >
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-brand" />
        </span>
        <HelpCircle size={14} className="opacity-60 group-hover:opacity-100 transition-opacity" />
        <span className="uppercase tracking-widest text-[9px] font-black">{locale === "es" ? "Guía" : "Guide"}</span>
      </button>
    );
  }

  const isLastStep = currentStep === TOUR_STEPS.length - 1;
  const isFirstStep = currentStep === 0;
  const isFloating = pos !== null && pos.placement === "right";
  const isCentered = !isFloating;

  const title = locale === "es" ? step.titleEs : step.titleEn;
  const description = locale === "es" ? step.descriptionEs : step.descriptionEn;
  const highlight = locale === "es" ? step.highlightTextEs : step.highlightTextEn;
  const features = locale === "es" ? step.featuresEs : step.featuresEn;
  const IconComponent = step.icon;

  const handleNext = () => {
    if (isLastStep) { handleComplete(); return; }
    const nextIdx = currentStep + 1;
    const nextStep = TOUR_STEPS[nextIdx];
    if (nextStep) {
      localStorage.setItem("mkt-notes-tour-current-step", String(nextIdx));
      setCurrentStep(nextIdx);
      router.push(`/${locale}${nextStep.path}`);
    }
  };

  const handlePrev = () => {
    if (isFirstStep) return;
    const prevIdx = currentStep - 1;
    const prevStep = TOUR_STEPS[prevIdx];
    if (prevStep) {
      localStorage.setItem("mkt-notes-tour-current-step", String(prevIdx));
      setCurrentStep(prevIdx);
      router.push(`/${locale}${prevStep.path}`);
    }
  };

  const handleComplete = async () => {
    localStorage.removeItem("mkt-notes-tour-active");
    localStorage.removeItem("mkt-notes-tour-current-step");
    localStorage.setItem("mkt-notes-tour-completed", "true");
    setIsOpen(false);

    try {
      if (user) {
        await supabase
          .from("profiles")
          .update({ onboarding_done: true })
          .eq("id", user.id);
      }
    } catch (error) {
      console.error("Error updating onboarding_done in tour:", error);
    }

    toast.success(
      locale === "es"
        ? "¡Excelente! Has completado el recorrido. Ya estás listo para despegar."
        : "Excellent! You have completed the tour. You are now ready to launch."
    );
  };

  const handleTeleport = () => {
    router.push(`/${locale}${step.path}`);
  };

  const cardContent = (
    <Card
      className={cn(
        "relative overflow-hidden border border-brand/20 bg-card/95 shadow-2xl backdrop-blur-md rounded-2xl animate-in zoom-in-95 duration-300",
        isFloating
          ? "w-[400px] flex flex-col"
          : "w-full max-w-2xl flex flex-col md:flex-row h-auto md:h-[460px]"
      )}
    >
      {/* Decorative lights */}
      <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 h-40 w-40 rounded-full bg-brand/10 blur-[60px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 translate-x-1/2 translate-y-1/2 h-40 w-40 rounded-full bg-primary/10 blur-[60px] pointer-events-none" />

      {/* Floating compact header */}
      {isFloating ? (
        <div className="flex-1 p-5 flex flex-col relative">
          <button
            onClick={handleComplete}
            className="absolute top-3 right-3 text-muted-foreground/60 hover:text-foreground hover:bg-accent/50 p-1.5 rounded-full transition-colors z-10"
          >
            <X size={14} />
          </button>

          {/* Step badge + icon row */}
          <div className="flex items-center gap-3 mb-3">
            <div className="flex items-center justify-center h-9 w-9 rounded-full bg-brand/10 border border-brand/20 shrink-0">
              <IconComponent size={18} className="text-brand" />
            </div>
            <div className="flex flex-col gap-0.5">
              <Badge variant="outline" className="self-start uppercase tracking-widest text-[9px] font-bold border-brand/20 bg-brand/5 text-brand">
                {locale === "es" ? `Paso ${step.id} / ${TOUR_STEPS.length}` : `Step ${step.id} / ${TOUR_STEPS.length}`}
              </Badge>
              <span className="text-[10px] font-bold text-brand/70 uppercase tracking-widest">{highlight}</span>
            </div>
          </div>

          <h2 className="text-base font-black text-foreground mb-2 leading-snug tracking-tight">{title}</h2>
          <p className="text-xs text-muted-foreground leading-relaxed mb-3">{description}</p>

          {/* Features */}
          <div className="space-y-1.5 mb-4 bg-accent/5 p-3 rounded-xl border border-border/60">
            {features.map((feat, i) => (
              <div key={i} className="flex items-center gap-2 text-xs text-foreground/80 font-medium">
                <CheckCircle2 size={12} className="text-success shrink-0" />
                <span>{feat}</span>
              </div>
            ))}
          </div>

          {/* Progress bar */}
          <div className="h-0.5 bg-muted/40 w-full rounded-full overflow-hidden mb-4">
            <div
              className="h-full bg-gradient-to-r from-brand to-primary transition-all duration-300 rounded-full"
              style={{ width: `${((currentStep + 1) / TOUR_STEPS.length) * 100}%` }}
            />
          </div>

          {/* Dot stepper */}
          <div className="flex gap-1 mb-4 justify-center">
            {TOUR_STEPS.map((stepItem, i) => (
              <button
                key={i}
                onClick={() => {
                  localStorage.setItem("mkt-notes-tour-current-step", String(i));
                  setCurrentStep(i);
                  router.push(`/${locale}${stepItem.path}`);
                }}
                className={cn("h-1.5 rounded-full transition-all duration-300", currentStep === i ? "bg-brand w-4" : "bg-muted-foreground/30 w-1.5 hover:bg-muted-foreground/50")}
              />
            ))}
          </div>

          {/* Nav buttons */}
          <div className="flex items-center justify-between">
            <button onClick={handleComplete} className="text-xs text-muted-foreground/50 hover:text-muted-foreground font-semibold uppercase tracking-widest transition-colors">
              {locale === "es" ? "Omitir" : "Skip Tour"}
            </button>
            <div className="flex gap-2">
              {!isFirstStep && (
                <Button variant="outline" size="sm" onClick={handlePrev} className="h-8 rounded-sm border-border text-[10px] uppercase px-3">
                  <ChevronLeft size={12} className="mr-1" />
                  {locale === "es" ? "Atrás" : "Back"}
                </Button>
              )}
              <Button
                size="sm"
                onClick={handleNext}
                className={cn("h-8 rounded-sm text-[10px] uppercase px-3 shadow-lg", isLastStep ? "bg-success text-white hover:bg-success/90" : "bg-brand text-white hover:opacity-90")}
              >
                {isLastStep ? (
                  <>{locale === "es" ? "Comenzar" : "Start"} <CheckCircle2 size={12} className="ml-1.5" /></>
                ) : (
                  <>{locale === "es" ? "Siguiente" : "Next"} <ChevronRight size={12} className="ml-1" /></>
                )}
              </Button>
            </div>
          </div>
        </div>
      ) : (
        /* Centered modal layout (same as original two-panel design) */
        <>
          {/* LEFT PANEL */}
          <div className="w-full md:w-[220px] bg-accent/5 border-b md:border-b-0 md:border-r border-border p-6 flex flex-col items-center justify-center relative shrink-0">
            <div className="relative flex items-center justify-center h-24 w-24 rounded-full bg-brand/10 border border-brand/20 animate-pulse">
              <div className="absolute inset-0 rounded-full border border-dashed border-brand/30 animate-spin" style={{ animationDuration: "12s" }} />
              <IconComponent size={40} className="text-brand relative z-10" />
            </div>

            <Badge variant="outline" className="mt-6 uppercase tracking-widest text-[9px] font-bold border-brand/20 bg-brand/5 text-brand">
              {locale === "es" ? `Paso ${step.id} de ${TOUR_STEPS.length}` : `Step ${step.id} of ${TOUR_STEPS.length}`}
            </Badge>

            {step.path !== "/dashboard" && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleTeleport}
                className="mt-6 h-8 rounded-full border border-border bg-card hover:bg-accent hover:text-foreground text-[10px] font-black uppercase tracking-widest group px-3"
              >
                <Eye size={12} className="mr-1.5 opacity-60 group-hover:opacity-100" />
                {locale === "es" ? "Inspeccionar" : "Inspect Section"}
              </Button>
            )}

            <div className="flex gap-1.5 mt-8 md:mt-auto">
              {TOUR_STEPS.map((stepItem, i) => (
                <button
                  key={i}
                  onClick={() => {
                    localStorage.setItem("mkt-notes-tour-current-step", String(i));
                    setCurrentStep(i);
                    router.push(`/${locale}${stepItem.path}`);
                  }}
                  className={cn("h-1.5 w-1.5 rounded-full transition-all duration-300", currentStep === i ? "bg-brand w-4" : "bg-muted-foreground/30 hover:bg-muted-foreground/50")}
                />
              ))}
            </div>
          </div>

          {/* RIGHT PANEL */}
          <div className="flex-1 p-6 flex flex-col h-full relative">
            <button
              onClick={handleComplete}
              className="absolute top-4 right-4 text-muted-foreground/60 hover:text-foreground hover:bg-accent/50 p-1.5 rounded-full transition-colors z-10"
              title={locale === "es" ? "Omitir" : "Skip"}
            >
              <X size={16} />
            </button>

            <div className="flex items-center gap-2 mb-2">
              <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
              <span className="text-[10px] uppercase tracking-widest text-brand/80 font-bold">{highlight}</span>
            </div>

            <h2 className="text-xl font-black text-foreground mb-3 leading-snug tracking-tight">{title}</h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4 flex-1">{description}</p>

            <div className="space-y-2.5 mb-6 bg-accent/5 p-4 rounded-xl border border-border/60">
              <span className="text-[9px] uppercase tracking-widest text-muted-foreground opacity-50 block mb-1 font-bold">
                {locale === "es" ? "Lo que puedes hacer aquí:" : "What you can do here:"}
              </span>
              {features.map((feat, i) => (
                <div key={i} className="flex items-center gap-2.5 text-xs text-foreground/80 font-medium">
                  <CheckCircle2 size={13} className="text-success shrink-0" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>

            <div className="h-1 bg-muted/40 w-full rounded-full overflow-hidden mb-5">
              <div
                className="h-full bg-gradient-to-r from-brand to-primary transition-all duration-300 rounded-full"
                style={{ width: `${((currentStep + 1) / TOUR_STEPS.length) * 100}%` }}
              />
            </div>

            <div className="flex items-center justify-between mt-auto">
              <button onClick={handleComplete} className="text-xs text-muted-foreground/50 hover:text-muted-foreground font-semibold uppercase tracking-widest transition-colors">
                {locale === "es" ? "Omitir" : "Skip Tour"}
              </button>
              <div className="flex gap-2">
                {!isFirstStep && (
                  <Button variant="outline" size="sm" onClick={handlePrev} className="h-9 rounded-sm border-border text-[10px] uppercase">
                    <ChevronLeft size={14} className="mr-1" />
                    {locale === "es" ? "Atrás" : "Back"}
                  </Button>
                )}
                <Button
                  size="sm"
                  onClick={handleNext}
                  className={cn("h-9 rounded-sm text-[10px] uppercase shadow-lg", isLastStep ? "bg-success text-white hover:bg-success/90 shadow-success/15" : "bg-brand text-white hover:opacity-90 shadow-brand/15")}
                >
                  {isLastStep ? (
                    <>{locale === "es" ? "Comenzar" : "Get Started"} <CheckCircle2 size={14} className="ml-1.5" /></>
                  ) : (
                    <>{locale === "es" ? "Siguiente" : "Next"} <ChevronRight size={14} className="ml-1" /></>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </Card>
  );

  if (isFloating && pos) {
    return (
      <>
        {/* Subtle overlay without blocking clicks */}
        <div className="fixed inset-0 z-[9998] bg-background/40 backdrop-blur-[2px] pointer-events-none animate-in fade-in duration-300" />
        <div
          className="fixed z-[9999] animate-in fade-in slide-in-from-left-2 duration-300"
          style={{ top: Math.max(8, pos.top - 220), left: Math.max(8, pos.left) }}
        >
          {/* Arrow pointing left toward sidebar */}
          <div className="absolute -left-2 top-[48px] w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-r-[8px] border-r-border/50" />
          {cardContent}
        </div>
      </>
    );
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      {cardContent}
    </div>
  );
}
