import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data, error } = await supabase.from('clients').select('*').limit(1);
  if (data && data.length > 0) {
    console.log('Clients columns:', Object.keys(data[0]));
  } else if (data) {
    console.log('Clients table is empty, checking columns via RPC or metadata...');
    // If empty, I'll try to insert a dummy and see errors or use another way
    const { error: insError } = await supabase.from('clients').insert({ workspace_id: '00000000-0000-0000-0000-000000000000' });
    console.log('Insert error hints:', insError?.message);
  }
  if (error) console.error('Error:', error);
}

check();
