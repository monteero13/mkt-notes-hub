import { cpSync, mkdirSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

// Create Vercel Build Output API structure
const outputDir = '.vercel/output';

// Clean and create directories
mkdirSync(`${outputDir}/static`, { recursive: true });
mkdirSync(`${outputDir}/functions/index.func`, { recursive: true });

// 1. Copy static client assets
cpSync('dist/client', `${outputDir}/static`, { recursive: true });

// 2. Copy server bundle into the function directory
cpSync('dist/server', `${outputDir}/functions/index.func`, { recursive: true });

// 3. Create the Edge Function entry point that wraps server.js
writeFileSync(`${outputDir}/functions/index.func/index.js`, `
import server from './server.js';
export default async function handler(request, context) {
  return await server.fetch(request);
}
`);

// 4. Function config — Edge runtime (server.js uses Web Fetch API)
writeFileSync(`${outputDir}/functions/index.func/.vc-config.json`, JSON.stringify({
  runtime: 'edge',
  entrypoint: 'index.js'
}, null, 2));

// 5. Global routing config
writeFileSync(`${outputDir}/config.json`, JSON.stringify({
  version: 3,
  routes: [
    // Serve static assets first (CSS, JS, images)
    { handle: 'filesystem' },
    // Everything else goes to the SSR function
    { src: '/(.*)', dest: '/index' }
  ]
}, null, 2));

console.log('✅ Vercel Build Output API structure created');
