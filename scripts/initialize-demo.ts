import { createClient } from '@supabase/supabase-js';
import { faker } from '@faker-js/faker';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function initializeDemo() {
  console.log('--- INITIALIZING DEMO DATA ---');

  const teamName = 'Las guapas de clase';
  let { data: workspace } = await supabase
    .from('workspaces')
    .select('*')
    .eq('name', teamName)
    .single();

  const workspaceId = workspace.id;

  // Sync Profiles
  const { data: profiles } = await supabase.from('profiles').select('id');
  for (const profile of profiles || []) {
    await supabase.from('workspace_members').upsert({
      workspace_id: workspaceId,
      user_id: profile.id,
      role: 'admin'
    }, { onConflict: 'workspace_id,user_id' });
  }
  const ownerId = profiles?.[0]?.id;

  // Clients
  const clients = [];
  for (let i = 0; i < 5; i++) {
    const { data: client } = await supabase.from('clients').insert({
      workspace_id: workspaceId,
      company_name: faker.company.name(),
      status: 'active'
    }).select().single();
    if (client) clients.push(client);
  }

  // Campaigns
  const campaigns = [];
  for (let i = 0; i < 4; i++) {
    const client = faker.helpers.arrayElement(clients);
    const { data: campaign, error } = await supabase.from('campaigns').insert({
      workspace_id: workspaceId,
      client_id: client?.id,
      owner_id: ownerId,
      name: `Campanya ${faker.commerce.productAdjective()} ${faker.word.noun()}`,
      status: 'active',
      channel: faker.helpers.arrayElement(['instagram', 'tiktok', 'linkedin'])
    }).select().single();
    if (error) console.error('Campaign Error:', error.message);
    if (campaign) campaigns.push(campaign);
  }

  // Tasks
  if (campaigns.length > 0) {
    for (let i = 0; i < 15; i++) {
      const campaign = faker.helpers.arrayElement(campaigns);
      const profile = faker.helpers.arrayElement(profiles || []);
      await supabase.from('tasks').insert({
        workspace_id: workspaceId,
        campaign_id: campaign.id,
        title: faker.hacker.phrase().substring(0, 50),
        status: faker.helpers.arrayElement(['todo', 'in_progress', 'done']),
        priority: faker.helpers.arrayElement(['high', 'medium', 'low']),
        assignee_id: profile.id
      });
    }

    // Analytics
    for (let i = 0; i < 30; i++) {
      const campaign = faker.helpers.arrayElement(campaigns);
      await supabase.from('analytics_snapshots').insert({
        workspace_id: workspaceId,
        campaign_id: campaign.id,
        metric_date: faker.date.recent({ days: 30 }).toISOString().split('T')[0],
        metrics: {
          impressions: faker.number.int({ min: 1000, max: 100000 }),
          reach: faker.number.int({ min: 800, max: 80000 }),
          engagement_rate: faker.number.float({ min: 0.01, max: 0.15 }),
          spend: faker.number.float({ min: 10, max: 500 }),
          revenue: faker.number.float({ min: 0, max: 2000 })
        }
      });
    }
  }

  // Content
  for (let i = 0; i < 10; i++) {
    await supabase.from('content_items').insert({
      workspace_id: workspaceId,
      title: faker.lorem.sentence(),
      status: 'drafting',
      channel: faker.helpers.arrayElement(['instagram', 'linkedin', 'tiktok']),
      scheduled_at: faker.date.future().toISOString()
    });
  }

  console.log('--- DEMO INITIALIZATION COMPLETE ---');
}

initializeDemo().catch(console.error);
