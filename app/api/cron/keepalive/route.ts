import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  // Opcional: Proteger la ruta con una clave secreta si estás en Vercel
  const authHeader = request.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('No autorizado', { status: 401 });
  }

  const supabase = createSupabaseAdminClient();

  try {
    // Consulta extremadamente ligera solo para evitar que la BD se ponga en pausa
    const { data, error } = await supabase.from('profiles').select('id').limit(1);
    
    if (error) throw error;
    
    return NextResponse.json({ 
      status: 'OK', 
      message: 'Ping a Supabase realizado con éxito (Keep-Alive)',
      timestamp: new Date().toISOString() 
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
