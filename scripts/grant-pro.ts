import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join } from 'path'

// Manual env parsing
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

async function grantPro(email: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase credentials in .env')
    return
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  console.log(`Buscando usuario: ${email}...`)
  
  const { data: { users }, error: listError } = await supabase.auth.admin.listUsers()
  if (listError) throw listError

  const user = users.find(u => u.email === email)
  if (!user) {
    console.error(`Usuario ${email} no encontrado.`)
    return
  }

  console.log(`Usuario encontrado. Otorgando acceso PRO...`)

  const { error } = await supabase
    .from('profiles')
    .update({ is_pro: true })
    .eq('id', user.id)

  if (error) {
    console.error('Error actualizando perfil:', error)
  } else {
    console.log(`¡Éxito! ${email} ahora tiene acceso PRO ilimitado.`)
  }
}

const targetEmail = process.argv[2]
if (!targetEmail) {
  console.error('Uso: npx tsx scripts/grant-pro.ts usuario@email.com')
} else {
  grantPro(targetEmail)
}
