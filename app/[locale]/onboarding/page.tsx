'use client';

import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import { Building2, Loader2, Rocket } from "lucide-react";

import { useTranslations } from "next-intl";

import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useEffect } from "react";
import { createWorkspace, repairWorkspacesMembership } from "@/actions/workspace";

export default function OnboardingPage() {
  const t = useTranslations();
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const supabase = createClient();
  const params = useParams();
  const locale = params?.locale || "es";
  const router = useRouter();
  const queryClient = useQueryClient();
  const { workspaces, isLoading: workspacesLoading } = useAuth();

  const [isJoiningMode, setIsJoiningMode] = useState(false);
  const [joinCode, setJoinCode] = useState("");

  // SKIP & REPAIR LOGIC: Si ya tiene workspaces o tiene huérfanos, repararlos y saltar al dashboard
  useEffect(() => {
    if (workspacesLoading) return;

    if (workspaces.length > 0) {
      router.push(`/${locale}/dashboard`);
      return;
    }

    // Si no tiene workspaces cargados, comprobar si hay workspaces huérfanos de los que es dueño para auto-repararlos
    const autoRepair = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: owned } = await supabase
          .from('workspaces')
          .select('id')
          .eq('owner_id', user.id);

        if (owned && owned.length > 0) {
          console.log("[Onboarding] Found orphaned workspaces. Auto-repairing memberships...");
          const repairResult = await repairWorkspacesMembership();
          if (repairResult.success && (repairResult.repairedCount ?? 0) > 0) {
            await queryClient.invalidateQueries({ queryKey: ['auth-user'] });
          }
        }
      } catch (err) {
        console.error("Auto-repair membership failed:", err);
      }
    };

    autoRepair();
  }, [workspacesLoading, workspaces, router, queryClient]);

  if (workspacesLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary opacity-20" />
      </div>
    );
  }

  if (workspaces.length > 0) {
    return null;
  }

  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // REPAIR LOGIC: Antes de crear uno nuevo, ver si ya tiene alguno "huérfano" (es dueño pero no miembro)
      const { data: ownedWorkspaces } = await supabase
        .from('workspaces')
        .select('id')
        .eq('owner_id', user.id);

      if (ownedWorkspaces && ownedWorkspaces.length > 0) {
        // En lugar de hacer upsert desde el cliente que falla por RLS, ejecutamos la Server Action de administración que auto-repara
        const repairResult = await repairWorkspacesMembership();
        if (repairResult.error) {
          console.error("Failed to auto-repair memberships:", repairResult.error);
        }

        await queryClient.invalidateQueries({ queryKey: ['auth-user'] });
        toast.success(t("onboarding.success"));
        router.push(`/${locale}/dashboard`);
        return;
      }

      // Crear robustamente usando la Server Action de administración
      const { error: wsError } = await createWorkspace(name);
      if (wsError) throw new Error(wsError);

      // Invalidate the auth-user query to load the new workspace and membership
      await queryClient.invalidateQueries({ queryKey: ['auth-user'] });

      toast.success(t("onboarding.success"));
      router.push(`/${locale}/dashboard`);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleJoinWorkspace = (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim()) return;
    setIsSubmitting(true);
    router.push(`/${locale}/join/${joinCode.trim()}`);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-8">
      <div className="w-full max-w-[440px] space-y-12">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="h-16 w-16 bg-brand/10 border border-brand/20 flex items-center justify-center rounded-sm text-brand">
            <Rocket size={32} />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-black tracking-tighter uppercase">
              {isJoiningMode ? t("onboarding.title_join") : t("onboarding.title")}
            </h1>
            <p className="text-sm font-bold text-muted-foreground leading-snug">
              {isJoiningMode ? t("onboarding.subtitle_join") : t("onboarding.subtitle")}
            </p>
          </div>
        </div>

        {isJoiningMode ? (
          <form onSubmit={handleJoinWorkspace} className="space-y-8">
            <div className="space-y-2 group">
              <label className="technical-label text-[10px] text-foreground opacity-60 ml-1">
                {t("onboarding.label_join")}
              </label>
              <div className="relative">
                <Input
                  placeholder={t("onboarding.placeholder_join")}
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value)}
                  className="h-14 rounded-sm border-border bg-card focus:border-brand transition-all text-sm font-medium pl-10 pr-4 uppercase"
                  required
                />
                <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 opacity-40" />
              </div>
            </div>

            <div className="space-y-4">
              <Button type="submit" disabled={isSubmitting} className="w-full h-14 rounded-sm font-black uppercase tracking-[0.2em] text-[11px] bg-brand text-white shadow-xl shadow-brand/20 hover:opacity-90">
                {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : t("onboarding.button_join")}
              </Button>

              <button
                type="button"
                onClick={() => setIsJoiningMode(false)}
                className="w-full text-center text-xs font-semibold text-brand hover:underline"
              >
                {t("onboarding.toggle_create")}
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleCreateWorkspace} className="space-y-8">
            <div className="space-y-2 group">
              <label className="technical-label text-[10px] text-foreground opacity-60 ml-1">
                {t("onboarding.label")}
              </label>
              <div className="relative">
                <Input
                  placeholder={t("onboarding.placeholder")}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-14 rounded-sm border-border bg-card focus:border-brand transition-all text-sm font-medium pl-10 pr-4"
                  required
                />
                <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 opacity-40" />
              </div>
            </div>

            <div className="space-y-4">
              <Button type="submit" disabled={isSubmitting} className="w-full h-14 rounded-sm font-black uppercase tracking-[0.2em] text-[11px] bg-brand text-white shadow-xl shadow-brand/20 hover:opacity-90">
                {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : t("onboarding.button")}
              </Button>

              <button
                type="button"
                onClick={() => setIsJoiningMode(true)}
                className="w-full text-center text-xs font-semibold text-brand hover:underline"
              >
                {t("onboarding.toggle_join")}
              </button>
            </div>
          </form>
        )}

        <div className="pt-8 border-t border-border text-center">
          <p className="technical-label text-[9px] opacity-30 uppercase tracking-widest">{t("onboarding.footer")}</p>
        </div>
      </div>
    </div>
  );
}
