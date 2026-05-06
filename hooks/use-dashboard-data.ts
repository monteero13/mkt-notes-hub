'use client';

import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { useWorkspace } from './use-workspace';
import { Task, Campaign } from '@/types';

export function useDashboardData() {
  const supabase = createClient();
  const { activeWorkspace, isLoading: wsLoading } = useWorkspace();

  const tasksQuery = useQuery({
    queryKey: ['dashboard-tasks', activeWorkspace?.id],
    enabled: !!activeWorkspace?.id,
    queryFn: async () => {
      const workspaceId = activeWorkspace!.id;

      const listPromise = supabase
        .from('tasks')
        .select(`
          *,
          assignee:profiles!tasks_assignee_id_fkey(*)
        `)
        .eq('workspace_id', workspaceId)
        .order('created_at', { ascending: false })
        .limit(10);

      const totalCountPromise = supabase
        .from('tasks')
        .select('*', { count: 'exact', head: true })
        .eq('workspace_id', workspaceId);

      const pendingCountPromise = supabase
        .from('tasks')
        .select('*', { count: 'exact', head: true })
        .eq('workspace_id', workspaceId)
        .neq('status', 'done');

      const [list, total, pending] = await Promise.all([
        listPromise,
        totalCountPromise,
        pendingCountPromise
      ]);

      if (list.error) throw list.error;
      
      return {
        list: (list.data || []) as Task[],
        totalCount: total.count || 0,
        pendingCount: pending.count || 0
      };
    },
    staleTime: 1000 * 60 * 3, // 3 min cache (era 1 min)
  });

  const campaignsQuery = useQuery({
    queryKey: ['dashboard-campaigns', activeWorkspace?.id],
    enabled: !!activeWorkspace?.id,
    queryFn: async () => {
      const workspaceId = activeWorkspace!.id;

      const listPromise = supabase
        .from('campaigns')
        .select('*')
        .eq('workspace_id', workspaceId)
        .order('created_at', { ascending: false })
        .limit(5);

      const totalCountPromise = supabase
        .from('campaigns')
        .select('*', { count: 'exact', head: true })
        .eq('workspace_id', workspaceId);

      const [list, total] = await Promise.all([
        listPromise,
        totalCountPromise
      ]);

      if (list.error) throw list.error;

      return {
        list: (list.data || []) as Campaign[],
        totalCount: total.count || 0
      };
    },
    staleTime: 1000 * 60 * 3, // 3 min cache (era 1 min)
  });

  const clientsQuery = useQuery({
    queryKey: ['dashboard-clients', activeWorkspace?.id],
    enabled: !!activeWorkspace?.id,
    queryFn: async () => {
      const { count, error } = await supabase
        .from('clients')
        .select('*', { count: 'exact', head: true })
        .eq('workspace_id', activeWorkspace!.id);

      if (error) throw error;
      return count || 0;
    },
    staleTime: 1000 * 60 * 3, // 3 min cache (era 1 min)
  });

  return {
    tasks: tasksQuery.data?.list || [],
    campaigns: campaignsQuery.data?.list || [],
    counts: {
      tasks: tasksQuery.data?.totalCount || 0,
      pendingTasks: tasksQuery.data?.pendingCount || 0,
      campaigns: campaignsQuery.data?.totalCount || 0,
      totalClients: clientsQuery.data || 0
    },
    isLoading: tasksQuery.isLoading || campaignsQuery.isLoading || clientsQuery.isLoading || wsLoading,
    isError: tasksQuery.isError || campaignsQuery.isError || clientsQuery.isError,
  };
}
