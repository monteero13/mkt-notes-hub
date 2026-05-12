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
  console.log('Workspaces found:', workspaces.length);
  for (const ws of workspaces) {
    console.log(`- Workspace ID: ${ws.id}, Name: ${ws.name}, Plan: ${ws.plan}`);
  }

  console.log('\nFetching task count in total...');
  const taskCountRes = await fetch(`${url}/rest/v1/tasks?select=id`, {
    method: 'HEAD',
    headers: {
      'apikey': key,
      'Authorization': `Bearer ${key}`,
      'Prefer': 'count=exact'
    }
  });
  console.log('Total tasks count:', taskCountRes.headers.get('content-range'));

  console.log('\nFetching sample tasks...');
  const tasksRes = await fetch(`${url}/rest/v1/tasks?select=*,assignee:profiles(*)&limit=5`, {
    headers: {
      'apikey': key,
      'Authorization': `Bearer ${key}`
    }
  });
  if (tasksRes.status !== 200) {
    console.error('Error fetching tasks:', tasksRes.status, await tasksRes.text());
  } else {
    const tasks = await tasksRes.json();
    console.log('Sample tasks found:', tasks.length);
    tasks.forEach(t => {
      console.log(`- Task ID: ${t.id}, Title: ${t.title}, Workspace ID: ${t.workspace_id}, Status: ${t.status}`);
    });
  }
}

run().catch(console.error);
