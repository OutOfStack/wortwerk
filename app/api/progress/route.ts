import { env } from "cloudflare:workers";
import { getChatGPTUser } from "../../chatgpt-auth";
export const dynamic = "force-dynamic";
export async function GET() {
  const user = await getChatGPTUser();
  if (!user) return Response.json({ authenticated: false }, { status: 401 });
  try { const row = await env.DB.prepare("SELECT payload FROM learner_progress WHERE user_id = ?").bind(user.userId).first<{payload: string}>(); return Response.json({ authenticated: true, progress: row ? JSON.parse(row.payload) : null }); }
  catch (error) { console.error("progress_load_failed", error); return Response.json({ error: "Progress is temporarily unavailable." }, { status: 503 }); }
}
export async function POST(request: Request) {
  const user = await getChatGPTUser();
  if (!user) return Response.json({ error: "Sign in required." }, { status: 401 });
  try { const progress = await request.json(); const payload = JSON.stringify(progress); if (payload.length > 100000) return Response.json({ error: "Progress payload is too large." }, { status: 413 }); await env.DB.prepare("INSERT INTO learner_progress (user_id, payload, updated_at) VALUES (?, ?, ?) ON CONFLICT(user_id) DO UPDATE SET payload = excluded.payload, updated_at = excluded.updated_at").bind(user.userId, payload, Date.now()).run(); return Response.json({ saved: true }); }
  catch (error) { console.error("progress_save_failed", error); return Response.json({ error: "Progress could not be saved." }, { status: 503 }); }
}
