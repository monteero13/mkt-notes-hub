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
  Trash2,
  Mail,
  Send
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useWorkspace } from "@/hooks/use-workspace";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { handleCreateCheckoutSession, handleCreatePortalSession } from "@/lib/stripe-actions";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function BillingPage() {
  const { user, profile, isLoading: authLoading } = useAuth();
  const { isPro, activeWorkspace, isLoading: wsLoading } = useWorkspace();
  const queryClient = useQueryClient();
  const t = useTranslations("billing");
  const params = useParams();
  const locale = params?.locale || "es";

  // Local Interactive States
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'yearly'>('monthly');
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [isPortalLoading, setIsPortalLoading] = useState(false);

  // Contact Form State
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [contactSubject, setContactSubject] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactHoneypot, setContactHoneypot] = useState('');
  const [isContactSubmitting, setIsContactSubmitting] = useState(false);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);

  // Manage client-side submission cooldown
  useEffect(() => {
    const checkCooldown = () => {
      const lastSubmit = localStorage.getItem('mkt-notes-last-support-submit');
      if (lastSubmit) {
        const diff = Date.now() - parseInt(lastSubmit, 10);
        const remaining = Math.ceil((60000 - diff) / 1000);
        if (remaining > 0) {
          setCooldownSeconds(remaining);
          return;
        }
      }
      setCooldownSeconds(0);
    };

    checkCooldown();
    const interval = setInterval(checkCooldown, 1000);
    return () => clearInterval(interval);
  }, [isContactOpen]);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Honeypot check (immediate silent check)
    if (contactHoneypot.trim() !== '') {
      setIsContactOpen(false);
      toast.success(
        locale === 'es'
          ? 'Mensaje enviado correctamente. Nos pondremos en contacto pronto.'
          : 'Message sent successfully. We will contact you soon.'
      );
      return;
    }

    // Client-side cooldown check
    if (cooldownSeconds > 0) {
      toast.error(
        locale === 'es'
          ? `Por favor, espera ${cooldownSeconds} segundos antes de enviar otro mensaje.`
          : `Please wait ${cooldownSeconds} seconds before sending another message.`
      );
      return;
    }

    if (contactSubject.trim().length < 3 || contactSubject.length > 100) {
      toast.error(
        locale === 'es'
          ? 'El asunto debe tener entre 3 y 100 caracteres.'
          : 'Subject must be between 3 and 100 characters.'
      );
      return;
    }

    if (contactMessage.trim().length < 10 || contactMessage.length > 1000) {
      toast.error(
        locale === 'es'
          ? 'El mensaje debe tener entre 10 y 1000 caracteres.'
          : 'Message must be between 10 and 1000 characters.'
      );
      return;
    }

    try {
      setIsContactSubmitting(true);
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: 'ayuda',
          subject: contactSubject,
          message: contactMessage,
          honeypot: contactHoneypot,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Error sending message');
      }

      // Success! Set cooldown in localStorage and state
      localStorage.setItem('mkt-notes-last-support-submit', Date.now().toString());
      setCooldownSeconds(60);

      toast.success(
        locale === 'es'
          ? 'Mensaje enviado correctamente. Nos pondremos en contacto pronto.'
          : 'Message sent successfully. We will contact you soon.'
      );

      // Reset form and close modal
      setContactSubject('');
      setContactMessage('');
      setContactHoneypot('');
      setIsContactOpen(false);
    } catch (err: any) {
      toast.error(err.message || 'Error sending message');
    } finally {
      setIsContactSubmitting(false);
    }
  };

  const isLoading = authLoading || wsLoading;

  const handleUpgradeRealStripe = async () => {
    if (!activeWorkspace?.id) {
      toast.error("No hay un espacio de trabajo activo seleccionado.");
      return;
    }

    setIsUpgrading(true);
    try {
      const priceId = process.env.NEXT_PUBLIC_STRIPE_PREMIUM_PRICE_ID || "price_1TM6WkJxysYhy7Uh5CHD9h5q";
      await handleCreateCheckoutSession(priceId);
    } catch (err: any) {
      if (err.message?.includes("NEXT_REDIRECT") || err.digest?.includes("NEXT_REDIRECT")) {
        throw err;
      }
      toast.error(`Error al abrir la pasarela de Stripe: ${err.message}`);
    } finally {
      setIsUpgrading(false);
    }
  };

  const handleManageSubscription = async () => {
    if (!activeWorkspace?.id) {
      toast.error("No hay un espacio de trabajo activo seleccionado.");
      return;
    }

    setIsPortalLoading(true);
    try {
      await handleCreatePortalSession();
    } catch (err: any) {
      if (err.message?.includes("NEXT_REDIRECT") || err.digest?.includes("NEXT_REDIRECT")) {
        throw err;
      }
      toast.error(`Error al abrir el portal de facturación de Stripe: ${err.message}`);
    } finally {
      setIsPortalLoading(false);
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
                      onClick={handleUpgradeRealStripe}
                      disabled={isUpgrading}
                      className="w-full h-10 mt-8 rounded-lg bg-brand text-white hover:opacity-95 transition-all uppercase font-black text-[9px] tracking-widest shadow-lg shadow-brand/20 flex items-center justify-center gap-2"
                    >
                      {isUpgrading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Conectando...
                        </>
                      ) : (
                        <>
                          Mejorar a Pro <ArrowRight size={12} />
                        </>
                      )}
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
                      <p className="technical-label text-[8px] opacity-45 uppercase tracking-widest">Gestión de Cuenta</p>
                      <p className="text-xs font-bold text-muted-foreground/80 flex items-center gap-1.5 uppercase">
                        <Calendar size={12} className="text-brand opacity-60" />
                        Usa el portal de Stripe para actualizar facturas o cancelar
                      </p>
                    </div>
                    <Button
                      onClick={handleManageSubscription}
                      disabled={isPortalLoading}
                      className="h-10 bg-brand text-white hover:bg-brand/90 rounded-lg text-[9px] px-6 transition-all font-black uppercase tracking-widest flex items-center justify-center gap-1.5 shadow-lg shadow-brand/20"
                    >
                      {isPortalLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Conectando...
                        </>
                      ) : (
                        "Gestionar Suscripción"
                      )}
                    </Button>
                  </div>
                </div>

                {/* Right Column: Support Card */}
                <div className="space-y-6">
                  {/* Customer support card */}
                  <div className="border border-border bg-card p-6 rounded-xl text-center space-y-4">
                    <div className="space-y-1.5">
                      <p className="technical-label text-brand text-[8px] uppercase tracking-widest font-bold">
                        {locale === 'es' ? '¿Necesitas Ayuda?' : 'Need Help?'}
                      </p>
                      <p className="text-[11px] text-muted-foreground/80 leading-relaxed">
                        {locale === 'es'
                          ? '¿Tienes dudas con tus facturas o deseas migrar tu método de pago?'
                          : 'Do you have questions about your invoices or want to migrate your payment method?'}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      className="w-full border-border hover:bg-card text-[10px] h-9 transition-all uppercase font-black tracking-wider cursor-pointer"
                      onClick={() => {
                        setContactSubject(locale === 'es' ? 'Duda sobre Facturación' : 'Billing Inquiry');
                        setIsContactOpen(true);
                      }}
                    >
                      {locale === 'es' ? 'Contactar Facturación' : 'Contact Billing'}
                    </Button>
                  </div>
                </div>

              </div>
            )}

          </div>
        </div>

      </div>

      {/* Interactive Billing Support Dialog */}
      <Dialog open={isContactOpen} onOpenChange={setIsContactOpen}>
        <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden border border-border bg-background shadow-2xl rounded-2xl">
          <div className="p-8">
            <DialogHeader className="mb-6 text-left">
              <DialogTitle className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand/10 text-brand">
                  <Mail size={16} />
                </div>
                {locale === 'es' ? 'Soporte de Facturación' : 'Billing Support'}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-1">
                {locale === 'es'
                  ? 'Completa el siguiente formulario para enviarnos tu consulta de forma directa y segura. Te responderemos en un plazo máximo de 24 horas.'
                  : 'Complete the form below to send us your inquiry directly and securely. We will reply within 24 hours.'}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleContactSubmit} className="space-y-5">
              {/* Honey Pot to block robotic spammers */}
              <div className="absolute opacity-0 pointer-events-none -z-10 h-0 w-0 overflow-hidden">
                <label>Do not fill this field</label>
                <input
                  type="text"
                  value={contactHoneypot}
                  onChange={(e) => setContactHoneypot(e.target.value)}
                  tabIndex={-1}
                  autoComplete="off"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] technical-label text-muted-foreground/80 uppercase tracking-wider ml-0.5">
                  {locale === 'es' ? 'Asunto' : 'Subject'}
                </label>
                <Input
                  required
                  placeholder={locale === 'es' ? 'Ej: Error en cargo duplicado, cambio de tarjeta...' : 'e.g., Duplicate charge error, change card...'}
                  value={contactSubject}
                  onChange={(e) => setContactSubject(e.target.value)}
                  className="h-11 border-border bg-background rounded-xl text-xs font-semibold focus-visible:ring-brand px-4"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] technical-label text-muted-foreground/80 uppercase tracking-wider ml-0.5">
                  {locale === 'es' ? 'Mensaje o Detalles' : 'Message or Details'}
                </label>
                <Textarea
                  required
                  placeholder={locale === 'es' ? 'Describe detalladamente tu solicitud indicando los datos necesarios...' : 'Describe your request in detail, providing any necessary details...'}
                  rows={5}
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                  className="border-border bg-background rounded-xl text-xs font-medium focus-visible:ring-brand px-4 py-3 resize-none"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsContactOpen(false)}
                  disabled={isContactSubmitting}
                  className="h-10 rounded-xl text-xs font-bold text-muted-foreground hover:bg-muted"
                >
                  {locale === 'es' ? 'Cancelar' : 'Cancel'}
                </Button>

                <Button
                  type="submit"
                  disabled={isContactSubmitting || cooldownSeconds > 0}
                  className="h-10 rounded-xl bg-brand text-white hover:bg-brand/90 text-xs font-black uppercase tracking-widest flex items-center gap-1.5 px-5 shadow-lg shadow-brand/10"
                >
                  {isContactSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : cooldownSeconds > 0 ? (
                    `${cooldownSeconds}s`
                  ) : (
                    <>
                      {locale === 'es' ? 'Enviar' : 'Send'}
                      <Send size={12} />
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
