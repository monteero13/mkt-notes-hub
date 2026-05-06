'use client';

import { useWorkspace } from './use-workspace';

export function useTeam() {
  const { activeWorkspace, isLoading, workspaces } = useWorkspace();

  return {
    data: activeWorkspace,
    isLoading,
    workspaces, // Útil para selectores de equipo
    isError: false,
  };
}
