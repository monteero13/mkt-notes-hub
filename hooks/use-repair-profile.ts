'use client'

import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'

export function useRepairProfile() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  const repair = async (fullName: string) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    toast.loading('Reparando conexión con el perfil...')
    
    // Intentar actualizar metadata de Auth primero (esto siempre funciona)
    const { error: authError } = await supabase.auth.updateUser({
      data: { full_name: fullName }
    })

    if (authError) {
      toast.error('Error al actualizar identidad')
      return
    }

    // Intentar crear el perfil público (esto puede dar el error 42501 si no hay políticas)
    // Pero ahora lo intentaremos con un 'UPSERT' limpio
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        full_name: fullName,
        updated_at: new Date().toISOString()
      })

    if (profileError) {
      console.error('Error persistente en DB:', profileError)
      toast.error('Tu nombre se guardó en la sesión, pero la base de datos pública tiene los permisos cerrados.')
    } else {
      toast.success('¡Perfil reparado y sincronizado!')
    }

    await queryClient.invalidateQueries({ queryKey: ['user'] })
  }

  return { repair }
}
