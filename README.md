# Wortwerk

An early German A1–A2 practice app with English instructions.

## What is implemented

- German → English and English → German multiple-choice vocabulary exercises.
- English → German typed recall, letter-building and noun-article (der/die/das) exercises.
- 1,194 vocabulary entries across 28 topics and 24 grammar topics with 20–80 exercises per round,
  drawn from a bank of 2,328 grammar exercises.
- Randomized multiple-choice answers use the same part of speech, preferring the same topic and level.
- Per-word progress: eight correct answers retire a word from normal practice.
- “I know this” hides a word without awarding XP; restore it under Progress → Words marked known.
- Vocabulary accepts optional articles, capitalization and alternative umlaut spellings.
- Grammar completion at a topic-specific rolling target of at least 87.5%, with saved exercise positions.
- Grammar theory, translated examples, tables and common mistakes.
- XP-based levels (1 XP chosen, 2 XP typed) with 27 ranks named after materials, Holz 1 → Diamant 3, capped at 474,743 XP.
- A Help page explaining scoring, XP, levels, shortcuts, pronunciation and streaks.
- Email/password registration, sign-in, sign-out and account-specific progress in Cloudflare D1.
- Grammar answers by choosing or typing; feedback shows the completed sentence.
- Keyboard shortcuts: 1–9 answer, Enter continues, typed letters and Backspace
  in letter-building. Letter tiles also have Undo and Clear.
- Guided practice above the homepage stats revisits up to four practised words, then adds new A1 words before A2.
- End-of-round review and targeted retry of missed words and sentences. Grammar retries earn XP without changing assessment history or the saved exercise position.
- Word search (ignores articles, case and umlaut spelling) with per-word status.
- Daily streak and a last-7-days chart based on local calendar days.
- A responsive interface for phones and desktops; answer feedback stays in view.

- Pronunciation through the browser's built-in speech synthesis (German voice).
- English translation of grammar sentences on request, after answering.

This is a prototype, not a complete A1/A2 curriculum.

## Pronunciation

Speaker buttons read German aloud with the Web Speech API (`speechSynthesis`):
no API key, server or audio files. They appear next to German prompts, answer
feedback, search results, known words, mistake reviews and theory examples.
English prompts never get a button, so listening cannot reveal a typed answer.
After each answer the word (with its article) or the completed sentence is read
automatically; the 🔊/🔇 button in the top bar toggles this and is saved as the
existing `sound` progress field. Isolated grammar forms are not read out of
context.

The app prefers a de-DE voice whose name suggests higher quality (online,
natural or Google voices), then any de-DE voice, then other German variants.
Quality depends on the device. Speech controls are hidden when the browser has
no speech synthesis or lists voices but none in German.

## Translation

