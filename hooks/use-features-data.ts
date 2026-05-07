'use client';

import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { useWorkspace } from './use-workspace';
import { ContentItem, Resource } from '@/types';

export { useTeam } from './use-team';

export function useContent() {
  const supabase = createClient();
  const { activeWorkspace } = useWorkspace();

  return useQuery({
    queryKey: ['content', activeWorkspace?.id],
    enabled: !!activeWorkspace?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('content_items')
        .select('*')
        .eq('workspace_id', activeWorkspace!.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as ContentItem[];
    },
    staleTime: 1000 * 60 * 3,
  });
}

export function useIdeas() {
  const supabase = createClient();
  const { activeWorkspace } = useWorkspace();

  return useQuery({
    queryKey: ['ideas', activeWorkspace?.id],
    enabled: !!activeWorkspace?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('marketing_ideas')
        .select('*')
        .eq('workspace_id', activeWorkspace!.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    staleTime: 1000 * 60 * 3,
  });
}

export function useResources() {
  const supabase = createClient();
  const { activeWorkspace } = useWorkspace();

  return useQuery({
    queryKey: ['resources', activeWorkspace?.id],
    enabled: !!activeWorkspace?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('resources')
        .select('*')
        .eq('workspace_id', activeWorkspace!.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as Resource[];
    },
    staleTime: 1000 * 60 * 3,
  });
}

export function useObjectives() {
  const supabase = createClient();
  const { activeWorkspace } = useWorkspace();

  return useQuery({
    queryKey: ['objectives', activeWorkspace?.id],
    enabled: !!activeWorkspace?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('objectives')
        .select('*')
        .eq('workspace_id', activeWorkspace!.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    staleTime: 1000 * 60 * 3,
  });
}
