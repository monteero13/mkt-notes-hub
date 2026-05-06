import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data: ws } = await supabase.from('workspaces').select('id').limit(1).single();
  if (!ws) return;

  const { data, error } = await supabase.from('clients').insert({
    workspace_id: ws.id,
    company_name: 'Test Corp',
    contact_email: 'test@example.com'
  }).select();
  
  if (error) console.error('Error:', error.message);
  else console.log('Success:', data);
}

check();
