import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data, error } = await supabase.from('campaigns').select('*').limit(1);
  if (data && data.length > 0) console.log('Columns:', Object.keys(data[0]));
  else {
    // Try to insert a row with just name and workspace_id
    const { data: ws } = await supabase.from('workspaces').select('id').limit(1).single();
    if (!ws) return;
    const { error: insError } = await supabase.from('campaigns').insert({ workspace_id: ws.id, name: 'Test' }).select().single();
    if (insError) console.log('Insert Error:', insError.message);
    else console.log('Insert worked, now checking columns...');
    const { data: d2 } = await supabase.from('campaigns').select('*').limit(1);
    if (d2) console.log('Columns:', Object.keys(d2[0]));
  }
}

check();
