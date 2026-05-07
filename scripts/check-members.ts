import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  console.log('--- Workspaces ---');
  const { data: ws, error: wsErr } = await supabase.from('workspaces').select('*');
  if (wsErr) {
    console.error('Workspaces query failed:', wsErr.message);
  } else {
    console.log('Workspaces inside DB:', ws);
  }

  console.log('--- Workspace Members ---');
  const { data: members, error: mErr } = await supabase.from('workspace_members').select('*');
  if (mErr) {
    console.error('Workspace Members query failed:', mErr.message);
  } else {
    console.log('Workspace Members inside DB:', members);
  }
}

check();
