import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join } from 'path'

function loadEnv() {
  try {
    const envPath = join(process.cwd(), '.env')
    const envFile = readFileSync(envPath, 'utf-8')
    envFile.split('\n').forEach(line => {
      const [key, ...value] = line.split('=')
      if (key && value) {
        process.env[key.trim()] = value.join('=').trim()
      }
    })
  } catch (e) {
    console.warn('Could not load .env file manually')
  }
}

loadEnv()

async function checkSchema() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase credentials in .env')
    return
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  console.log('Buscando un usuario real...')
  const { data: { users } } = await supabase.auth.admin.listUsers()
  const realUser = users[0]
  
  if (!realUser) {
    console.error('No hay usuarios en la DB')
    return
  }

  const columnsToTest = ['due_date', 'assignees', 'category_color', 'category_name', 'description']
  
  for (const col of columnsToTest) {
    console.log(`Probando columna: ${col}...`)
    const { error } = await supabase.from('tasks').insert({
        title: 'Test Col',
        user_id: realUser.id,
        [col]: col === 'assignees' ? [] : 'test'
    })

    if (error && error.message.includes(`'${col}' column`)) {
        console.log(`❌ NO EXISTE: ${col}`)
    } else {
        console.log(`✅ EXISTE: ${col}`)
        await supabase.from('tasks').delete().eq('title', 'Test Col')
    }
  }
}

checkSchema()
