"use client";

import { useState } from "react";
import { useWorkspace } from "./workspace-provider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Building2, ChevronDown, Plus, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter, useParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { createWorkspace } from "@/actions/workspace";
import { toast } from "sonner";

interface WorkspaceSwitcherProps {
  collapsed?: boolean;
}

const ROLE_LABELS: Record<string, { es: string; en: string }> = {
  owner: { es: "Propietario", en: "Owner" },
  admin: { es: "Administrador", en: "Admin" },
  manager: { es: "Gestor", en: "Manager" },
  editor: { es: "Editor", en: "Editor" },
  viewer: { es: "Lector", en: "Viewer" },
  client_guest: { es: "Invitado", en: "Client Guest" },
};

export function WorkspaceSwitcher({ collapsed }: WorkspaceSwitcherProps) {
  if (collapsed) return null;
  const { activeWorkspace, workspaces, setActiveWorkspace } = useWorkspace();
  const router = useRouter();
  const params = useParams();
  const locale = params?.locale || "es";
  const queryClient = useQueryClient();

  // Dialog State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newWsName, setNewWsName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const activeRoleLabel = activeWorkspace?.role 
    ? (ROLE_LABELS[activeWorkspace.role]?.[locale as 'es' | 'en'] || activeWorkspace.role)
    : (locale === 'es' ? "Miembro" : "Member");

  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWsName.trim()) return;

    setIsSubmitting(true);
    try {
      const result = await createWorkspace(newWsName);
      if (result.error) throw new Error(result.error);

      toast.success(
        locale === "es" 
          ? `¡Espacio "${newWsName}" creado con éxito!` 
          : `Workspace "${newWsName}" created successfully!`
      );
      setNewWsName("");
      setIsDialogOpen(false);
      
      // Invalida las queries para recargar el listado de workspaces
      await queryClient.invalidateQueries({ queryKey: ['auth-user'] });

      // Cambiar de forma activa al nuevo workspace si se retornó su ID
      if (result.workspace?.id) {
        setActiveWorkspace(result.workspace.id);
        queryClient.invalidateQueries({ queryKey: ['workspace-members', result.workspace.id] });
        queryClient.invalidateQueries({ queryKey: ['workspace-invites', result.workspace.id] });
      }

      router.refresh();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className={cn(
            "flex items-center gap-3 rounded-md p-1.5 text-left transition-all hover:bg-accent group",
            collapsed ? "w-full justify-center px-0" : "w-full"
          )}>
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-brand text-white font-black text-[12px] transition-transform group-hover:scale-105">
              {activeWorkspace?.name ? activeWorkspace.name.slice(0, 2).toUpperCase() : <Building2 size={14} />}
            </div>
            {!collapsed && (
              <div className="flex flex-1 flex-col overflow-hidden">
                <span className="truncate text-[13px] font-bold tracking-tight text-foreground">{activeWorkspace?.name ?? (locale === 'es' ? "Seleccionar Espacio" : "Select Workspace")}</span>
                <span className="truncate text-[10px] text-muted-foreground uppercase tracking-[0.1em] font-medium">
                  {activeRoleLabel}
                </span>
              </div>
            )}
            {!collapsed && <ChevronDown size={14} className="text-muted-foreground transition-transform group-hover:translate-y-0.5" />}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-72 mt-2 rounded-2xl border border-border/10 bg-card/60 backdrop-blur-3xl shadow-2xl p-2">
          <DropdownMenuLabel className="text-[10px] text-muted-foreground/40 font-black uppercase tracking-[0.2em] px-3 py-3">
            {locale === 'es' ? "Tus Espacios de Trabajo" : "Your Workspaces"}
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-border/5" />
          <div className="space-y-1 py-1 max-h-[240px] overflow-y-auto">
            {workspaces.map((ws) => {
              const roleLabel = ROLE_LABELS[ws.role || "member"]?.[locale as 'es' | 'en'] || ws.role;
              return (
                <DropdownMenuItem
                  key={ws.id}
                  onClick={() => {
                    setActiveWorkspace(ws.id);
                    queryClient.invalidateQueries({ queryKey: ['auth-user'] });
                    queryClient.invalidateQueries({ queryKey: ['workspace-members', ws.id] });
                    queryClient.invalidateQueries({ queryKey: ['workspace-invites', ws.id] });
                    router.refresh();
                  }}
                  className={cn(
                    "flex items-center gap-3 p-3 cursor-pointer rounded-xl transition-all focus:bg-primary/5",
                    activeWorkspace?.id === ws.id && "bg-primary/5"
                  )}
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/20 text-[10px] font-black text-primary">
                    {ws.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex flex-1 flex-col overflow-hidden">
                    <span className="text-[13px] font-bold tracking-tight truncate">{ws.name}</span>
                    <span className="text-[10px] text-muted-foreground/50 font-medium uppercase tracking-wider">{roleLabel}</span>
                  </div>
                </DropdownMenuItem>
              );
            })}
          </div>
          <DropdownMenuSeparator className="bg-border/5" />
          <div className="p-1">
            <DropdownMenuItem 
              onSelect={(e) => {
                e.preventDefault(); // Evita que Radix cierre el dropdown robando el foco del input
                setIsDialogOpen(true);
              }}
              className="p-3 cursor-pointer text-primary focus:bg-primary/5 rounded-xl flex items-center gap-3"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <Plus size={16} strokeWidth={3} />
              </div>
              <span className="text-[13px] font-bold">
                {locale === 'es' ? "Crear Espacio de Trabajo" : "Create Workspace"}
              </span>
            </DropdownMenuItem>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md border border-border/10 bg-card/60 backdrop-blur-3xl p-6 rounded-2xl shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand/10 text-brand">
                <Building2 size={16} />
              </div>
              {locale === "es" ? "Crear Espacio de Trabajo" : "Create Workspace"}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground mt-1">
              {locale === "es" 
                ? "Los espacios de trabajo te permiten separar tus clientes, campañas e ideas de forma independiente. Podrás asociar un plan PRO individual a cada espacio."
                : "Workspaces allow you to separate your clients, campaigns, and ideas independently. You can associate an individual PRO plan to each workspace."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateWorkspace} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground/60 ml-1">
                {locale === "es" ? "Nombre del Espacio" : "Workspace Name"}
              </label>
              <Input
                placeholder={locale === "es" ? "Ej. Agencia Marketing..." : "e.g. Marketing Agency..."}
                value={newWsName}
                onChange={(e) => setNewWsName(e.target.value)}
                className="h-10 border-border bg-background rounded-xl text-sm focus-visible:ring-brand"
                autoFocus
                required
              />
            </div>
            <DialogFooter className="flex gap-2 sm:gap-0 mt-4">
              <Button 
                type="button" 
                variant="ghost" 
                onClick={() => setIsDialogOpen(false)} 
                disabled={isSubmitting}
                className="h-10 rounded-xl text-xs font-medium text-muted-foreground hover:bg-muted"
              >
                {locale === "es" ? "Cancelar" : "Cancel"}
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="h-10 rounded-xl bg-brand text-white hover:bg-brand/90 text-xs font-medium transition-all px-4"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  locale === "es" ? "Crear Espacio" : "Create Workspace"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
