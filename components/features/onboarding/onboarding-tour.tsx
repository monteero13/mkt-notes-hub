"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  LayoutDashboard,
  Users,
  Zap,
  Calendar,
  Brain,
  FolderOpen,
  ChevronRight,
  ChevronLeft,
  X,
  Sparkles,
  Play,
  HelpCircle,
  Eye,
  CheckCircle2,
  ArrowRight,
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
    highlightTextEs: "Centro de Inteligencia de Marketing",
    highlightTextEn: "Marketing Intelligence Hub",
    featuresEs: [
      "Planificación y tracking en tiempo real",
      "Administración ágil de clientes y retainers",
      "Colaboración segura y organizada para tu equipo"
    ],
    featuresEn: [
      "Real-time strategic planning & tracking",
      "Agile client & retainer administration",
      "Secure, organized team collaboration"
    ]
  },
  {
    id: 2,
    titleEs: "Centro de Mando (Dashboard)",
    titleEn: "Command Center (Dashboard)",
    descriptionEs: "La pantalla principal del sistema. Aquí puedes monitorear de un solo vistazo el progreso de tus objetivos anuales, realizar un seguimiento de tus tareas pendientes y observar el estado general del espacio de trabajo.",
    descriptionEn: "The main core of the platform. Here, you can monitor your annual strategic objectives, track pending operational tasks, and review overall workspace health at a glance.",
    icon: LayoutDashboard,
    path: "/dashboard",
    highlightTextEs: "Tu Cabina de Pilotaje Táctica",
    highlightTextEn: "Your Tactical Cockpit",
    featuresEs: [
      "Estadísticas clave consolidadas en tiempo real",
      "Control directo sobre objetivos estratégicos",
      "Alertas rápidas y actividades recientes del equipo"
    ],
    featuresEn: [
      "Consolidated real-time key metrics",
      "Direct control over strategic objectives",
      "Fast alerts and team activity feed"
    ]
  },
  {
    id: 3,
    titleEs: "Clientes y Cuentas",
    titleEn: "Clients & Accounts",
    descriptionEs: "El corazón de tu negocio. Registra y administra tus clientes activos, asocia contactos principales, define presupuestos, y realiza un seguimiento automático de tu valor de Retainer mensual.",
    descriptionEn: "The heart of your business. Register and manage active clients, link main contacts, define strategic scopes, and keep automated track of monthly retainer values.",
    icon: Users,
    path: "/clients",
    highlightTextEs: "Gestión Profesional de Cuentas",
    highlightTextEn: "Professional Client Management",
    featuresEs: [
      "Directorio unificado de clientes con filtros rápidos",
      "Control de facturación estimada por Retainer",
      "Notas estratégicas específicas para cada marca"
    ],
    featuresEn: [
      "Unified client directory with smart filters",
      "Estimated Retainer billing tracking",
      "Brand-specific strategic notes"
    ]
  },
  {
    id: 4,
    titleEs: "Campañas Estratégicas",
    titleEn: "Strategic Campaigns",
    descriptionEs: "Define el rumbo de tus esfuerzos publicitarios. Crea planes tácticos para tus clientes, asigna presupuestos y plataformas (Meta Ads, Google, TikTok) y monitorea el estado del embudo.",
    descriptionEn: "Define the course of your advertising efforts. Create strategic plans for your clients, allocate budgets and channels (Meta Ads, Google, TikTok), and monitor funnel health.",
    icon: Zap,
    path: "/campaigns",
    highlightTextEs: "Motor de Activación Táctica",
    highlightTextEn: "Tactical Activation Engine",
    featuresEs: [
      "Presupuestos y distribución por canales",
      "Monitoreo de estado de implementación",
      "Seguimiento ágil por cliente y responsable"
    ],
    featuresEn: [
      "Budgets and channel distribution setup",
      "Deployment status tracking",
      "Agile owner and client assignments"
    ]
  },
  {
    id: 5,
    titleEs: "Planificador y Calendario",
    titleEn: "Planner & Timeline",
    descriptionEs: "Organiza tus lanzamientos y entregas visualmente. Programa hitos, distribuye las campañas a lo largo del tiempo y coordina las fechas clave para evitar solapamientos estratégicos.",
    descriptionEn: "Organize your launches and deliverables visually. Schedule milestones, distribute campaigns across calendar timelines, and coordinate key dates to prevent tactical overlaps.",
    icon: Calendar,
    path: "/planner",
    highlightTextEs: "Línea Temporal de Lanzamientos",
    highlightTextEn: "Launch Timeline & Calendar",
    featuresEs: [
      "Calendario interactivo mensual de despliegue",
      "Control de hitos por cliente y color representativo",
      "Vistas organizadas para evitar cuellos de botella"
    ],
    featuresEn: [
      "Interactive monthly deployment calendar",
      "Client-specific color-coded milestones",
      "Organized views to eliminate bottlenecks"
    ]
  },
  {
    id: 6,
    titleEs: "Cofre de Ideas y Contenidos",
    titleEn: "Idea Chest & Content Vault",
    descriptionEs: "La incubadora creativa del equipo. No dejes que ninguna idea se pierda: regístralas rápidamente, clasifícalas por categoría o red social y prográmalas para convertirlas en piezas publicadas.",
    descriptionEn: "Your team's creative incubator. Never lose a great idea: record ideas instantly, organize them by category or social channel, and schedule them to become live content pieces.",
    icon: Brain,
    path: "/ideas",
    highlightTextEs: "Fábrica Creativa de Contenidos",
    highlightTextEn: "Creative Content Factory",
    featuresEs: [
      "Banco ágil de ideas con categorías personalizadas",
      "Programación directa de borradores de contenido",
      "Planificación y calendarización de copys listos para publicar"
    ],
    featuresEn: [
      "Agile idea board with custom categories",
      "Direct content draft creation and scheduling",
      "Publish-ready copywriting planning"
    ]
  },
  {
    id: 7,
    titleEs: "Biblioteca de Recursos",
    titleEn: "Resource Library",
    descriptionEs: "El repositorio centralizado de conocimiento. Guarda enlaces esenciales (carpetas de Drive, Figma, Canva), almacena briefs, manuales operativos y plantillas de marca de cada cliente.",
    descriptionEn: "Your centralized knowledge repository. Store essential links (Drive folders, Figma, Canva), organize briefs, and access client brand style guides in one secure spot.",
    icon: FolderOpen,
    path: "/library",
    highlightTextEs: "Base de Conocimiento Compartido",
    highlightTextEn: "Shared Knowledge Base",
    featuresEs: [
      "Enlaces compartidos organizados por marca y tipo",
      "Acceso directo a briefs y assets estratégicos",
      "Ahorro masivo de tiempo en la búsqueda de recursos"
    ],
    featuresEn: [
      "Shared links sorted by brand and resource type",
      "Direct access to briefs and brand assets",
      "Massive time savings on daily assets lookup"
    ]
  }
];

