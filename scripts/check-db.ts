import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data: profiles, error: pError } = await supabase.from('profiles').select('*');
  console.log('Profiles:', profiles?.length, pError || '');
  
  const { data: workspaces, error: wError } = await supabase.from('workspaces').select('*');
  console.log('Workspaces:', workspaces?.length, wError || '');
}

check();
