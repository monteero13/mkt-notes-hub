const supabaseUrl = 'https://txlbvdvadbakhprxxqqy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR4bGJ2ZHZhZGJha2hwcnh4cXF5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjE3MDA3NCwiZXhwIjoyMDkxNzQ2MDc0fQ.DVSKQGiNAPk1wOcRQIGq7-iAqiMS_meKhtKU2RvkSVQ';

async function checkDatabase() {
  console.log("Fetching workspace_members via PostgREST API...");
  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/workspace_members?select=*`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    });
    if (!res.ok) {
      throw new Error(`HTTP error ${res.status}: ${await res.text()}`);
    }
    const members = await res.json();
    console.log(`\nFound workspace_members count: ${members.length}`);
    console.log("Members:", JSON.stringify(members, null, 2));
  } catch (error) {
    console.error("Error reading members:", error);
  }
}

checkDatabase();
