const fs = require('fs');
const path = require('path');

// Read .env file manually
const envPath = '/home/alberto/Documentos/Proyectos/mkt-notes-hub/.env';
console.log('Reading env from:', envPath);
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const [key, ...val] = line.split('=');
  if (key && val) {
    env[key.trim()] = val.join('=').trim().replace(/^["']|["']$/g, '');
  }
});

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error('Missing credentials in env');
  process.exit(1);
}

async function run() {
  console.log('Fetching workspaces...');
  const wsRes = await fetch(`${url}/rest/v1/workspaces?select=*`, {
    headers: {
      'apikey': key,
      'Authorization': `Bearer ${key}`
    }
  });
  const workspaces = await wsRes.json();
  if (!workspaces || workspaces.length === 0) {
    console.error('No workspaces found to link tasks to.');
    return;
  }
  
  // Choose the first workspace (Agencia) as the target
  const targetWorkspace = workspaces[0];
  console.log(`Target workspace for migration: "${targetWorkspace.name}" (ID: ${targetWorkspace.id})`);

  console.log('\nChecking for orphaned tasks (workspace_id IS NULL)...');
  const orphanedRes = await fetch(`${url}/rest/v1/tasks?workspace_id=is.null&select=id,title`, {
    headers: {
      'apikey': key,
      'Authorization': `Bearer ${key}`
    }
  });
  const orphanedTasks = await orphanedRes.json();
  console.log(`Found ${orphanedTasks.length} orphaned tasks.`);

  if (orphanedTasks.length === 0) {
    console.log('No orphaned tasks found. Everything is already linked!');
    return;
  }

  console.log('\nUpdating orphaned tasks...');
  const updateRes = await fetch(`${url}/rest/v1/tasks?workspace_id=is.null`, {
    method: 'PATCH',
    headers: {
      'apikey': key,
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    },
    body: JSON.stringify({
      workspace_id: targetWorkspace.id
    })
  });

  if (updateRes.status !== 200 && updateRes.status !== 204) {
    console.error('Error updating tasks:', updateRes.status, await updateRes.text());
  } else {
    const updated = await updateRes.json();
    console.log(`✅ Successfully updated ${updated.length} tasks and linked them to workspace "${targetWorkspace.name}"!`);
  }
}

run().catch(console.error);
