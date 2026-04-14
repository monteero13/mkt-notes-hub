
import server from './server.js';
export default async function handler(request, context) {
  return await server.fetch(request);
}
