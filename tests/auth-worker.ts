import { authGet, authPost } from '../lib/auth-handlers';
import { progressGet, progressPost } from '../lib/progress';
export default {
  async fetch(request: Request, env: { DB: D1Database }) {
    const path = new URL(request.url).pathname;
    if (path === '/api/progress') return request.method === 'GET' ? progressGet(env.DB, request) : progressPost(env.DB, request);
    return request.method === 'GET' ? authGet(env.DB, request) : authPost(env.DB, request, path.split('/').pop() || '');
  },
};
