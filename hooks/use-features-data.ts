'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { useWorkspace } from './use-workspace';
import { ContentItem, Resource, Task } from '@/types';

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

export function useTasks() {
  const supabase = createClient();
  const { activeWorkspace } = useWorkspace();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['tasks', activeWorkspace?.id],
    enabled: !!activeWorkspace?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select('*, campaign:campaigns(*), assignee:profiles(*)')
        .eq('workspace_id', activeWorkspace!.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as Task[];
    },
    staleTime: 1000 * 60 * 3,
  });

  const createTaskMutation = useMutation({
    mutationFn: async (task: Partial<Task>) => {
      if (!activeWorkspace?.id) throw new Error('No active workspace');
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          ...task,
          workspace_id: activeWorkspace.id,
          status: task.status || 'todo',
          priority: task.priority || 'medium',
        })
        .select()
        .single();

      if (error) throw error;
      return data as Task;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', activeWorkspace?.id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-tasks', activeWorkspace?.id] });
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Task> & { id: string }) => {
      const { data, error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Task;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', activeWorkspace?.id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-tasks', activeWorkspace?.id] });
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', activeWorkspace?.id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-tasks', activeWorkspace?.id] });
    },
  });

  return {
    ...query,
    createTask: createTaskMutation.mutateAsync,
    isCreating: createTaskMutation.isPending,
    updateTask: updateTaskMutation.mutateAsync,
    isUpdating: updateTaskMutation.isPending,
    deleteTask: deleteTaskMutation.mutateAsync,
    isDeleting: deleteTaskMutation.isPending,
  };
}