export function OnboardingTour() {
  const router = useRouter();
  const params = useParams();
  const locale = params?.locale || "es";
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    // Check if user has already completed the tour
    const completed = localStorage.getItem("mkt-notes-tour-completed");
    if (!completed) {
      // Auto open tour with a tiny delay for gorgeous transition
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
    return () => {};
  }, []);

  if (!isOpen) {
    // Show a small premium trigger button in the corner to relaunch anytime
    return (
      <button
        onClick={() => {
          setCurrentStep(0);
          setIsOpen(true);
        }}
        className="fixed bottom-6 right-6 z-[40] flex h-11 items-center gap-2 rounded-full border border-brand/20 bg-card px-4 text-xs font-bold text-foreground shadow-lg shadow-brand/5 backdrop-blur-md transition-all duration-300 hover:border-brand/40 hover:scale-[1.05] active:scale-[0.98] group"
        title={locale === "es" ? "Ayuda y Guía de Inicio" : "Help & System Guide"}
      >
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-brand"></span>
        </span>
        <HelpCircle size={14} className="opacity-60 group-hover:opacity-100 transition-opacity" />
        <span className="uppercase tracking-widest text-[9px] font-black">{locale === "es" ? "Guía" : "Guide"}</span>
      </button>
    );
  }

  const step = (TOUR_STEPS[currentStep] || TOUR_STEPS[0]) as TourStep;
  const isLastStep = currentStep === TOUR_STEPS.length - 1;
  const isFirstStep = currentStep === 0;

  const handleNext = () => {
    if (isLastStep) {
      handleComplete();
    } else {
      const nextIdx = currentStep + 1;
      const nextStep = TOUR_STEPS[nextIdx];
      if (nextStep) {
        setCurrentStep(nextIdx);
        router.push(`/${locale}${nextStep.path}`);
      }
    }
  };

  const handlePrev = () => {
    if (!isFirstStep) {
      const prevIdx = currentStep - 1;
      const prevStep = TOUR_STEPS[prevIdx];
      if (prevStep) {
        setCurrentStep(prevIdx);
        router.push(`/${locale}${prevStep.path}`);
      }
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = () => {
    localStorage.setItem("mkt-notes-tour-completed", "true");
    setIsOpen(false);
    toast.success(
      locale === "es"
        ? "¡Excelente! Has completado el recorrido. Ya estás listo para despegar."
        : "Excellent! You have completed the tour. You are now ready to launch."
    );
  };

  const handleTeleport = () => {
    const activeStep = (TOUR_STEPS[currentStep] || TOUR_STEPS[0]) as TourStep;
    router.push(`/${locale}${activeStep.path}`);
    toast.info(
      locale === "es"
        ? `Navegando a la sección: ${activeStep.titleEs}`
        : `Navigating to section: ${activeStep.titleEn}`
    );
  };

  const IconComponent = step.icon;
  const title = locale === "es" ? step.titleEs : step.titleEn;
  const description = locale === "es" ? step.descriptionEs : step.descriptionEn;
  const highlight = locale === "es" ? step.highlightTextEs : step.highlightTextEn;
  const features = locale === "es" ? step.featuresEs : step.featuresEn;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <Card className="relative w-full max-w-2xl overflow-hidden border border-brand/20 bg-card/95 shadow-2xl backdrop-blur-md rounded-2xl animate-in zoom-in-95 duration-300 flex flex-col md:flex-row h-auto md:h-[460px]">
        {/* Decorative background lights */}
        <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 h-40 w-40 rounded-full bg-brand/10 blur-[60px] pointer-events-none" />
        <div className="absolute bottom-0 right-0 translate-x-1/2 translate-y-1/2 h-40 w-40 rounded-full bg-primary/10 blur-[60px] pointer-events-none" />

        {/* LEFT PANEL: Visual Icon Showcase with Tech Styling */}
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

          {/* Indicator Dot Stepper */}
          <div className="flex gap-1.5 mt-8 md:mt-auto">
            {TOUR_STEPS.map((stepItem, i) => (
              <button
                key={i}
                onClick={() => {
                  setCurrentStep(i);
                  router.push(`/${locale}${stepItem.path}`);
                }}
                className={cn(
                  "h-1.5 w-1.5 rounded-full transition-all duration-300",
                  currentStep === i ? "bg-brand w-4" : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                )}
              />
            ))}
          </div>
        </div>

        {/* RIGHT PANEL: Explanations and Navigation */}
        <div className="flex-1 p-6 flex flex-col h-full relative">
          {/* Close button */}
          <button
            onClick={handleSkip}
            className="absolute top-4 right-4 text-muted-foreground/60 hover:text-foreground hover:bg-accent/50 p-1.5 rounded-full transition-colors z-10"
            title={locale === "es" ? "Omitir" : "Skip"}
          >
            <X size={16} />
          </button>

          {/* Technical sub-header */}
          <div className="flex items-center gap-2 mb-2">
            <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
            <span className="technical-label text-[10px] uppercase tracking-widest text-brand/80">{highlight}</span>
          </div>

          {/* Title and Description */}
          <h2 className="text-xl font-black text-foreground mb-3 leading-snug tracking-tight">
            {title}
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-4 flex-1">
            {description}
          </p>

          {/* Features check list */}
          <div className="space-y-2.5 mb-6 bg-accent/5 p-4 rounded-xl border border-border/60">
            <span className="technical-label text-[9px] uppercase tracking-widest text-muted-foreground opacity-50 block mb-1">
              {locale === "es" ? "Lo que puedes hacer aquí:" : "What you can do here:"}
            </span>
            {features.map((feat, index) => (
              <div key={index} className="flex items-center gap-2.5 text-xs text-foreground/80 font-medium">
                <CheckCircle2 size={13} className="text-success shrink-0" />
                <span>{feat}</span>
              </div>
            ))}
          </div>

          {/* Progress Bar */}
          <div className="h-1 bg-muted/40 w-full rounded-full overflow-hidden mb-5">
            <div
              className="h-full bg-gradient-to-r from-brand to-primary transition-all duration-300 rounded-full"
              style={{ width: `${((currentStep + 1) / TOUR_STEPS.length) * 100}%` }}
            />
          </div>

          {/* Controls Bar */}
          <div className="flex items-center justify-between mt-auto">
            <button
              onClick={handleSkip}
              className="text-xs text-muted-foreground/50 hover:text-muted-foreground font-semibold uppercase tracking-widest transition-colors"
            >
              {locale === "es" ? "Omitir" : "Skip Tour"}
            </button>

            <div className="flex gap-2">
              {!isFirstStep && (
                <Button variant="outline" size="sm" onClick={handlePrev} className="h-9 rounded-sm border-border technical-label text-[10px] uppercase">
                  <ChevronLeft size={14} className="mr-1" />
                  {locale === "es" ? "Atrás" : "Back"}
                </Button>
              )}

              <Button
                size="sm"
                onClick={handleNext}
                className={cn(
                  "h-9 rounded-sm technical-label text-[10px] uppercase shadow-lg",
                  isLastStep
                    ? "bg-success text-white hover:bg-success/90 shadow-success/15"
                    : "bg-brand text-white hover:opacity-90 shadow-brand/15"
                )}
              >
                {isLastStep ? (
                  <>
                    {locale === "es" ? "Comenzar" : "Get Started"}
                    <CheckCircle2 size={14} className="ml-1.5" />
                  </>
                ) : (
                  <>
                    {locale === "es" ? "Siguiente" : "Next"}
                    <ChevronRight size={14} className="ml-1" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
