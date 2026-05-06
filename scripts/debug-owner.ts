import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data } = await supabase.from('profiles').select('*').eq('id', 'c28bf3f7-048d-4a0d-9be4-2878f108dbc9').single();
  console.log(JSON.stringify(data, null, 2));
}

check();
