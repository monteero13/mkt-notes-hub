'use client';

import { DashboardLayout } from "@/components/DashboardLayout";
import {
  CreditCard,
  Zap,
  CheckCircle2,
  ArrowRight,
  Loader2,
  Wallet,
  ChevronRight,
  Shield,
  Lock,
  Landmark,
  Calendar,
  Download,
  AlertTriangle,
  Sparkles,
  Trash2
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useWorkspace } from "@/hooks/use-workspace";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { simulateUpgradeToPro, simulateCancelSubscription } from "@/lib/stripe-actions";
import { useState } from "react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { useQueryClient } from "@tanstack/react-query";

export default function BillingPage() {
  const { profile, isLoading: authLoading } = useAuth();
  const { isPro, activeWorkspace, isLoading: wsLoading } = useWorkspace();
  const queryClient = useQueryClient();
  const t = useTranslations("billing");

  // Local Interactive States
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'yearly'>('monthly');
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isCancelConfirmOpen, setIsCancelConfirmOpen] = useState(false);
  
  // Simulation Processing states
  const [isProcessing, setIsProcessing] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [isCanceling, setIsCanceling] = useState(false);

  const isLoading = authLoading || wsLoading;

  // Invoice Lists mock representation
  const mockInvoices = [
    { id: "INV-2026-003", date: "07 May 2026", amount: billingInterval === 'monthly' ? "€29.00" : "€290.00", status: "Paid" },
    { id: "INV-2026-002", date: "07 Apr 2026", amount: "€29.00", status: "Paid" },
    { id: "INV-2026-001", date: "07 Mar 2026", amount: "€29.00", status: "Paid" },
  ];

  const handleDownloadInvoice = (invoiceId: string) => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 1200)),
      {
        loading: `Generando PDF para la factura ${invoiceId}...`,
        success: `Factura ${invoiceId}.pdf descargada correctamente (Simulado).`,
        error: "Error al generar la descarga.",
      }
    );
  };

  const startCheckoutSimulation = async () => {
    if (!activeWorkspace?.id) {
      toast.error("No hay un espacio de trabajo activo seleccionado.");
      return;
    }

    setIsProcessing(true);
    setLogs([]);

    const steps = [
      "Iniciando pasarela de pago segura...",
      "Estableciendo canal SSL v1.3 cifrado de 256 bits...",
      "Validando credenciales de tarjeta Visa (4242)...",
      "Procesando pago con banco emisor de forma segura...",
      "Autorización de transacción recibida con éxito (Ref: tx_981a2f)...",
      "Comunicando con el servidor de aprovisionamiento de Mkt Notes Hub...",
      "Actualizando cuotas de base de datos para Workspace...",
      "Suscripción PRO activada de forma persistente en Supabase.",
    ];

    for (let i = 0; i < steps.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, i === 4 ? 1200 : 600));
      setLogs((prev) => [...prev, `[SYSTEM] ${steps[i]}`]);
    }

    try {
      await simulateUpgradeToPro(activeWorkspace.id, 'pro', billingInterval);
      toast.success("¡Suscripción PRO activada con éxito!");
      queryClient.invalidateQueries({ queryKey: ['auth-user'] });
      queryClient.invalidateQueries({ queryKey: ['workspace-subscription', activeWorkspace.id] });
    } catch (err: any) {
      toast.error(`Error al procesar la simulación: ${err.message}`);
    } finally {
      setIsProcessing(false);
      setIsCheckoutOpen(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!activeWorkspace?.id) {
      toast.error("No hay un espacio de trabajo activo seleccionado.");
      return;
    }

    setIsCanceling(true);
    try {
      await simulateCancelSubscription(activeWorkspace.id);
      toast.success("Tu suscripción ha sido cancelada. Has regresado al plan gratuito.");
      queryClient.invalidateQueries({ queryKey: ['auth-user'] });
      queryClient.invalidateQueries({ queryKey: ['workspace-subscription', activeWorkspace.id] });
    } catch (err: any) {
      toast.error(`Error al cancelar la suscripción: ${err.message}`);
    } finally {
      setIsCanceling(false);
      setIsCancelConfirmOpen(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex h-screen items-center justify-center bg-background">
          <Loader2 className="h-8 w-8 animate-spin text-brand/20" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col h-full bg-background relative overflow-hidden">
        {/* Top Control Header */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-border px-4 sm:px-8 relative z-20">
          <div className="flex items-center gap-4">
            <div className="technical-label text-[11px] text-foreground">{t("header.title")}</div>
            <div className="h-4 w-[1px] bg-border" />
            <div className="flex items-center gap-2 text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
              <span>{t("header.breadcrumb")}</span>
              <ChevronRight size={12} className="opacity-30" />
              <span className="text-brand">{profile?.full_name?.split(' ')[0]}</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="technical-label text-[9px] opacity-40 uppercase tracking-widest flex items-center gap-1.5">
              <Lock size={10} className="text-brand" />
              {t("header.encryption")}
            </div>
            <Wallet size={16} className="text-muted-foreground/30" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 lg:p-8 relative z-10">
          <div className="max-w-6xl mx-auto space-y-8">
            
            {/* Header section with badge */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div className="space-y-1">
                <div className="technical-label text-brand flex items-center gap-1.5 uppercase">
                  <Sparkles size={12} className="animate-pulse" />
                  Módulo de Facturación Sandbox
                </div>
                <h1 className="text-4xl font-light tracking-tight" style={{ fontFamily: "var(--font-clash), sans-serif" }}>
                  {t("title")}
                </h1>
              </div>

              {/* Status indicator pill */}
              <div className={cn(
                "w-fit border px-4 py-2 rounded-xl flex items-center gap-2 shadow-sm transition-all duration-300",
                isPro 
                  ? "border-brand/40 bg-brand/5 shadow-[0_0_15px_rgba(var(--brand-rgb),0.05)] text-brand"
                  : "border-border bg-card/60 text-muted-foreground"
              )}>
                <div className={cn("w-2 h-2 rounded-full animate-pulse", isPro ? "bg-brand" : "bg-muted-foreground/40")} />
                <span className="text-xs font-black uppercase tracking-widest">
                  {isPro ? "Workspace Pro Activo" : "Workspace Free Activo"}
                </span>
              </div>
            </div>

            {/* MAIN CORE LOGIC DEPENDING ON SUBSCRIBER PLAN STATUS */}
            {!isPro ? (
              /* --- FREE TIERS AND UPGRADE SELECTIONS --- */
              <div className="space-y-8 animate-fade-in">
                {/* Switcher Intervalo */}
                <div className="flex items-center justify-between p-4 border border-border bg-card/40 rounded-xl max-w-md">
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-foreground uppercase tracking-wider">Intervalo de Facturación</p>
                    <p className="text-[10px] text-muted-foreground/80">Selecciona el ciclo de cobro de tu licencia</p>
                  </div>
                  <div className="flex gap-1 p-1 bg-background border border-border rounded-lg">
                    <button
                      onClick={() => setBillingInterval('monthly')}
                      className={cn(
                        "px-3 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-md transition-all",
                        billingInterval === 'monthly' ? "bg-brand text-white" : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      Mensual
                    </button>
                    <button
                      onClick={() => setBillingInterval('yearly')}
                      className={cn(
                        "px-3 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-md transition-all flex items-center gap-1",
                        billingInterval === 'yearly' ? "bg-brand text-white" : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      Anual <span className="text-[8px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1 rounded-sm">-17%</span>
                    </button>
                  </div>
                </div>

                {/* Plans Grid layout */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Plan Gratuito Card */}
                  <div className="border border-border bg-card/30 p-8 rounded-xl flex flex-col justify-between relative group hover:border-border/60 transition-all">
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <span className="technical-label text-muted-foreground text-[8px] uppercase tracking-widest">Nivel Inicial</span>
                        <h3 className="text-xl font-light" style={{ fontFamily: "var(--font-clash), sans-serif" }}>Free Plan</h3>
                        <p className="text-xs text-muted-foreground/80 min-h-[2.5rem]">Para marketers individuales experimentando con la plataforma.</p>
                      </div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-light" style={{ fontFamily: "var(--font-clash), sans-serif" }}>€0</span>
                        <span className="text-xs text-muted-foreground/60 font-semibold uppercase tracking-wider">/ siempre</span>
                      </div>
                      <div className="h-[1px] bg-border" />
                      <div className="space-y-3">
                        {[
                          { label: "1 campaña activa", active: true },
                          { label: "Hasta 3 miembros", active: true },
                          { label: "500 MB de almacenamiento", active: true },
                          { label: "Soporte estándar", active: true },
                          { label: "IA Creativa Avanzada", active: false },
                          { label: "Analítica e Informes PDF", active: false }
                        ].map((feat, i) => (
                          <div key={i} className="flex items-center gap-2.5 text-[10px] font-bold tracking-tight uppercase">
                            <CheckCircle2 size={12} className={feat.active ? "text-brand opacity-65" : "text-muted-foreground/20"} />
                            <span className={feat.active ? "text-muted-foreground/80" : "text-muted-foreground/30 line-through"}>{feat.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <Button
                      disabled
                      className="w-full h-10 mt-8 rounded-lg bg-muted text-muted-foreground/40 border border-border uppercase font-black text-[9px] tracking-widest cursor-not-allowed"
                    >
                      Plan Actual
                    </Button>
                  </div>

                  {/* Plan PRO Card (Destacado) */}
                  <div className="border border-brand/40 bg-brand/5 p-8 rounded-xl flex flex-col justify-between relative group hover:border-brand shadow-[0_4px_30px_rgba(var(--brand-rgb),0.02)] transition-all">
                    <div className="absolute top-4 right-4 bg-brand/20 border border-brand/40 text-brand text-[8px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full">
                      Recomendado
                    </div>
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <span className="technical-label text-brand text-[8px] uppercase tracking-widest">Escala tu Agencia</span>
                        <h3 className="text-xl font-light" style={{ fontFamily: "var(--font-clash), sans-serif" }}>Pro Plan</h3>
                        <p className="text-xs text-muted-foreground/80 min-h-[2.5rem]">Para agencias de marketing y equipos que necesitan capacidad de escala.</p>
                      </div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-light text-foreground" style={{ fontFamily: "var(--font-clash), sans-serif" }}>
                          {billingInterval === 'monthly' ? "€29" : "€24"}
                        </span>
                        <span className="text-xs text-muted-foreground/60 font-semibold uppercase tracking-wider">/ mes</span>
                      </div>
                      <div className="h-[1px] bg-brand/20" />
                      <div className="space-y-3">
                        {[
                          { label: "Campañas ilimitadas", active: true },
                          { label: "Miembros ilimitados", active: true },
                          { label: "10 GB de almacenamiento", active: true },
                          { label: "Soporte Ejecutivo 24/7", active: true },
                          { label: "IA Creativa Avanzada (Ilimitada)", active: true },
                          { label: "Analítica Avanzada e Informes", active: true }
                        ].map((feat, i) => (
                          <div key={i} className="flex items-center gap-2.5 text-[10px] font-bold tracking-tight uppercase">
                            <CheckCircle2 size={12} className="text-brand" />
                            <span className="text-muted-foreground/80">{feat.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <Button
                      onClick={() => setIsCheckoutOpen(true)}
                      className="w-full h-10 mt-8 rounded-lg bg-brand text-white hover:opacity-95 transition-all uppercase font-black text-[9px] tracking-widest shadow-lg shadow-brand/20"
                    >
                      Mejorar a Pro <ArrowRight size={12} className="ml-2" />
                    </Button>
                  </div>

                  {/* Plan Enterprise Card */}
                  <div className="border border-border bg-card/30 p-8 rounded-xl flex flex-col justify-between relative group hover:border-border/60 transition-all">
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <span className="technical-label text-muted-foreground text-[8px] uppercase tracking-widest">Grandes Corporaciones</span>
                        <h3 className="text-xl font-light" style={{ fontFamily: "var(--font-clash), sans-serif" }}>Enterprise</h3>
                        <p className="text-xs text-muted-foreground/80 min-h-[2.5rem]">Para agencias consolidadas que requieren marca blanca y SLAs estrictos.</p>
                      </div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-light" style={{ fontFamily: "var(--font-clash), sans-serif" }}>
                          {billingInterval === 'monthly' ? "€99" : "€82"}
                        </span>
                        <span className="text-xs text-muted-foreground/60 font-semibold uppercase tracking-wider">/ mes</span>
                      </div>
                      <div className="h-[1px] bg-border" />
                      <div className="space-y-3">
                        {[
                          { label: "Todo lo del plan Pro e ilimitado" },
                          { label: "Marca blanca y dominio propio" },
                          { label: "Onboarding VIP personalizado" },
                          { label: "Gerente de cuentas de éxito exclusivo" },
                          { label: "SLA de soporte garantizado de 1h" },
                          { label: "Auditoría de logs avanzada" }
                        ].map((feat, i) => (
                          <div key={i} className="flex items-center gap-2.5 text-[10px] font-bold tracking-tight uppercase">
                            <CheckCircle2 size={12} className="text-brand opacity-65" />
                            <span className="text-muted-foreground/80">{feat.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      className="w-full h-10 mt-8 rounded-lg border-border hover:bg-card uppercase font-black text-[9px] tracking-widest text-muted-foreground"
                      onClick={() => {
                        toast.info("Por favor, ponte en contacto escribiendo a: 13albertomontero.profesional@gmail.com");
                      }}
                    >
                      Contactar Ventas
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              /* --- PRO USER MANAGEMENT PANEL --- */
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
                
                {/* Active Plan Card Details */}
                <div className="lg:col-span-2 border border-brand/30 bg-brand/5 rounded-xl p-6 sm:p-8 space-y-6 relative overflow-hidden shadow-[0_4px_35px_rgba(var(--brand-rgb),0.02)]">
                  <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
                    <Zap size={200} className="text-brand" />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <span className="technical-label text-brand text-[8px] uppercase tracking-widest flex items-center gap-1.5 font-bold">
                        <Shield size={12} />
                        Suscripción Corporativa
                      </span>
                      <h2 className="text-2xl font-light tracking-tight" style={{ fontFamily: "var(--font-clash), sans-serif" }}>
                        Plan Profesional (Pro)
                      </h2>
                    </div>
                    <div className="border border-brand text-brand bg-brand/10 text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg shadow-[0_0_15px_rgba(var(--brand-rgb),0.08)]">
                      Suscripción Activa
                    </div>
                  </div>

                  <div className="h-[1px] bg-brand/15" />

                  {/* Quota details blocks */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { label: "Capacidad de Campañas", value: "Ilimitado", desc: "No hay cuota de proyectos" },
                      { label: "Miembros del Equipo", value: "Ilimitado", desc: "Invita a tu equipo sin límites" },
                      { label: "Almacenamiento de Datos", value: "10.0 GB", desc: "Espacio de assets de marca" },
                      { label: "Soporte al Cliente", value: "Ejecutivo 24/7", desc: "Acceso preferente prioritario" }
                    ].map((item, i) => (
                      <div key={i} className="p-4 border border-border/40 bg-background/50 backdrop-blur-sm rounded-xl hover:border-brand/30 transition-colors">
                        <p className="technical-label text-[8px] opacity-40 uppercase tracking-widest mb-1">{item.label}</p>
                        <p className="text-[13px] font-black text-foreground uppercase tracking-tight">{item.value}</p>
                        <p className="text-[9px] text-muted-foreground/60 mt-1">{item.desc}</p>
                      </div>
                    ))}
                  </div>

                  {/* Period renewal details and triggers */}
                  <div className="pt-6 border-t border-brand/15 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <p className="technical-label text-[8px] opacity-45 uppercase tracking-widest">Próximo Cobro</p>
                      <p className="text-xs font-bold text-muted-foreground/80 flex items-center gap-1.5 uppercase">
                        <Calendar size={12} className="text-brand opacity-60" />
                        07 de Junio de 2026 (€29.00 EUR)
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => setIsCancelConfirmOpen(true)}
                      className="h-10 border-red-500/20 text-red-400 hover:bg-red-500/5 hover:text-red-300 rounded-lg text-[9px] px-6 transition-all font-black uppercase tracking-widest"
                    >
                      Cancelar Suscripción
                    </Button>
                  </div>
                </div>

                {/* Right Column: Simulated Invoice History & Support Card */}
                <div className="space-y-6">
                  {/* Invoices List panel */}
                  <div className="border border-border bg-card p-6 rounded-xl space-y-4 shadow-sm">
                    <div className="space-y-1">
                      <span className="technical-label text-foreground text-[8px] uppercase tracking-widest font-bold">Registro Contable</span>
                      <h4 className="text-sm font-semibold tracking-tight text-foreground">Historial de Facturación</h4>
                    </div>
                    <div className="h-[1px] bg-border" />
                    
                    <div className="space-y-2.5">
                      {mockInvoices.map((inv) => (
                        <div key={inv.id} className="flex items-center justify-between p-3 border border-border/40 rounded-lg hover:bg-accent/5 transition-colors">
                          <div className="space-y-0.5">
                            <p className="text-[10px] font-black uppercase text-foreground">{inv.id}</p>
                            <p className="text-[9px] text-muted-foreground/60">{inv.date}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] font-bold text-muted-foreground/80">{inv.amount}</span>
                            <button
                              onClick={() => handleDownloadInvoice(inv.id)}
                              className="p-1.5 text-muted-foreground/40 hover:text-brand border border-border/60 hover:border-brand/20 bg-background hover:bg-brand/5 rounded-md transition-colors"
                            >
                              <Download size={11} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Customer support card */}
                  <div className="border border-border bg-card p-6 rounded-xl text-center space-y-4">
                    <div className="space-y-1.5">
                      <p className="technical-label text-brand text-[8px] uppercase tracking-widest font-bold">¿Necesitas Ayuda?</p>
                      <p className="text-[11px] text-muted-foreground/80 leading-relaxed">¿Tienes dudas con tus facturas o deseas migrar tu método de pago?</p>
                    </div>
                    <Button variant="outline" className="w-full border-border hover:bg-card text-[10px] h-9 transition-all uppercase font-black tracking-wider" asChild>
                      <a href="mailto:13albertomontero.profesional@gmail.com">Contactar Facturación</a>
                    </Button>
                  </div>
                </div>

              </div>
            )}

          </div>
        </div>

        {/* --- MODAL 1: CHECKOUT GATEWAY STRIPE SIMULATOR --- */}
        {isCheckoutOpen && (
          <div className="fixed inset-0 bg-background/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-card border border-border rounded-xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row animate-scale-up">
              
              {/* Product overview side column */}
              <div className="md:w-5/12 bg-accent/20 border-r border-border p-6 sm:p-8 flex flex-col justify-between relative">
                <div className="space-y-6">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-brand flex items-center justify-center text-white font-black text-xs">M</div>
                    <span className="text-xs font-black uppercase tracking-widest text-foreground">MKT.NOTES</span>
                  </div>
                  <div className="space-y-1.5">
                    <span className="technical-label text-brand text-[8px] uppercase tracking-widest">Resumen del pedido</span>
                    <h4 className="text-xl font-light" style={{ fontFamily: "var(--font-clash), sans-serif" }}>Licencia Pro Plan</h4>
                    <p className="text-[10px] text-muted-foreground/60">Servicios profesionales para agencias en la nube.</p>
                  </div>
                </div>

                <div className="space-y-4 pt-8 md:pt-0">
                  <div className="h-[1px] bg-border" />
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs text-muted-foreground">Total hoy:</span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-light text-foreground" style={{ fontFamily: "var(--font-clash), sans-serif" }}>
                        {billingInterval === 'monthly' ? "€29.00" : "€290.00"}
                      </span>
                      <span className="text-[9px] text-muted-foreground uppercase font-black">{billingInterval === 'monthly' ? "EUR/mes" : "EUR/año"}</span>
                    </div>
                  </div>
                  <div className="text-[9px] text-muted-foreground/50 text-right">IVA e impuestos locales incluidos.</div>
                </div>
              </div>

              {/* Secure payment form / terminal simulator side column */}
              <div className="md:w-7/12 p-6 sm:p-8 flex flex-col justify-center relative min-h-[350px]">
                {!isProcessing ? (
                  <div className="space-y-6 animate-fade-in">
                    <div className="space-y-1">
                      <span className="technical-label text-emerald-400 text-[8px] uppercase tracking-widest font-bold flex items-center gap-1">
                        <Lock size={10} /> Pasarela Segura (Sandbox)
                      </span>
                      <h4 className="text-base font-semibold tracking-tight text-foreground">Detalles de la Transacción</h4>
                    </div>

                    <div className="space-y-4">
                      {/* Card information mock-up fields */}
                      <div className="space-y-1.5">
                        <label className="technical-label text-[8px] opacity-40 uppercase tracking-widest">Número de Tarjeta</label>
                        <div className="relative">
                          <input
                            type="text"
                            readOnly
                            value="4242 •••• •••• 4242"
                            className="w-full bg-background border border-border px-3 py-2 text-xs rounded-lg text-foreground font-mono focus:outline-none"
                          />
                          <CreditCard size={14} className="absolute right-3 top-3 text-muted-foreground/40" />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="technical-label text-[8px] opacity-40 uppercase tracking-widest">Vencimiento</label>
                          <input
                            type="text"
                            readOnly
                            value="12 / 28"
                            className="w-full bg-background border border-border px-3 py-2 text-xs rounded-lg text-foreground font-mono focus:outline-none"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="technical-label text-[8px] opacity-40 uppercase tracking-widest">CVC / CVV</label>
                          <input
                            type="text"
                            readOnly
                            value="123"
                            className="w-full bg-background border border-border px-3 py-2 text-xs rounded-lg text-foreground font-mono focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="technical-label text-[8px] opacity-40 uppercase tracking-widest">Titular de la Tarjeta</label>
                        <input
                          type="text"
                          readOnly
                          value={profile?.full_name || "Alberto Montero"}
                          className="w-full bg-background border border-border px-3 py-2 text-xs rounded-lg text-foreground font-bold uppercase tracking-wide focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                      <Button
                        variant="outline"
                        onClick={() => setIsCheckoutOpen(false)}
                        className="w-1/2 h-10 border-border text-muted-foreground text-[10px] rounded-lg uppercase font-black tracking-widest hover:bg-accent/5"
                      >
                        Cancelar
                      </Button>
                      <Button
                        onClick={startCheckoutSimulation}
                        className="w-1/2 h-10 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] rounded-lg uppercase font-black tracking-widest shadow-lg shadow-emerald-600/10 flex items-center justify-center gap-1"
                      >
                        <Shield size={12} /> Confirmar Pago
                      </Button>
                    </div>
                  </div>
                ) : (
                  /* --- SUBMIT PROCESSING TERMINAL LOGGER --- */
                  <div className="space-y-6 animate-fade-in flex flex-col justify-between h-full py-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin text-brand" />
                        <span className="text-xs font-black uppercase tracking-widest text-foreground">Procesando Transacción...</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground/60">No cierres esta ventana. Conectando con los procesadores bancarios.</p>
                    </div>

                    {/* Monospaced simulator terminal container */}
                    <div className="flex-1 bg-black/60 border border-border/80 rounded-xl p-4 font-mono text-[9px] space-y-1.5 text-left text-emerald-400 overflow-y-auto max-h-[160px] custom-scrollbar shadow-inner select-none">
                      {logs.map((log, i) => (
                        <div key={i} className="leading-relaxed opacity-90">
                          <span className="text-muted-foreground/50">[{new Date().toLocaleTimeString()}]</span> {log}
                        </div>
                      ))}
                      <div className="w-1.5 h-3 bg-emerald-400 animate-ping inline-block ml-1" />
                    </div>

                    <div className="text-[9px] text-center text-muted-foreground/40 flex items-center justify-center gap-1">
                      <Lock size={10} /> Canal cifrado mediante seguridad bancaria SSL AES-256.
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

        {/* --- MODAL 2: CANCEL SUBSCRIPTION CONFIRMATION DIALOG --- */}
        {isCancelConfirmOpen && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-card border border-border rounded-xl w-full max-w-md overflow-hidden shadow-2xl p-6 space-y-6 animate-scale-up text-center">
              
              <div className="mx-auto w-12 h-12 bg-red-500/10 border border-red-500/20 text-red-400 rounded-full flex items-center justify-center">
                <AlertTriangle size={20} />
              </div>

              <div className="space-y-2">
                <h4 className="text-base font-semibold tracking-tight text-foreground">¿Seguro que deseas cancelar?</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Perderás el acceso inmediato a la creación ilimitada de campañas, la analítica pro y el hub de distribución directa de contenidos. Tu workspace volverá a los límites del plan Free.
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setIsCancelConfirmOpen(false)}
                  disabled={isCanceling}
                  className="w-1/2 h-10 border-border text-muted-foreground text-[10px] rounded-lg uppercase font-black tracking-widest hover:bg-accent/5"
                >
                  Volver Atrás
                </Button>
                <Button
                  onClick={handleCancelSubscription}
                  disabled={isCanceling}
                  className="w-1/2 h-10 bg-red-600 hover:bg-red-500 text-white text-[10px] rounded-lg uppercase font-black tracking-widest shadow-lg shadow-red-600/15 flex items-center justify-center gap-1.5"
                >
                  {isCanceling ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Trash2 size={12} /> Confirmar Cancelación
                    </>
                  )}
                </Button>
              </div>

            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
