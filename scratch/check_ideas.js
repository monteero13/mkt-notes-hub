const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://txlbvdvadbakhprxxqqy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR4bGJ2ZHZhZGJha2hwcnh4cXF5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjE3MDA3NCwiZXhwIjoyMDkxNzQ2MDc0fQ.DVSKQGiNAPk1wOcRQIGq7-iAqiMS_meKhtKU2RvkSVQ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkIdeas() {
  console.log("Checking marketing_ideas...");
  const { data, error } = await supabase
    .from('marketing_ideas')
    .select('*');
  
  if (error) {
    console.error("Error reading ideas:", error);
  } else {
    console.log("Found ideas count:", data.length);
    console.log("Ideas:", JSON.stringify(data, null, 2));
  }

  console.log("\nChecking workspaces...");
  const { data: workspaces, error: wsError } = await supabase
    .from('workspaces')
    .select('*');
  
  if (wsError) {
    console.error("Error reading workspaces:", wsError);
  } else {
    console.log("Found workspaces count:", workspaces.length);
    console.log("Workspaces:", JSON.stringify(workspaces, null, 2));
  }
}

checkIdeas();
