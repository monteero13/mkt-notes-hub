'use client';

import React, { createContext, useContext, useEffect, useMemo } from "react";
import { useAuth } from "./use-auth";
import { useWorkspaceStore } from "@/lib/store/use-workspace-store";
import { WorkspaceWithMembership, Profile, Subscription } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

interface WorkspaceContextType {
  activeWorkspace: WorkspaceWithMembership | null;
  workspaces: WorkspaceWithMembership[];
  setActiveWorkspace: (id: string | null) => void;
  isLoading: boolean;
  isPro: boolean;
  profile: Profile | null;
  members: any[];
  invites: any[];
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

/**
 * WorkspaceProvider
 * Envuelve la aplicación para proveer el contexto del workspace activo,
 * gestionando la selección, membresía y estado de suscripción.
 */
export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const { workspaces, isLoading: authLoading, profile } = useAuth();
  const { activeWorkspaceId, setActiveWorkspaceId } = useWorkspaceStore();

  // 1. Selección automática y validación del workspace activo
  useEffect(() => {
    if (authLoading) return;

    if (workspaces.length > 0) {
      const isValid = workspaces.some(w => w.id === activeWorkspaceId);
      const firstWorkspace = workspaces[0];
      if ((!activeWorkspaceId || !isValid) && firstWorkspace) {
        setActiveWorkspaceId(firstWorkspace.id);
      }
    }
  }, [workspaces, activeWorkspaceId, authLoading, setActiveWorkspaceId]);

  // 2. Persistencia en Cookies para sincronización con Server Components
  useEffect(() => {
    if (activeWorkspaceId) {
      // Set cookie that expires in 30 days
      const expires = new Date();
      expires.setTime(expires.getTime() + (30 * 24 * 60 * 60 * 1000));
      document.cookie = `mkt_active_workspace=${activeWorkspaceId}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
    }
  }, [activeWorkspaceId]);

  // 2. Determinar el objeto del workspace activo
  const activeWorkspace = useMemo(() => {
    if (workspaces.length === 0) return null;
    const found = workspaces.find((w) => w.id === activeWorkspaceId);
    return found || workspaces[0] || null;
  }, [workspaces, activeWorkspaceId]);

  // 3. Query para verificar la suscripción activa del workspace (Seguridad extra)
  const subscriptionQuery = useQuery({
    queryKey: ['workspace-subscription', activeWorkspace?.id],
    enabled: !!activeWorkspace?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('workspace_id', activeWorkspace!.id)
        .maybeSingle();

      if (error) return null;
      return data as Subscription | null;
    },
    staleTime: 1000 * 60 * 5, // 5 minutos de caché
  });

  // 4. Query para obtener los miembros del equipo del workspace activo
  const membersQuery = useQuery({
    queryKey: ['workspace-members', activeWorkspace?.id],
    enabled: !!activeWorkspace?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workspace_members')
        .select(`
          *,
          profile:profiles(*)
        `)
        .eq('workspace_id', activeWorkspace!.id)
        .eq('is_active', true);

      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutos (era 2)
  });

  const invitesQuery = useQuery({
    queryKey: ['workspace-invites', activeWorkspace?.id],
    enabled: !!activeWorkspace?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workspace_invites')
        .select('*')
        .eq('workspace_id', activeWorkspace!.id)
        .eq('status', 'pending');

      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutos (era 2)
  });

  // Lógica de estado PRO (Workspace Plan + Subscription Table)
  const isPro = useMemo(() => {
    if (!activeWorkspace) return false;
    const hasProPlan = activeWorkspace.plan === 'pro' || activeWorkspace.plan === 'enterprise';
    const hasActiveSub = ["active", "trialing"].includes(subscriptionQuery.data?.status ?? "");
    return hasProPlan || hasActiveSub;
  }, [activeWorkspace, subscriptionQuery.data]);

  const value = useMemo(() => ({
    activeWorkspace,
    workspaces,
    setActiveWorkspace: setActiveWorkspaceId,
    // isLoading only blocks on auth — workspace background queries (members, invites, subscription)
    // are non-critical and should not gate the UI from rendering.
    isLoading: authLoading,
    isPro,
    profile,
    members: membersQuery.data || [],
    invites: invitesQuery.data || [],
  }), [activeWorkspace, workspaces, setActiveWorkspaceId, authLoading, subscriptionQuery.isLoading, membersQuery.isLoading, invitesQuery.isLoading, isPro, profile, membersQuery.data, invitesQuery.data]);

  return React.createElement(WorkspaceContext.Provider, { value }, children);
}

/**
 * useWorkspace
 * Hook para acceder al estado global del workspace desde cualquier componente.
 * Incluye un fallback defensivo para evitar cierres inesperados si se usa fuera del Provider.
 */
export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (context === undefined) {
    // Fallback defensivo para evitar errores de ejecución
    console.warn("useWorkspace was called outside of WorkspaceProvider. Check your layout hierarchy.");
    return {
      activeWorkspace: null,
      workspaces: [],
      setActiveWorkspace: () => {},
      isLoading: true,
      isPro: false,
      profile: null,
      members: [],
      invites: [],
    };
  }
  return context;
}
