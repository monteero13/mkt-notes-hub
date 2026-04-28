import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')

    if (!code) {
      return NextResponse.json({ error: 'Falta código de invitación' }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Bypass RLS para obtener el equipo por código de invitación
    // Como el código real puede ser simplemente el inicio del UUID (ej. 63d6c6ad),
    // probamos buscando por id si el código no está en una columna invite_code.
    
    // Primero, verificamos si existe la columna invite_code
    let teamData = null;
    
    const { data: inviteData, error: inviteError } = await supabase
      .from('teams')
      .select('id, name, invite_code')
      .eq('invite_code', code)
      .single()
      
    if (!inviteError && inviteData) {
      teamData = inviteData;
    } else {
      // Si falla (probablemente porque invite_code no existe), buscamos por ID truncado.
      // Ya que no podemos hacer .ilike() directo sobre un tipo UUID en PostgREST sin castear.
      const { data: allTeams, error: allTeamsError } = await supabase
        .from('teams')
        .select('id, name')
        
      if (!allTeamsError && allTeams) {
        teamData = allTeams.find(t => t.id.startsWith(code));
      }
    }

    if (!teamData) {
      return NextResponse.json({ error: 'Enlace inválido o equipo no encontrado' }, { status: 404 })
    }

    return NextResponse.json({ team: teamData })
  } catch (error: any) {
    console.error('Error en invite-info API:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
