import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data, error } = await supabase.rpc('get_table_columns', { table_name: 'clients' });
  if (error) {
    console.log('RPC get_table_columns failed, trying direct query if possible...');
    // If RPC doesn't exist, we can't easily query information_schema via supabase-js without an RPC
    // Let's try to select 1 row and see keys again
    const { data: d2 } = await supabase.from('clients').select('*').limit(1);
    if (d2 && d2.length > 0) console.log('Columns:', Object.keys(d2[0]));
    else console.log('Table empty or select failed.');
  } else {
    console.log('Columns:', data);
  }
}

check();
