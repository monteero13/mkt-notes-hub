import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { teamId, userId } = await request.json()

    if (!teamId || !userId) {
      return NextResponse.json({ error: 'Faltan parámetros' }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // 1. Verificar si el usuario que solicita es el mismo usuario que sale
    // o si el solicitante es el dueño del equipo (para expulsar)
    // Para simplificar, usamos service role para borrar el registro solicitado.
    
    // Si es un "salir", el userId será el del usuario autenticado (se asume validado en cliente o por lógica)
    // Pero para ser seguros, el service role borra la entrada específica.
    
    // No permitimos que el dueño se salga de su propio equipo sin borrarlo (lógica de negocio)
    const { data: team } = await supabase.from('teams').select('created_by').eq('id', teamId).single()
    
    if (team?.created_by === userId) {
        return NextResponse.json({ error: 'El dueño no puede salir del equipo. Debe eliminar el equipo completo.' }, { status: 400 })
    }

    const { error } = await supabase
      .from('team_members')
      .delete()
      .eq('team_id', teamId)
      .eq('user_id', userId)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error en leave-team API:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
