import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function fixRls() {
  console.log('Aplicando políticas RLS para task_categories...')
  
  const sql = `
    -- Activar RLS
    ALTER TABLE public.task_categories ENABLE ROW LEVEL SECURITY;

    -- Eliminar políticas existentes si las hay
    DROP POLICY IF EXISTS "Users can view their categories" ON public.task_categories;
    DROP POLICY IF EXISTS "Users can create their categories" ON public.task_categories;
    DROP POLICY IF EXISTS "Users can delete their categories" ON public.task_categories;

    -- Crear nuevas políticas
    CREATE POLICY "Users can view their categories" ON public.task_categories 
    FOR SELECT USING (auth.uid() = user_id OR public.check_team_membership(team_id, auth.uid()));

    CREATE POLICY "Users can create their categories" ON public.task_categories 
    FOR INSERT WITH CHECK (auth.uid() = user_id);

    CREATE POLICY "Users can delete their categories" ON public.task_categories 
    FOR DELETE USING (auth.uid() = user_id OR (SELECT created_by FROM teams WHERE id = team_id) = auth.uid());
  `;

  // We can't run raw SQL via the JS client easily unless we have a function.
  // But we can try to use the 'rpc' method if there's an exec function, 
  // or I'll just explain to the user they need to run it in the SQL editor.
  
  console.log('POLÍTICA SQL A EJECUTAR:')
  console.log(sql)
}

fixRls()
