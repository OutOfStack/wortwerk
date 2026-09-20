import { env } from 'cloudflare:workers';
import { authGet, authPost } from '@/lib/auth-handlers';
export const dynamic = 'force-dynamic';
export async function POST(request: Request) {
  return authPost(env.DB, request, new URL(request.url).pathname.split('/').pop() || '');
}
export async function GET(request: Request) {
  if (new URL(request.url).pathname !== '/api/auth/me') return new Response(null, { status: 404 });
  return authGet(env.DB, request);
}
