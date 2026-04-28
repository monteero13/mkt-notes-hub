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

async function setupStorage() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase credentials in .env')
    return
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  const BUCKETS = [
    { name: 'avatars', config: { public: true, fileSizeLimit: 1024 * 1024 * 2, allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp'] } },
    { name: 'resources', config: { public: true, fileSizeLimit: 1024 * 1024 * 10, allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp', 'application/pdf'] } }
  ]
  
  const { data: buckets, error: listError } = await supabase.storage.listBuckets()
  
  if (listError) {
    console.error('Error listing buckets:', listError)
    return
  }

  for (const bucketDef of BUCKETS) {
    const exists = buckets.find(b => b.name === bucketDef.name)
    if (!exists) {
      console.log(`Bucket "${bucketDef.name}" not found. Creating...`)
      const { error } = await supabase.storage.createBucket(bucketDef.name, bucketDef.config)
      if (error) console.error(`Error creating bucket ${bucketDef.name}:`, error)
      else console.log(`Bucket "${bucketDef.name}" created successfully!`)
    } else {
      console.log(`Bucket "${bucketDef.name}" already exists.`)
    }
  }
}

setupStorage()
