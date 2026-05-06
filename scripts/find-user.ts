import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function find() {
  const email = '13albertomontero@gmail.com';
  
  // Try to find in workspace_invites
  const { data: invites } = await supabase.from('workspace_invites').select('*').eq('email', email);
  if (invites && invites.length > 0) {
    console.log('Invites found:', invites);
  } else {
    console.log('No invites found for this email.');
  }

  // Try to find in all profiles by checking if there's any way to see email
  // Actually, I'll just list all profiles and their names
  const { data: profiles } = await supabase.from('profiles').select('id, full_name');
  console.log('All profiles:', profiles);
}

find();
