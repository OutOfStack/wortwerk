import { z } from 'zod';
import { failure, getUser, guardMutation, HttpError, json, readJson } from './auth';
import { WORDS } from '../public/vocabulary';

const score = z.number().int().min(0).max(100);
const counter = z.number().int().min(0).max(1_000_000_000);
const wordIds = new Set(WORDS.map(word => String(word.id)));
const wordId = z.string().refine(id => wordIds.has(id));
const rules = ['sein', 'present', 'articles', 'accusative', 'modal', 'wordorder', 'perfect', 'dative', 'because', 'comparative'];
export const progressSchema = z.object({
  xp: counter, answered: counter, correct: counter,
  wordMastery: z.record(wordId, score),
  wordCorrectCounts: z.record(wordId, z.number().int().min(0).max(8)).default({}),
  ruleMastery: z.record(z.string().refine(key => rules.includes(key)), score),
  streak: counter, sound: z.boolean(), activity: z.array(counter).length(7),
}).strict().refine(data => data.correct <= data.answered);
const payloadSchema = z.object({ userId: z.string().uuid(), revision: counter, progress: progressSchema }).strict();

export async function progressGet(db: D1Database, request: Request) {
  try {
    const user = await getUser(db, request);
    if (!user) throw new HttpError(401, 'Please sign in to load your progress.');
    const row = await db.prepare('SELECT payload, revision FROM learner_progress WHERE user_id = ?')
      .bind(user.id).first<{ payload: string; revision: number }>();
    return json({ userId: user.id, progress: row ? progressSchema.parse(JSON.parse(row.payload)) : null, revision: row?.revision || 0 });
  } catch (error) { return failure(error); }
}

export async function progressPost(db: D1Database, request: Request) {
  try {
    guardMutation(request);
    const user = await getUser(db, request);
    if (!user) throw new HttpError(401, 'Please sign in to save your progress.');
    const parsed = payloadSchema.safeParse(await readJson(request, 32_768));
    if (!parsed.success) throw new HttpError(400, 'Invalid progress data.');
    const { userId, revision, progress } = parsed.data;
    if (userId !== user.id) throw new HttpError(409, 'The signed-in account changed. Reload before continuing.');
    const payload = JSON.stringify(progress);
    const result = revision === 0
      ? await db.prepare(`INSERT INTO learner_progress (user_id, payload, updated_at, revision) VALUES (?, ?, ?, 1)
          ON CONFLICT(user_id) DO UPDATE SET payload = excluded.payload, updated_at = excluded.updated_at, revision = 1
          WHERE learner_progress.revision = 0`).bind(user.id, payload, Date.now()).run()
      : await db.prepare(`UPDATE learner_progress SET payload = ?, updated_at = ?, revision = revision + 1
          WHERE user_id = ? AND revision = ?`).bind(payload, Date.now(), user.id, revision).run();
    if (!result.meta.changes) throw new HttpError(409, 'Progress changed in another tab or device. Reload to use the latest saved progress.');
    return json({ saved: true, revision: revision + 1 });
  } catch (error) { return failure(error); }
}
