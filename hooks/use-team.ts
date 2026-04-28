import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

export function useTeam() {
  const supabase = createClient()

  return useQuery({
    queryKey: ['team'],
    queryFn: async () => {
      console.log('>>> [useTeam] Solicitando equipo via API segura...');
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return null

      try {
        const response = await fetch(`/api/get-team?userId=${user.id}`);
        const result = await response.json();

        if (!response.ok) throw new Error(result.error || 'Error al obtener equipo');

        console.log('>>> [useTeam] Datos recibidos de la API:', result.team?.name || 'Ninguno');
        return result.team;
      } catch (e) {
        console.error('>>> [useTeam] Fallo en la API de equipo:', e);
        return null;
      }
    },
    staleTime: 1000 * 60 * 5,
  })
}
