"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface InviteData {
  id: string;
  email: string;
  role: string;
}
interface TeamData {
  id: string;
  name: string;
  slug: string;
}

export default function JoinWorkspacePage() {
  const params = useParams();
  const locale = params?.locale || "es";
  const router = useRouter();
  const [team, setTeam] = useState<TeamData | null>(null);
  const [invite, setInvite] = useState<InviteData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);

  useEffect(() => {
    async function fetchInvite() {
      try {
        const response = await fetch(`/api/invite-info?code=${params.code}`);
        const result = await response.json();
        if (!response.ok || !result.team) {
          toast.error("Enlace de invitación inválido o expirado.");
          router.push(`/${locale}/dashboard`);
          return;
        }
        setTeam(result.team);
        setInvite(result.invite);
      } catch {
        toast.error("Error al cargar la invitación.");
        router.push(`/${locale}/dashboard`);
      } finally {
        setIsLoading(false);
      }
    }
    if (params.code) fetchInvite();
  }, [params.code, router]);

  const handleJoin = async () => {
    if (!team || !invite) return;
    setIsJoining(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push(`/${locale}/login?next=/join/${params.code}`);
        return;
      }

      // Check if already a member
      const { data: existing } = await supabase
        .from("workspace_members")
        .select("id")
        .eq("workspace_id", team.id)
        .eq("user_id", user.id)
        .maybeSingle();

      if (existing) {
        toast.info("Ya eres miembro de este workspace.");
        router.push(`/${locale}/dashboard`);
        return;
      }

      // Add member
      const { error } = await supabase.from("workspace_members").insert({
        workspace_id: team.id,
        user_id: user.id,
        role: invite.role,
        is_active: true,
      });

      if (error) throw error;

      // Mark invite as accepted
      await supabase
        .from("workspace_invites")
        .update({ status: "accepted" })
        .eq("id", invite.id);

      toast.success(`¡Bienvenido a ${team.name}!`);
      router.push(`/${locale}/dashboard`);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Error al unirse al workspace.";
      toast.error(msg);
    } finally {
      setIsJoining(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Users className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Únete al workspace</CardTitle>
          <CardDescription>
            Has sido invitado a{" "}
            <span className="font-bold text-foreground">{team?.name}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button className="w-full" size="lg" onClick={handleJoin} disabled={isJoining}>
            {isJoining ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            {isJoining ? "Uniéndote..." : "Aceptar invitación"}
          </Button>
          <Button variant="ghost" className="w-full" onClick={() => router.push(`/${locale}/dashboard`)}>
            Cancelar
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
