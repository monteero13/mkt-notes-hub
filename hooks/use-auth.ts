'use client';

import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { Profile, WorkspaceWithMembership } from '@/types';

export function useAuth() {
  const supabase = createClient();

  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: ['auth-user'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { user: null, profile: null, workspaces: [], subscription: null };

      // 1. Obtener el perfil de la DB
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      // 2. Obtener los workspaces del usuario con sus planes
      const { data: memberships } = await supabase
        .from('workspace_members')
        .select(`
          role,
          workspace:workspaces (
            *,
            subscription:subscriptions (
              plan,
              status
            )
          )
        `)
        .eq('user_id', user.id)
        .eq('is_active', true);

      const workspaces: WorkspaceWithMembership[] = (memberships || []).map((m: any) => {
        const workspace = m.workspace as any;
        const subscription = workspace.subscription?.[0] || workspace.subscription || null;

        return {
          ...workspace,
          role: m.role,
          plan: ["active", "trialing"].includes(subscription?.status ?? "") ? subscription.plan : 'free',
          subscription: subscription
        };
      });

      // 3. Subscription status is already derived per-workspace in step 2.
      // If we need a global "isPro" for the user, we can check if they own ANY pro workspace
      const hasAnyProWorkspace = workspaces.some(w => ["pro", "enterprise"].includes(w.plan || "free"));

      return {
        user,
        profile: profile as Profile | null,
        workspaces,
        subscription: hasAnyProWorkspace ? { plan: 'pro', status: 'active' } : null
      };
    },
    staleTime: 1000 * 60 * 10, // 10 min: reduces waterfall re-triggers on navigation
  });

  return {
    user: data?.user ?? null,
    profile: data?.profile ?? null,
    workspaces: data?.workspaces ?? [],
    subscription: data?.subscription ?? null,
    isPro: data?.workspaces.some(w => ["pro", "enterprise"].includes(w.plan || "free")),
    isLoading,
    isFetching,
    isAuthenticated: !!data?.user,
    error,
  };
}
