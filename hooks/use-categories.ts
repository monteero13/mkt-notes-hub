'use client';

import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { useWorkspace } from './use-workspace';

export function useCategories() {
  const supabase = createClient();
  const { activeWorkspace } = useWorkspace();

  return useQuery({
    queryKey: ['task_categories', activeWorkspace?.id],
    enabled: !!activeWorkspace,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('task_categories')
        .select('*')
        .eq('team_id', activeWorkspace?.id);
      
      if (error) throw error;
      return data || [];
    },
    staleTime: 1000 * 60, // 1 minute
  });
}
