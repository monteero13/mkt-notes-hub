import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

// Manual .env parsing
const envPath = path.resolve(process.cwd(), '.env')
const envContent = fs.readFileSync(envPath, 'utf8')
const env: Record<string, string> = {}
envContent.split('\n').forEach(line => {
  const [key, ...val] = line.split('=')
  if (key && val) env[key.trim()] = val.join('=').trim().replace(/^["']|["']$/g, '')
})

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Faltan variables de entorno en .env')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkCategoriesSchema() {
  console.log('--- Verificando esquema de la tabla task_categories ---')
  
  // Try querying information_schema columns
  const { data: cols, error: err } = await supabase
    .rpc('get_table_columns', { p_table_name: 'task_categories' }) // if helper exists
    .select('*')
    
  // Let's do a direct select and examine empty result metadata or insert attempt
  const { data: test, error: selectErr } = await supabase.from('task_categories').select('*').limit(1)
  
  if (selectErr) {
    console.error('Error al consultar la tabla task_categories:', selectErr)
  } else {
    console.log('Tabla task_categories accesible.')
    if (test && test.length > 0) {
      console.log('Columnas encontradas via keys:', Object.keys(test[0]))
    } else {
      console.log('La tabla está vacía. Vamos a intentar hacer una consulta cruda para obtener los nombres de columnas de la tabla:')
      
      // Let's query information_schema.columns directly via postgrest if allowed
      const { data: colData, error: colErr } = await supabase
        .from('columns') // view if exposed
        .select('column_name')
        .eq('table_name', 'task_categories')
      
      if (colErr) {
        console.log('No se pudo acceder a view "columns" directamente:', colErr.message)
      } else if (colData) {
        console.log('Columnas encontradas via info_schema:', colData.map((c: any) => c.column_name))
      }
    }
  }

  // Let's run a test insert with service role (bypass RLS) to see if it succeeds or what constraint fails!
  console.log('\n--- Probando insert con Service Role (Bypassing RLS) ---')
  const { data: insData, error: insErr } = await supabase
    .from('task_categories')
    .insert([{
      name: 'Test Category',
      color: '#7C3AED',
      workspace_id: '00000000-0000-0000-0000-000000000000', // dummy uuid or null
      user_id: '00000000-0000-0000-0000-000000000000'
    }])
    .select()

  if (insErr) {
    console.error('El insert con Service Role falló:', insErr)
  } else {
    console.log('El insert con Service Role fue EXITOSO:', insData)
    // Clean up test insert
    if (insData && insData[0]?.id) {
      await supabase.from('task_categories').delete().eq('id', insData[0].id)
      console.log('Fila de prueba eliminada.')
    }
  }
}

checkCategoriesSchema()
