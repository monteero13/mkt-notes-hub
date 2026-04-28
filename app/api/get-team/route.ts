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

    // 1. Obtener la membresía más reciente
    const { data: memberships, error: memberError } = await supabase
      .from('team_members')
      .select('team_id, role, teams(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (memberError) throw memberError
    
    if (!memberships || memberships.length === 0) {
      return NextResponse.json({ team: null })
    }

    const membership = memberships[0]

    // 2. Obtener los miembros (sin el join que falla)
    const { data: members, error: membersErr } = await supabase
      .from('team_members')
      .select('user_id, role')
      .eq('team_id', membership.team_id)

    if (membersErr) throw membersErr

    // 3. Obtener los perfiles manualmente para evitar el error PGRST200
    const userIds = members.map(m => m.user_id)
    const { data: profiles, error: profilesErr } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url')
      .in('id', userIds)

    if (profilesErr) throw profilesErr

    // 4. Juntar los datos
    const fullMembers = members.map(m => ({
      ...m,
      profiles: profiles.find(p => p.id === m.user_id) || null
    }))

    return NextResponse.json({
      team: {
        ...membership.teams,
        role: membership.role,
        members: fullMembers
      }
    })
  } catch (error: any) {
    console.error('Error en Get Team API Reparada:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
