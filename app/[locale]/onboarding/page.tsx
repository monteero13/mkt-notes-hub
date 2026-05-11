'use client';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useRef, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import { 
  Building2, 
  Loader2, 
  Rocket, 
  Users, 
  Camera, 
  User, 
  X, 
  Globe, 
  ArrowRight, 
  Sparkles, 
  LockKeyhole, 
  LogOut,
  ArrowLeft
} from "lucide-react";

import { useTranslations } from "next-intl";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { createWorkspace, repairWorkspacesMembership } from "@/actions/workspace";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const TIMEZONES = [
  { value: "Europe/Madrid", label: "Madrid (CET / CEST)" },
  { value: "America/New_York", label: "New York (EST / EDT)" },
  { value: "America/Mexico_City", label: "Ciudad de México (CST)" },
  { value: "America/Bogota", label: "Bogotá (COT)" },
  { value: "America/Argentina/Buenos_Aires", label: "Buenos Aires (ART)" },
  { value: "America/London", label: "London (GMT / BST)" },
  { value: "UTC", label: "Coordinated Universal Time (UTC)" }
];

export default function OnboardingPage() {
  const t = useTranslations();
  const params = useParams();
  const locale = params?.locale || "es";
  const router = useRouter();
  const queryClient = useQueryClient();
  const supabase = createClient();

  const { user, profile, workspaces, isLoading: workspacesLoading } = useAuth();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  // Onboarding wizard step: 1 (Profile Setup), 2 (Workspace Connect)
  const [step, setStep] = useState(1);

  // Step 1 states
  const [fullName, setFullName] = useState("");
  const [timezone, setTimezone] = useState(() => {
    if (typeof window !== "undefined") {
      return Intl.DateTimeFormat().resolvedOptions().timeZone || "Europe/Madrid";
    }
    return "Europe/Madrid";
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Step 2 states
  const [workspaceName, setWorkspaceName] = useState("");
  const [joinCode, setJoinCode] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pre-fill full name from auth/profile
  useEffect(() => {
    if (profile?.full_name && !fullName) {
      setFullName(profile.full_name);
    } else if (user?.user_metadata?.full_name && !fullName) {
      setFullName(user.user_metadata.full_name);
    }
  }, [profile, user]);

  // Set avatar preview if already exists on profile
  useEffect(() => {
    if (profile?.avatar_url && !avatarPreview) {
      setAvatarPreview(profile.avatar_url);
    }
  }, [profile]);

  // Advance to Step 2 if profile already marks onboarding_done as true
  useEffect(() => {
    if (profile?.onboarding_done) {
      setStep(2);
    }
  }, [profile]);

  // SKIP & REPAIR LOGIC: Si ya tiene workspaces o tiene huérfanos, repararlos y saltar al dashboard
  useEffect(() => {
    if (workspacesLoading) return;

    const isForce = typeof window !== "undefined" && new URLSearchParams(window.location.search).get("force") === "true";

    if (workspaces.length > 0 && !isForce) {
      router.push(`/${locale}/dashboard`);
      return;
    }

    const autoRepair = async () => {
      try {
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        if (!currentUser) return;

        const { data: owned } = await supabase
          .from('workspaces')
          .select('id')
          .eq('owner_id', currentUser.id);

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 2 * 1024 * 1024) {
        toast.error(locale === "es" ? "La imagen supera el límite de 2MB." : "The image exceeds the 2MB limit.");
        return;
      }
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      toast.error(locale === "es" ? "Por favor, introduce tu nombre." : "Please enter your name.");
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) throw new Error("Not authenticated");

      let finalAvatarUrl = profile?.avatar_url || null;

      // Handle avatar file upload if present
      if (avatarFile) {
        try {
          const formData = new FormData();
          formData.append('file', avatarFile);
          formData.append('userId', currentUser.id);

          const uploadRes = await fetch('/api/upload-avatar', {
            method: 'POST',
            body: formData,
          });

          if (uploadRes.ok) {
            const { url } = await uploadRes.json();
            finalAvatarUrl = url;
            
            // Also update auth user metadata
            await supabase.auth.updateUser({
              data: { avatar_url: url }
            });
          } else {
            console.error("Avatar upload endpoint failed");
          }
        } catch (uploadErr) {
          console.error("Error uploading avatar:", uploadErr);
        }
      } else if (!avatarPreview) {
        // If they cleared it
        finalAvatarUrl = null;
      }

      // Update profiles database table
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: fullName.trim(),
          avatar_url: finalAvatarUrl,
          timezone: timezone,
          onboarding_done: true
        } as any)
        .eq('id', currentUser.id);

      if (profileError) throw profileError;

      await queryClient.invalidateQueries({ queryKey: ['auth-user'] });
      
      toast.success(locale === "es" ? "Identidad confirmada. Siguiente paso." : "Identity confirmed. Next step.");
      setStep(2);
    } catch (err: any) {
      toast.error(err.message || "Error saving profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workspaceName.trim()) return;

    setIsSubmitting(true);
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) throw new Error("Not authenticated");

      // REPAIR LOGIC: Antes de crear uno nuevo, ver si ya tiene alguno "huérfano" (es dueño pero no miembro)
      const { data: ownedWorkspaces } = await supabase
        .from('workspaces')
        .select('id')
        .eq('owner_id', currentUser.id);

      if (ownedWorkspaces && ownedWorkspaces.length > 0) {
        const repairResult = await repairWorkspacesMembership();
        if (repairResult.error) {
          console.error("Failed to auto-repair memberships:", repairResult.error);
        }

        await queryClient.invalidateQueries({ queryKey: ['auth-user'] });
        toast.success(t("onboarding.success"));
        router.push(`/${locale}/dashboard`);
        return;
      }

      // Crear usando la Server Action de administración
      const { error: wsError } = await createWorkspace(workspaceName);
      if (wsError) throw new Error(wsError);

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
    router.push(`/${locale}/join/${joinCode.trim().toUpperCase()}`);
  };

  if (workspacesLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand opacity-20" />
      </div>
    );
  }

  if (workspaces.length > 0) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 md:p-12 relative overflow-hidden">
      {/* Background radial gradient glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-brand/10 via-transparent to-transparent pointer-events-none" />

      {/* Floating Logout Button in top right */}
      <div className="absolute top-6 right-6 z-20">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleSignOut}
          className="text-xs font-semibold hover:bg-brand/10 hover:text-brand flex items-center gap-2 rounded-sm"
        >
          <LogOut size={14} />
          {locale === "es" ? "Cerrar Sesión" : "Log Out"}
        </Button>
      </div>

      <div className="w-full max-w-5xl relative z-10 flex flex-col items-center space-y-12">
        
        {/* Header Section */}
        <div className="flex flex-col items-center text-center space-y-4 max-w-2xl">
          <div className="h-14 w-14 bg-brand/10 border border-brand/20 flex items-center justify-center rounded-2xl text-brand shadow-xl shadow-brand/5 animate-pulse">
            <Rocket size={24} />
          </div>
          <div className="space-y-1.5">
            <h1 className="text-3xl font-black tracking-tight uppercase leading-none">
              {step === 1 
                ? (locale === "es" ? "Tu Identidad Digital" : "Your Digital Identity")
                : (locale === "es" ? "Conexión de Espacio" : "Workspace Connection")
              }
            </h1>
            <p className="text-sm font-medium text-muted-foreground max-w-md mx-auto leading-relaxed animate-in fade-in duration-500">
              {step === 1
                ? (locale === "es" ? "Configura tus credenciales operativas de perfil antes de acceder al sistema." : "Set up your operational profile credentials before accessing the system.")
                : (locale === "es" ? "Para empezar, crea un espacio limpio para tu agencia o únete a un equipo existente." : "To start, create a clean space for your agency or join an existing team.")
              }
            </p>
          </div>

          {/* Step indicators */}
          <div className="flex items-center gap-2 pt-2">
            <span className={`h-1.5 rounded-full transition-all duration-300 ${step === 1 ? "bg-brand w-8" : "bg-border w-2"}`} />
            <span className={`h-1.5 rounded-full transition-all duration-300 ${step === 2 ? "bg-brand w-8" : "bg-border w-2"}`} />
          </div>
        </div>

        {/* STEP 1: IDENTITY SETUP */}
        {step === 1 && (
          <div className="w-full max-w-md bg-card/60 backdrop-blur-md border border-border p-8 rounded-xl shadow-2xl relative overflow-hidden animate-in fade-in zoom-in-95 duration-500">
            <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 h-24 w-24 rounded-full bg-brand/10 blur-[40px] pointer-events-none" />

            <form onSubmit={handleSaveProfile} className="space-y-6 relative z-10">
              
              {/* Profile Photo selector */}
              <div className="flex flex-col items-center gap-2">
                <div className="relative group">
                  <Avatar className="h-20 w-20 rounded-2xl border-2 border-border group-hover:border-brand transition-all shadow-lg overflow-hidden">
                    <AvatarImage src={avatarPreview || undefined} className="object-cover grayscale" />
                    <AvatarFallback className="bg-accent/10">
                      <User className="h-10 w-10 text-muted-foreground/30" />
                    </AvatarFallback>
                  </Avatar>
                  <label htmlFor="avatar-upload" className="absolute -bottom-1 -right-1 h-7 w-7 rounded-lg bg-brand text-white flex items-center justify-center cursor-pointer hover:scale-110 active:scale-95 transition-all z-10 shadow-lg shadow-brand/20">
                    <Camera className="h-3.5 w-3.5" />
                    <input id="avatar-upload" type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                  </label>
                  {avatarPreview && (
                    <button type="button" className="absolute -top-1 -right-1 h-5 w-5 rounded-lg bg-destructive text-white flex items-center justify-center z-10 shadow-md hover:bg-destructive/90 transition-colors" onClick={removeAvatar}>
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>
                <span className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest mt-1">
                  {locale === "es" ? "Foto de Perfil" : "Profile Picture"}
                </span>
              </div>

              {/* Full Name field */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-black uppercase tracking-wider text-foreground/70 ml-1">
                  {locale === "es" ? "Nombre Completo" : "Full Name"}
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40" />
                  <Input 
                    placeholder={locale === "es" ? "Ej. Alberto Montero" : "e.g. John Doe"} 
                    className="pl-10 h-12 border-border bg-background rounded-sm text-xs font-bold focus-visible:ring-brand" 
                    value={fullName} 
                    onChange={(e) => setFullName(e.target.value)} 
                    required 
                  />
                </div>
              </div>

              {/* Timezone Select field */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-black uppercase tracking-wider text-foreground/70 ml-1 flex items-center gap-1.5">
                  <Globe size={12} className="text-brand" />
                  {locale === "es" ? "Zona Horaria" : "Time Zone"}
                </label>
                <div className="relative">
                  <select
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="w-full h-12 pl-4 pr-10 border border-border bg-background rounded-sm text-xs font-bold text-foreground focus:outline-none focus:border-brand cursor-pointer appearance-none"
                  >
                    {TIMEZONES.map((tz) => (
                      <option key={tz.value} value={tz.value}>
                        {tz.label}
                      </option>
                    ))}
                    {!TIMEZONES.some(t => t.value === timezone) && (
                      <option value={timezone}>{timezone}</option>
                    )}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground/40">
                    ▼
                  </div>
                </div>
              </div>

              {/* Proceed Button */}
              <Button type="submit" disabled={isSubmitting} className="w-full h-12 bg-brand text-white text-xs font-black uppercase tracking-[0.15em] rounded-sm hover:opacity-90 transition-all shadow-xl shadow-brand/10 mt-2">
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    {locale === "es" ? "Confirmar y Continuar" : "Confirm & Continue"}
                    <ArrowRight size={14} />
                  </div>
                )}
              </Button>
            </form>
          </div>
        )}

        {/* STEP 2: CREATE OR JOIN WORKSPACE SIDE-BY-SIDE */}
        {step === 2 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl relative animate-in fade-in slide-in-from-bottom-6 duration-500">
            
            {/* Symmetrical Card A: Create Workspace */}
            <div className="bg-card/60 backdrop-blur-md border border-border rounded-xl p-8 flex flex-col justify-between relative overflow-hidden group hover:border-brand/40 hover:shadow-brand/5 hover:shadow-2xl transition-all duration-500">
              {/* Highlight Top Corner Light */}
              <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 h-32 w-32 rounded-full bg-brand/5 group-hover:bg-brand/10 blur-[40px] pointer-events-none transition-all duration-500" />
              
              <div className="space-y-6">
                {/* Header info */}
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-xl bg-brand/10 border border-brand/20 flex items-center justify-center text-brand shrink-0">
                    <Sparkles size={20} />
                  </div>
                  <div className="space-y-1">
                    <h2 className="text-lg font-black uppercase tracking-tight text-foreground">
                      {locale === "es" ? "Crear Nueva Agencia" : "Create New Agency"}
                    </h2>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {locale === "es" 
                        ? "Inicia un espacio de trabajo limpio para coordinar tus objetivos, redactar contenidos y colaborar."
                        : "Initialize a clean workspace to coordinate your objectives, draft content, and collaborate."
                      }
                    </p>
                  </div>
                </div>

                <form onSubmit={handleCreateWorkspace} className="space-y-4 pt-2">
                  <div className="space-y-1.5 group">
                    <label className="technical-label text-[10px] text-foreground opacity-60 ml-1">
                      {t("onboarding.label")}
                    </label>
                    <div className="relative">
                      <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 opacity-40 text-muted-foreground" />
                      <Input
                        placeholder={t("onboarding.placeholder")}
                        value={workspaceName}
                        onChange={(e) => setWorkspaceName(e.target.value)}
                        className="h-12 rounded-sm border-border bg-background focus-visible:ring-brand pl-10 text-xs font-semibold"
                        required
                      />
                    </div>
                  </div>

                  <Button type="submit" disabled={isSubmitting} className="w-full h-12 rounded-sm font-black uppercase tracking-[0.15em] text-[10px] bg-brand text-white shadow-lg hover:opacity-90 transition-all">
                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : t("onboarding.button")}
                  </Button>
                </form>
              </div>
            </div>

            {/* Symmetrical Card B: Join Workspace */}
            <div className="bg-card/60 backdrop-blur-md border border-border rounded-xl p-8 flex flex-col justify-between relative overflow-hidden group hover:border-brand/40 hover:shadow-brand/5 hover:shadow-2xl transition-all duration-500">
              {/* Highlight Top Corner Light */}
              <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 h-32 w-32 rounded-full bg-primary/5 group-hover:bg-primary/10 blur-[40px] pointer-events-none transition-all duration-500" />
              
              <div className="space-y-6">
                {/* Header info */}
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                    <Users size={20} />
                  </div>
                  <div className="space-y-1">
                    <h2 className="text-lg font-black uppercase tracking-tight text-foreground">
                      {locale === "es" ? "Unirse con un Código" : "Join Existing Team"}
                    </h2>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {locale === "es" 
                        ? "Introduce el código de conexión de 8 caracteres que te ha proporcionado el administrador del equipo."
                        : "Enter the 8-character connection code supplied by your workspace administrator."
                      }
                    </p>
                  </div>
                </div>

                <form onSubmit={handleJoinWorkspace} className="space-y-4 pt-2">
                  <div className="space-y-1.5 group">
                    <label className="technical-label text-[10px] text-foreground opacity-60 ml-1">
                      {t("onboarding.label_join")}
                    </label>
                    <div className="relative">
                      <LockKeyhole className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 opacity-40 text-muted-foreground" />
                      <Input
                        placeholder={t("onboarding.placeholder_join")}
                        value={joinCode}
                        onChange={(e) => setJoinCode(e.target.value)}
                        className="h-12 rounded-sm border-border bg-background focus-visible:ring-brand pl-10 text-xs font-semibold uppercase tracking-wider"
                        required
                        maxLength={8}
                      />
                    </div>
                  </div>

                  <Button type="submit" disabled={isSubmitting} className="w-full h-12 rounded-sm font-black uppercase tracking-[0.15em] text-[10px] bg-background border border-border hover:bg-brand/10 hover:text-brand hover:border-brand transition-all">
                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : t("onboarding.button_join")}
                  </Button>
                </form>
              </div>
            </div>

            {/* Back button to identity setup */}
            {!profile?.onboarding_done && (
              <div className="col-span-1 md:col-span-2 flex justify-center pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-all"
                >
                  <ArrowLeft size={12} />
                  {locale === "es" ? "Volver a Configurar Perfil" : "Go Back to Profile Settings"}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Footer Section */}
        <div className="text-center pt-6 max-w-xs">
          <p className="technical-label text-[9px] opacity-30 uppercase tracking-widest leading-relaxed">
            {t("onboarding.footer")}
          </p>
        </div>

      </div>
    </div>
  );
}
