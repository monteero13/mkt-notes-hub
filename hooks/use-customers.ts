'use client';

import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { useWorkspace } from './use-workspace';

export interface Customer {
  id: string;
  workspace_id: string;
  name: string;
  email: string | null;
  industry: string | null;
  status: 'prospect' | 'active' | 'churned';
  monthly_retainer: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export function useCustomers() {
  const supabase = createClient();
  const { activeWorkspace } = useWorkspace();

  return useQuery({
    queryKey: ['customers', activeWorkspace?.id],
    enabled: !!activeWorkspace?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('workspace_id', activeWorkspace!.id)
        .order('name', { ascending: true });

      if (error) throw error;
      return data as Customer[];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
