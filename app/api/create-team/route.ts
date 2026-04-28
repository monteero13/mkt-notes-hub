import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  console.log('>>> [API] Iniciando creación de equipo...');
  try {
    const { name, userId } = await request.json()
    console.log('>>> [API] Datos recibidos:', { name, userId });

    if (!name || !userId) {
      console.error('>>> [API] Error: Faltan campos obligatorios');
      return NextResponse.json({ error: 'Faltan datos' }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Verificar si es PRO
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_pro')
      .eq('id', userId)
      .single()

    if (!profile?.is_pro) {
      console.error('>>> [API] Error: Usuario no es PRO');
      return NextResponse.json({ error: 'La creación de equipos es una función PRO' }, { status: 403 })
    }

    // 1. Crear el Equipo
    console.log('>>> [API] Insertando en tabla teams...');
    const { data: team, error: teamError } = await supabase
      .from('teams')
      .insert({ 
        name, 
        created_by: userId 
      })
      .select()
      .single()

    if (teamError) {
      console.error('>>> [API] Error en teams insert:', teamError);
      throw teamError;
    }
    console.log('>>> [API] Equipo creado:', team.id);

    // 2. Asignar como Líder
    console.log('>>> [API] Asignando líder en team_members...');
    const { error: memberError } = await supabase
      .from('team_members')
      .insert({
        team_id: team.id,
        user_id: userId,
        role: 'owner'
      })

    if (memberError) {
      console.error('>>> [API] Error en team_members insert:', memberError);
      throw memberError;
    }
    console.log('>>> [API] Líder asignado con éxito');

    return NextResponse.json({ success: true, team })
  } catch (error: any) {
    console.error('>>> [API] ERROR CRÍTICO:', error)
    return NextResponse.json({ error: error.message || 'Error interno del servidor' }, { status: 500 })
  }
}
