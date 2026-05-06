'use client';

import { useMemo } from 'react';
import { useWorkspace } from './use-workspace';
import { WorkspaceRole } from '@/types';

export interface RoleState {
  currentRole: WorkspaceRole | null;
  isOwner: boolean;
  isAdmin: boolean;
  canEdit: boolean;
  isViewer: boolean;
}

export function useRole(): RoleState {
  const { members, profile, activeWorkspace } = useWorkspace();

  return useMemo(() => {
    // Priority 1: Check activeWorkspace.role (populated from memberships in useAuth)
    // Priority 2: Check members list
    let role = activeWorkspace?.role as WorkspaceRole | null;
    
    if (!role && members.length > 0 && profile?.id) {
      const member = members.find((m: any) => m.user_id === profile.id);
      role = (member?.role ?? null) as WorkspaceRole | null;
    }

    return {
      currentRole: role,
      isOwner: role === 'owner',
      isAdmin: role === 'owner' || role === 'admin',
      canEdit: role === 'owner' || role === 'admin' || role === 'manager' || role === 'editor',
      isViewer: role === 'viewer' || role === 'client_guest',
    };
  }, [members, profile?.id, activeWorkspace?.id, activeWorkspace?.role]);
}
