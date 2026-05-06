import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

const envPath = path.resolve(process.cwd(), '.env')
const envContent = fs.readFileSync(envPath, 'utf8')
const env: Record<string, string> = {}
envContent.split('\n').forEach(line => {
  const [key, ...val] = line.split('=')
  if (key && val) env[key.trim()] = val.join('=').trim().replace(/^["']|["']$/g, '')
})

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl!, supabaseServiceKey!)

async function run() {
  console.log("Testeando update...");
  
  // Vamos a intentar hacer un update falso para ver el error exacto
  const { data: task, error: err1 } = await supabase.from('tasks').select('id, status').limit(1).single();
  if (err1) {
    console.error("No tasks found", err1);
    return;
  }
  
  console.log("Found task:", task);
  
  const { error: err2 } = await supabase.from('tasks').update({ status: 'review' }).eq('id', task.id);
  if (err2) {
    console.error("Error updating to review:", err2);
  } else {
    console.log("Update to review successful!");
    // revert
    await supabase.from('tasks').update({ status: task.status }).eq('id', task.id);
  }
}

run()
