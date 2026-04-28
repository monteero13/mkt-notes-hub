import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'Falta userId' }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // 1. Obtener la membresía (sin orden para evitar errores de columna)
    console.log('>>> [API/get-team] Buscando membresías para:', userId);
    const { data: memberships, error: memberError } = await supabase
      .from('team_members')
      .select('team_id, role')
      .eq('user_id', userId)

    if (memberError) {
      console.error('>>> [API/get-team] Error en team_members:', memberError);
      throw memberError;
    }
    
    if (!memberships || memberships.length === 0) {
      console.log('>>> [API/get-team] No se encontraron membresías');
      return NextResponse.json({ team: null })
    }

    const membership = memberships[0]
    console.log('>>> [API/get-team] Membresía encontrada:', membership);

    // 2. Obtener los detalles del equipo
    const { data: teamData, error: teamError } = await supabase
      .from('teams')
      .select('*')
      .eq('id', membership.team_id)
      .single()

    if (teamError) {
      console.error('>>> [API/get-team] Error en teams:', teamError);
      throw teamError;
    }

    // 3. Obtener los miembros
    const { data: members, error: membersErr } = await supabase
      .from('team_members')
      .select('user_id, role')
      .eq('team_id', membership.team_id)

    if (membersErr) throw membersErr

    // 4. Obtener los perfiles manualmente
    const userIds = members.map(m => m.user_id)
    const { data: profiles, error: profilesErr } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url')
      .in('id', userIds)

    if (profilesErr) throw profilesErr

    // 5. Juntar los datos
    const fullMembers = members.map(m => ({
      ...m,
      profiles: profiles.find(p => p.id === m.user_id) || null
    }))

    console.log('>>> [API/get-team] Equipo completo recuperado:', teamData.name);

    return NextResponse.json({
      team: {
        ...teamData,
        role: membership.role,
        members: fullMembers
      }
    })
  } catch (error: any) {
    console.error('Error en Get Team API Reparada:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