After a grammar answer, a small **EN** button next to the completed sentence
shows it in English. It appears only after answering, so the translation cannot
hint at the answer. Chrome 138+ on desktop translates on the device with the
built-in [Translator API](https://developer.chrome.com/docs/ai/translator-api)
(the first use downloads a de→en language pack); results are cached for the
session. Other browsers get an **EN ↗** link that opens Google Translate in a new
tab, as does Chrome if the language pack cannot be downloaded. Nothing is sent
anywhere until the learner asks.

## XP and practice ranks

A correct answer earns **1 XP** when it is chosen from options or built from
given letters, and **2 XP** when it is typed (vocabulary recall or grammar in
Type mode). Wrong answers and “I know this” earn nothing. A word retires after
eight correct answers, three of which are typed, so a new word earns up to
11 XP. `XP_VERSION` stays at 2: stored totals are not changed, and old open tabs
simply keep awarding 1 XP until they reload.

Level 1 starts at 0 XP. Reaching Level 2 takes 30 XP; each subsequent step costs
40% more than the previous one, rounded to a whole XP: 30, 42, 59, 83, 116, and
so on. Total thresholds begin at 0, 30, 72, 131, 214 and 330 XP. XP carries over
on promotion. The ladder ends at **Level 27 (474,743 XP)**: after that, no next
requirement is shown and total XP keeps counting.

The 27 ranks are nine materials — Holz, Stein, Kupfer, Bronze, Eisen, Silber,
Gold, Platin, Diamant — with three steps each, shown with their English meaning
on the Progress page.

With the current content, learning every word (1,194 × 11 = 13,134 XP) plus one
perfect grammar round of every topic (1,500 XP choosing, up to 2,804 XP typing)
reaches Level 16 (Silber 1). Grammar topics can be repeated for further XP.

The Help page (sidebar → Help) explains XP, levels, scoring, typing rules,
keyboard shortcuts, pronunciation, streaks and saving, so practice screens stay
free of that text.
Ranks measure practice, not CEFR proficiency; A1/A2 labels describe content only.

Historical XP is converted once at 10:1, rounded down, and marked `xpVersion: 2`.
Account progress upgrades on read and is persisted with the next save; guest
progress upgrades in browser storage. Word counts, mastery, and answer history
are preserved. Old open tabs must reload before saving under the new XP rules.

## Vocabulary coverage and known words

The catalog contains 1,194 independently curated everyday entries, including noun
articles, English meanings, topics and parts of speech. The original 295 IDs are
unchanged, and IDs 1000–1193 were appended. Topics include education, technology,
nature, colors, numbers (cardinal and ordinal), pronouns, prepositions, animals, feelings, question
words and services (post office and authorities). A1/A2 tags are learning guidance, not an official
word-by-word exam classification or a corpus frequency ranking.

For comparison, the [official Goethe A2 vocabulary guide](https://www.goethe.de/pro/relaunch/prf/vi/Goethe-Zertifikat_A2_Wortliste.pdf)
describes roughly 1,300 lexical items that candidates should at least understand.
This catalog is a practice foundation, not the complete official exam list.
The [A2 exam](https://www.goethe.de/ins/de/en/prf/prf/gzsd2.html) also assesses
listening, reading, writing and speaking.

“I know this” is available in all three vocabulary exercise modes. It excludes
the word from future practice, saves immediately, and does not change XP, correct
answer counts, accuracy or activity. Skipped words are excluded from round
accuracy. Progress → Words marked known lets you restore a word with its earlier
practice count intact. Guest exclusions remain on the device; signed-in exclusions
belong to the account and sync through D1.

`vocabularyVersion: 1` prevents older open tabs from overwriting the new
`knownWordIds` field. Existing progress loads with an empty exclusion list. The
progress request limit is 64 KiB to accommodate all 1,194 word records, known IDs,
all grammar histories and the activity log together (about 40 KiB at most).

Each word cycles through its eight correct answers as: German → English choice,
typed recall, letter building, English → German choice, typed recall, article
choice for nouns (letter building otherwise), German → English choice and typed
recall.

## Streaks and activity

`activityLog` stores answers per local calendar day (`YYYY-MM-DD`) for the latest
60 days. The first answer of a day extends the streak if the previous day had
practice and restarts it otherwise; the streak shows as 0 after a full day
without practice. Older progress without a log starts a fresh streak. The legacy
weekday `activity` array is still written for compatibility but no longer drives
the chart. Marking a word known is not counted as activity.

## Grammar completion

Scores are plain counts with no percentages: how many answers were correct, how
many have been answered and how many a round has (for example “12 correct · 15
answered · 32 in a round”), plus the number of correct answers needed to pass.
Once a round is full, the counts cover the latest answers. Practice shows the
current set alongside the topic counts. Passing thresholds are unchanged.

Each visit is a set of up to 10 exercises (fewer at the end of a round, or when
the topic passes). The next visit continues at the saved position in the round.

After a round, **Practise mistakes again** starts a round containing only missed
items. Further retries narrow to the remaining mistakes. Vocabulary retries follow
the normal per-word progression; grammar retries are extra practice and do not
advance the saved topic position or change the assessment window. Both earn normal
XP and count as activity. Retry lists last for the current session.

Answer cues avoid revealing the answer. Separable-verb gaps use two slots, written
as “komme … an”, with “—” for an empty slot, so the infinitive cue (ankommen)
cannot give away the prefix. Modal verbs and present-tense questions use English
cues because the German infinitive equals the wir / sie form.

Topics include verb conjugation, causal clauses, plural forms, indefinite articles,
personal and possessive pronouns, nominative, demonstratives, prepositions, local
prepositions, W-questions, local adverbs, separable and reflexive verbs,
Partizip II, and countable/uncountable nouns. Komparativ and Superlativ remain
a combined topic. The Partizip II topic focuses on formation alongside the
existing Perfekt topic. Existing conjugation and weil/dass rules keep their
progress IDs rather than creating duplicate rules.

Broad topics have 80 exercises per round for repeated practice across forms and
contexts; narrower topics keep 20–40 exercises. Each topic’s window equals its
round size.

Exercises spread their vocabulary instead of repeating one sentence frame: the
present-tense round uses about 60 different A1 verbs (each at most twice), modal
verbs pair each of 80 activities with one subject, and the accusative, dative,
Perfekt, word-order, dass/weil, possessive, demonstrative, Wo/Wohin, separable and
reflexive rounds use each verb, object or clause only once or twice. Every weil
clause has its own main clause that it actually explains. The later-round bank
adds -t/-d and -s/-z spelling patterns (du arbeitest, du tanzt) to present tense.

The first round keeps the curated order. Later rounds draw a deterministic,
shuffled selection of the same size from the curated exercises plus an extra
bank (`public/grammar-extra.js`, 828 exercises with more people, nouns, verbs,
questions and sentence patterns). The selection depends only on the topic and
round number, so reloading resumes the same exercise. Window sizes, passing
targets and saved histories are unchanged. The passing target is `ceil(count × 7 / 8)`:

| Exercises | Correct to pass |
| --- | --- |
| 20 | 18 |
| 24 | 21 |
| 32 | 28 |
| 40 | 35 |
| 80 | 70 |

Complete a full window before passing. After the last exercise, continuing returns
to exercise 1 without clearing the score: each new answer replaces the oldest.
A topic can pass partway through a later cycle. Passed status stays earned.

The recent outcomes, total attempts and passed status are saved for guests and
accounts. Leaving or reloading resumes at the next exercise. `grammarVersion: 3`
preserves recorded answers, attempts and earned passes when topics grow. Shorter
histories fill up naturally as new answers arrive; no outcomes are fabricated.
Unpassed topics require the full new window. Older 80-answer histories are trimmed
only for topics that still use a smaller window. XP and word
progress stay intact. Old percentage-only scores cannot reconstruct answer
histories, so those start fresh. Old tabs must reload before saving.

Grammar reference checks: [Goethe-Institut grammar](https://www.goethe.de/ins/de/de/m/prf/grm.html),
[Goethe-Institut two-way prepositions](https://www.goethe.de/resources/files/pdf134/pdf-spickzettel-wechselprpositionen.pdf),
and [Lingolia possessives](https://deutsch.lingolia.com/en/grammar/pronouns/possessive-pronouns).
Exercises and explanations are written for this app.

## Authentication and deployment status

Accounts use email/password and server-validated session cookies.
Passwords require 8–128 characters, an uppercase letter, a lowercase letter,
a number and a non-whitespace symbol. Password managers and paste are supported.
Passwords are salted and hashed with scrypt (N=16384, r=8, p=5).
Sessions use random opaque tokens stored as hashes, with seven-day expiry,
HttpOnly/Secure/SameSite cookies and server-side revocation on sign-out.
Mutating endpoints reject cross-origin requests. Login and registration have
database-backed limits by normalized email and Cloudflare-provided client IP.

Progress is isolated by the authenticated user's ID. Guest progress stays
device-local and is not automatically imported into an account. Saves reject
stale revisions and account changes; errors remain visible rather than silently
overwriting another device. Sessions are not stored in browser local storage.

Email currently serves as the login identifier; mailbox verification and
self-service password-reset emails are not implemented. Historical progress
from the former ChatGPT-hosted app is not automatically linked to new accounts.

Production runs at https://wortwerk.ftavlad.workers.dev/ on Cloudflare Workers
with D1. Workers Builds deploys GitHub's `main` branch after applying pending
migrations. The earlier missing authentication tables were resolved by running
the migrations; full account creation and saved progress still need production
verification. This repository now targets standalone Cloudflare deployment.

## Local development

Requirements: Node.js 22.13 or newer and pnpm 11.25.0.

```sh
pnpm install --frozen-lockfile
pnpm exec wrangler d1 migrations apply DB --local --config wrangler.jsonc --persist-to .wrangler/state
pnpm dev
```

Development uses the same email/password flow with a local D1 database. HTTP session
cookies are permitted only on localhost/loopback; deployment requires HTTPS.

```sh
pnpm build
pnpm start
```

The first migration creates progress storage; the next adds accounts, sessions,
rate limits and progress revisions. Apply both in order. Do not re-run applied
migrations manually. Tooling state stays in ignored `.wrangler/` files.

## Tests

```sh
pnpm test
pnpm typecheck
pnpm lint
```

The authentication suite runs in Cloudflare's local Workers runtime with D1.
It exercises password policy, normalized emails, failed login, session cookies,
expiry/revocation, CSRF rejection, forged identity headers, account isolation,
stale progress revisions and persistent rate limits.

GitHub Actions runs lint, typecheck, tests, and a production build on pushes and
pull requests. You can also run **Build and tests** manually from the **Actions**
tab. The workflow uses Node.js 22 and the pnpm version in `package.json`, with
cached dependencies and a frozen lockfile. It needs no Cloudflare credentials.

## Deploy to your own Cloudflare account

1. Authenticate from your own terminal: `pnpm exec wrangler login`.
2. The owner's D1 database is already configured. For a separate installation,
   create one with `pnpm exec wrangler d1 create wortwerk`.
3. For a separate installation, put its database ID in `wrangler.jsonc`.
   Database IDs are configuration, not passwords. Never commit API tokens.
4. Run `pnpm deploy`. This builds, applies migrations, then deploys the Worker.
5. Open the HTTPS URL printed by Wrangler and create your account.

Deployment deliberately stops until a real database ID is configured. No
Cloudflare billing plan is enabled or upgraded by these scripts.

### Cloudflare GitHub integration (Workers Builds)

When Cloudflare is connected directly to this repository, its build service
handles deployment authentication. No GitHub Actions secrets are required.

Keep the existing database ID for this deployment and the binding name `DB`.
Database bindings are declared only in `wrangler.jsonc`: the Vite plugin
merges arrays, so repeating the binding in `vite.config.ts` creates duplicates.

Use these build settings:

- Build command: `pnpm build`
- Deploy command: `pnpm exec wrangler d1 migrations apply DB --remote --config wrangler.jsonc && pnpm exec wrangler deploy`
- Root directory: the repository root
- Production branch: `main`

Migrations run before the Worker is deployed. The explicit root configuration
on the migration command makes its `drizzle` directory resolve correctly;
the deployment command uses the Vite-generated Worker configuration.
The build token also needs permission to modify D1 if the generated token does
not already include it.

Cloudflare's free CPU allowance is small (10 ms per request). Secure password
hashing is CPU-intensive, so free-tier login feasibility must be measured on
deployment; the local emulator does not enforce production CPU billing limits.
Do not reduce the hashing cost to fit the free plan. If it exceeds the allowance,
use an appropriate Workers plan or move authentication to another runtime.
See [Workers pricing](https://developers.cloudflare.com/workers/platform/pricing/)
and [OWASP password storage guidance](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html).

### Diagnose signup failures

Workers Logs are enabled in the root `wrangler.jsonc`, including invocation logs
at 100% sampling. Commit and push this configuration to `main` and wait for a
successful Workers Builds deployment before retrying signup. Edit the root
configuration, not `dist/server/wrangler.json`, which the build regenerates.
Logging records new requests after deployment; it cannot recover earlier logs.

In Cloudflare, open **Workers & Pages → wortwerk → Observability → Logs**, retry
signup once, and inspect the `/api/auth/register` invocation:

- `exceededCpu` / “Worker exceeded CPU time limit”: password hashing may exceed
  the plan's CPU allowance. Check the invocation CPU time. A `limits.cpu_ms`
  setting cannot raise the free plan's allowance; keep the password hash cost
  intact and decide on a suitable Workers plan or another authentication runtime.
- `D1_ERROR` / `no such table`: check the deployment's migration step and ensure
  the `DB` binding points to the intended database. Use the migration command
  above to apply pending migrations; do not delete or recreate the database.
- `Wortwerk request failed`: inspect the accompanying server error message.
- HTTP 429: the signup/login rate limit was reached; wait 15 minutes.

Existing server error logs omit request bodies. Do not add passwords, session
cookies, or tokens to logs. See [Workers Logs](https://developers.cloudflare.com/workers/observability/logs/workers-logs/)
and [CPU limits](https://developers.cloudflare.com/workers/platform/limits/#cpu-time).

## Source layout

- `public/app.js`: curriculum, exercises and client progress handling.
- `public/vocabulary.js`: shared vocabulary catalog with permanent word IDs and parts of speech.
- `public/levels.js`: XP rewards, rank thresholds and legacy XP conversion.
- `public/grammar.js`: 1,500 first-round grammar exercises across 24 topics.
- `public/grammar-extra.js`: 828 further exercises mixed into later rounds.
- `public/grammar-config.js`: topic sizes and passing targets shared by client and server.
- `public/grammar-more.js`: local adverbs, separable/reflexive verbs, participles and countability.
- `public/grammar-topics.js`: additional foundational topic exercises and explanations.
- `public/grammar-theory.js`: the complete theory catalog.
- `public/grammar-progress.js`: rolling grammar scores, completion, migration and round selection.
- `public/styles.css`: interface styles.
- `app/page.tsx` and `app/sign-in/page.tsx`: app shell and account form.
- `app/api/progress/route.ts`: authenticated progress endpoint.
- `lib/auth.ts`, `lib/auth-handlers.ts`, `lib/password.ts`: independent authentication.
- `lib/progress.ts`: validated, account-owned progress with revision checks.
- `db/` and `drizzle/`: database schema and migrations.
- `scripts/worker-env.mjs`: local Wrangler/Miniflare tooling paths.
- `scripts/deploy-cloudflare.mjs`: build, migration and deployment sequence.

Vocabulary IDs are permanent saved-progress keys. Add new entries with new IDs;
do not renumber or reuse existing IDs. The server validates progress against
this same catalog. Parts of speech describe the practised meaning, independently
of the topic (for example, `umsteigen` is a verb in Travel). Duplicate English
meanings are excluded from answer options; categories with fewer than four
distinct meanings fall back to typed recall.

## Next work

- Verify the complete production account/progress flow and monitor CPU usage.
- Add email verification and password-reset delivery if required.
- Expand and review the A1/A2 curriculum.

No credentials, user progress data, installed dependencies or build output
are included in this repository. Third-party notices are retained with their
respective source files.
