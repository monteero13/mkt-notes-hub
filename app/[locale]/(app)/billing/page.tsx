'use client';

import { DashboardLayout } from "@/components/DashboardLayout";
import { CreditCard, Zap, CheckCircle2, ArrowRight, Loader2, Wallet, ChevronRight, Hash } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useWorkspace } from "@/hooks/use-workspace";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { handleCreatePortalSession } from "@/lib/stripe-actions";
import { useState } from "react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import Link from "next/link";

export default function BillingPage() {
  const { user, profile, isLoading: authLoading } = useAuth();
  const { isPro, activeWorkspace, isLoading: wsLoading } = useWorkspace();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const t = useTranslations("billing");

  const isLoading = authLoading || wsLoading;

  const handleManageBilling = async () => {
    setIsRedirecting(true);
    try {
      await handleCreatePortalSession();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsRedirecting(false);
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
      <div className="flex flex-col h-full bg-background">
        {/* Top Control Header */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-border px-4 sm:px-8">
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
            <div className="technical-label text-[9px] opacity-40 uppercase tracking-widest">{t("header.encryption")}</div>
            <Wallet size={16} className="text-muted-foreground/30" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 lg:p-8">
          <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6 lg:space-y-8">
            <div className="flex flex-col gap-1">
              <div className="technical-label text-brand">{t("subtitle")}</div>
              <h1 className="text-4xl font-light tracking-tight" style={{ fontFamily: "var(--font-clash), sans-serif" }}>{t("title")}</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
              {/* Current Plan Card */}
              <div className={cn(
                "lg:col-span-2 border rounded-sm overflow-hidden relative group transition-all shadow-sm",
                isPro ? "border-brand bg-brand/5" : "border-border bg-card"
              )}>
                <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-10 relative z-10">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="technical-label text-[10px] text-foreground flex items-center gap-2 uppercase tracking-wider">
                        {isPro ? <Zap size={12} className="text-brand fill-brand/20" /> : <CreditCard size={12} className="opacity-40" />}
                        {t("current_plan.title")}
                      </div>
                      <h2 className="text-2xl font-light tracking-tight" style={{ fontFamily: "var(--font-clash), sans-serif" }}>
                        {isPro ? t("current_plan.pro_badge") : t("current_plan.standard_badge")}
                      </h2>
                    </div>
                    <div className={cn(
                      "technical-label text-[9px] px-3 py-1.5 border rounded-sm font-black tracking-widest uppercase",
                      isPro ? "border-brand text-brand bg-brand/10 shadow-[0_0_15px_rgba(var(--brand-rgb),0.1)]" : "border-border text-muted-foreground opacity-40 bg-muted"
                    )}>
                      {isPro ? t("current_plan.active_badge") : t("current_plan.standard_badge")}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { label: t("current_plan.features.campaigns"), value: isPro ? t("current_plan.features.unlimited") : '1' },
                      { label: t("current_plan.features.team"), value: isPro ? t("current_plan.features.unlimited") : `3 ${t("current_plan.features.nodes")}` },
                      { label: t("current_plan.features.storage"), value: isPro ? '10.0 GB' : '500.0 MB' },
                      { label: t("current_plan.features.support"), value: isPro ? t("current_plan.features.support_247") : t("current_plan.features.support_standard") },
                    ].map((item, i) => (
                      <div key={i} className="p-5 border border-border bg-background/40 backdrop-blur-sm rounded-sm group/item transition-colors hover:border-brand/30">
                        <p className="technical-label text-[8px] opacity-40 mb-2 uppercase tracking-widest">{item.label}</p>
                        <p className="text-[12px] font-black text-foreground uppercase tracking-tight">{item.value}</p>
                      </div>
                    ))}
                  </div>

                  <div className="pt-8 border-t border-border flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="technical-label text-[8px] opacity-40 uppercase tracking-widest">{t("current_plan.status_label")}</div>
                      <p className="text-[11px] font-bold text-muted-foreground/60 uppercase tracking-tight">
                        {isPro ? t("current_plan.status_pro") : t("current_plan.status_free")}
                      </p>
                    </div>
                    {isPro ? (
                      <Button
                        onClick={handleManageBilling}
                        disabled={isRedirecting}
                        className="h-10 rounded-sm bg-brand text-white technical-label text-[10px] px-10 hover:opacity-90 transition-all font-black uppercase tracking-widest shadow-lg shadow-brand/20"
                      >
                        {isRedirecting ? <Loader2 className="h-4 w-4 animate-spin" /> : t("current_plan.manage_btn")}
                      </Button>
                    ) : (
                      <Button
                        asChild
                        className="h-10 rounded-sm bg-brand text-white technical-label text-[10px] px-10 hover:opacity-90 transition-all font-black uppercase tracking-widest shadow-lg shadow-brand/20"
                      >
                        <Link href="/pricing">
                          {t("current_plan.upgrade_btn")}
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>

                <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none group-hover:opacity-[0.05] transition-opacity">
                  <Zap size={240} className="text-brand" />
                </div>
              </div>

              {/* Side Specs */}
              <div className="space-y-6">
                <div className="border border-border bg-card p-8 rounded-sm space-y-6 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-brand/20" />
                  <h3 className="technical-label text-foreground text-[10px] uppercase tracking-[0.2em]">{t("perks.title")}</h3>
                  <div className="space-y-4">
                    {[
                      { key: 'content', icon: CheckCircle2 },
                      { key: 'analytics', icon: CheckCircle2 },
                      { key: 'brand', icon: CheckCircle2 },
                      { key: 'governance', icon: CheckCircle2 },
                      { key: 'ai', icon: CheckCircle2 }
                    ].map((feat, i) => (
                      <div key={i} className="flex items-center gap-3 text-[10px] font-black text-muted-foreground/50 uppercase tracking-tight">
                        <feat.icon size={13} className="text-brand shrink-0 opacity-60" />
                        {t(`perks.items.${feat.key}`)}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border border-brand/20 bg-brand/5 p-8 rounded-sm text-center space-y-5 shadow-inner">
                  <div className="space-y-2">
                    <p className="technical-label text-brand text-[9px] uppercase tracking-widest">{t("support.title")}</p>
                    <p className="text-[11px] font-bold text-muted-foreground/60 uppercase tracking-tight leading-relaxed">{t("support.desc")}</p>
                  </div>
                  <Button variant="outline" className="w-full border-brand/20 text-brand technical-label text-[10px] h-9 hover:bg-brand hover:text-white transition-all uppercase font-black" asChild>
                    <a href="mailto:[13albertomontero.profesional@gmail.com]">13albertomontero.profesional@gmail.com</a>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
