import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join } from 'path'

// Manual env parsing to avoid dotenv dependency
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

async function confirmUser(email: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase credentials in .env')
    return
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })

  console.log(`Searching for user with email: ${email}...`)
  
  const { data: { users }, error: listError } = await supabase.auth.admin.listUsers()
  
  if (listError) {
    console.error('Error listing users:', listError)
    return
  }

  const user = users.find(u => u.email === email)

  if (!user) {
    console.error(`User ${email} not found.`)
    return
  }

  console.log(`User found (ID: ${user.id}). Confirming...`)

  const { data, error } = await supabase.auth.admin.updateUserById(user.id, {
    email_confirm: true
  })

  if (error) {
    console.error('Error confirming user:', error)
  } else {
    console.log(`User ${email} confirmed successfully! You can now log in.`)
  }
}

const targetEmail = process.argv[2]
if (!targetEmail) {
  console.error('Please provide an email: npx tsx scripts/confirm-user.ts user@example.com')
} else {
  confirmUser(targetEmail)
}
