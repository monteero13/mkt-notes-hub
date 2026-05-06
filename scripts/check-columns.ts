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

async function checkSchema() {
  console.log('Verificando columnas de la tabla tasks...')
  const { data: test, error: err3 } = await supabase.from('tasks').select('*').limit(1)
  if (err3) {
    console.error('Error total:', err3)
  } else if (test && test.length > 0) {
    console.log('Columnas encontradas vía keys:', Object.keys(test[0]))
  } else {
    // If table is empty, we use information_schema (assuming service role has access)
    const { data: cols, error: err2 } = await supabase
      .from('columns') // Direct view if exposed
      .select('column_name')
      .eq('table_name', 'tasks')
      .eq('table_schema', 'public')
    
    if (err2) {
      console.log('No se pudo determinar el esquema. Falló consulta directa e info_schema.')
    } else {
      console.log('Columnas encontradas via info_schema:', cols.map(c => c.column_name))
    }
  }
}

checkSchema()
