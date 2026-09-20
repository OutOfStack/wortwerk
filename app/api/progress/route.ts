import { env } from "cloudflare:workers";
import { progressGet, progressPost } from '@/lib/progress';
export const dynamic = "force-dynamic";
export async function GET(request: Request) { return progressGet(env.DB, request); }
export async function POST(request: Request) {
  return progressPost(env.DB, request);
}
