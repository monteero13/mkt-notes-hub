import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function syncTeam() {
  console.log('--- Syncing Team: Las guapas de clase ---');

  // 1. Get or Create Workspace
  const teamName = 'Las guapas de clase';
  let { data: workspace, error: wsError } = await supabase
    .from('workspaces')
    .select('*')
    .eq('name', teamName)
    .single();

  if (wsError && wsError.code === 'PGRST116') {
    console.log('Creating workspace:', teamName);
    const { data: newWs, error: createWsError } = await supabase
      .from('workspaces')
      .insert({ name: teamName, slug: 'las-guapas-de-clase', plan: 'pro' })
      .select()
      .single();
    
    if (createWsError) {
      console.error('Error creating workspace:', createWsError);
      return;
    }
    workspace = newWs;
  } else if (wsError) {
    console.error('Error fetching workspace:', wsError);
    return;
  }

  console.log('Workspace ID:', workspace.id);

  // 2. Get All Profiles
  const { data: profiles, error: pError } = await supabase
    .from('profiles')
    .select('id, email');

  if (pError) {
    console.error('Error fetching profiles:', pError);
    return;
  }

  console.log(`Found ${profiles?.length} profiles.`);

  // 3. Add all to workspace_members
  for (const profile of profiles || []) {
    const { data: existing, error: checkError } = await supabase
      .from('workspace_members')
      .select('*')
      .eq('workspace_id', workspace.id)
      .eq('user_id', profile.id)
      .single();

    if (!existing) {
      console.log(`Adding ${profile.email} to team...`);
      const { error: insertError } = await supabase
        .from('workspace_members')
        .insert({
          workspace_id: workspace.id,
          user_id: profile.id,
          role: 'admin' // Giving admin for now to all as it's a "team of equals"
        });
      
      if (insertError) console.error(`Error adding ${profile.email}:`, insertError);
    } else {
      console.log(`${profile.email} already in team.`);
    }
  }

  console.log('--- Team Sync Complete ---');
  return workspace.id;
}

syncTeam();
