import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// Usamos la Service Role Key para asegurar que la creación nunca falle por RLS en el primer guardado
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { type, data, userId, teamId } = body

    let table = ''
    let insertData = { ...data, user_id: userId, team_id: teamId }

    switch (type) {
      case 'campaign': table = 'campaigns'; break;
      case 'content': table = 'content'; break;
      case 'idea': table = 'ideas'; break;
      case 'objective': table = 'objectives'; break;
      default: throw new Error('Tipo de entidad no válido');
    }

    console.log(`>>> [API Service] Creando ${type} para usuario ${userId}`);

    // Validación de plan gratuito para campañas
    if (type === 'campaign') {
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('is_pro')
        .eq('id', userId)
        .single()

      if (!profile?.is_pro) {
        const { count, error: countError } = await supabaseAdmin
          .from('campaigns')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId)

        if (count && count >= 1) {
          console.log(`>>> [API Service] Límite de campaña alcanzado para usuario gratuito: ${userId}`);
          return NextResponse.json({ error: 'Límite alcanzado. Actualiza a PRO para crear más campañas.' }, { status: 403 })
        }
      }
    }

    const { data: created, error } = await supabaseAdmin
      .from(table)
      .insert(insertData)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, item: created })
  } catch (error: any) {
    console.error('>>> [API Service] ERROR:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
