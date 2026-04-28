'use client';

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { useTeam } from './use-team'
import { useAuth } from './use-auth'

export function useContent() {
  const supabase = createClient()
  const { data: team } = useTeam()
  const { user } = useAuth()

  return useQuery({
    queryKey: ['content', user?.id, team?.id || 'all'],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('content')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error("Error fetching content:", error)
        throw error
      }
      return data || []
    },
    staleTime: 1000 * 5 
  })
}

export function useIdeas() {
  const supabase = createClient()
  const { data: team } = useTeam()
  const { user } = useAuth()

  return useQuery({
    queryKey: ['ideas', user?.id, team?.id || 'all'],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ideas')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error("Error fetching ideas:", error)
        throw error
      }
      return data || []
    },
    staleTime: 1000 * 5
  })
}

export function useObjectives() {
  const supabase = createClient()
  const { data: team } = useTeam()
  const { user } = useAuth()

  return useQuery({
    queryKey: ['objectives', user?.id, team?.id || 'all'],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('objectives')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error("Error fetching objectives:", error)
        throw error
      }
      return data || []
    },
    staleTime: 1000 * 5
  })
}
