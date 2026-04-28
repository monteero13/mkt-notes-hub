'use client';

import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { useTeam } from './use-team';
import { useAuth } from './use-auth';

export function useDashboardData() {
  const supabase = createClient();
  const { data: team } = useTeam();
  const { user } = useAuth();

  const tasksQuery = useQuery({
    queryKey: ['tasks', user?.id, team?.id || 'all'],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    staleTime: 1000 * 5,
  });

  const campaignsQuery = useQuery({
    queryKey: ['campaigns', user?.id, team?.id || 'all'],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    staleTime: 1000 * 5,
  });

  return {
    tasks: tasksQuery.data || [],
    campaigns: campaignsQuery.data || [],
    isLoading: tasksQuery.isLoading || campaignsQuery.isLoading || !user,
    isError: tasksQuery.isError || campaignsQuery.isError,
  };
}
