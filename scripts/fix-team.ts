import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function fix() {
  const userEmail = '13albertomontero@gmail.com';
  
  // 1. Find the owner profile
  const { data: ownerProfile, error: pError } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', userEmail)
    .single();

  if (pError) {
    console.error('Owner profile not found by email, trying auth.users...');
    // We can't query auth.users easily without admin client, but let's assume it's there
    return;
  }

  const ownerId = ownerProfile.id;
  console.log('Owner ID:', ownerId);

  // 2. Find or create the workspace
  const teamName = 'Las guapas de clase';
  let { data: workspace } = await supabase
    .from('workspaces')
    .select('*')
    .eq('name', teamName)
    .single();

  if (!workspace) {
    console.log('Creating workspace...');
    const { data: newWs, error: cwsError } = await supabase
      .from('workspaces')
      .insert({ 
        name: teamName, 
        slug: 'las-guapas-de-clase',
        owner_id: ownerId
      })
      .select()
      .single();
    if (cwsError) { console.error(cwsError); return; }
    workspace = newWs;
  } else {
    // Ensure owner is correct
    console.log('Updating workspace owner...');
    await supabase.from('workspaces').update({ owner_id: ownerId }).eq('id', workspace.id);
  }

  const workspaceId = workspace.id;

  // 3. Add ALL profiles as admins
  const { data: allProfiles } = await supabase.from('profiles').select('id');
  console.log(`Adding ${allProfiles?.length} members to workspace...`);
  
  for (const p of allProfiles || []) {
    const { error } = await supabase.from('workspace_members').upsert({
      workspace_id: workspaceId,
      user_id: p.id,
      role: 'admin',
      is_active: true
    }, { onConflict: 'workspace_id,user_id' });
    
    if (error) console.error(`Error adding ${p.id}:`, error.message);
  }

  // Ensure the owner IS the owner in workspace_members too
  await supabase.from('workspace_members').update({ role: 'owner' }).eq('workspace_id', workspaceId).eq('user_id', ownerId);

  console.log('--- DONE ---');
}

fix();
