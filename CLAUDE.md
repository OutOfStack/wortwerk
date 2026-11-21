# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Running a single test

```sh
node --test tests/grammar.test.mjs
node --test --test-name-pattern "shuffling" tests/progress-client.test.mjs
```

CI (`.github/workflows/ci.yml`) runs lint → typecheck → test → build on Node 22.

## Architecture

**Two halves sharing one set of plain JS modules.** The React/Vinext side (`app/`) is only a thin shell: `app/page.tsx` renders static chrome (sidebar, topbar, `#content`) and loads `/app.js` as a module script. All practice UI is imperative DOM code in `public/app.js`, which re-renders `#content` from a global `state` object. No React components hold app state.

**`public/*.js` are imported by the browser, the server, and the tests.** `lib/progress.ts` imports `WORDS`, version constants, `upgradeProgress`, rule IDs and targets straight from `public/vocabulary.js`, `public/levels.js`, `public/grammar-progress.js` and `public/grammar-config.js` to validate saved progress. Changes to these files therefore affect server validation too. Keep them dependency-free ES modules with explicit `.js` import paths.

**Progress is one JSON snapshot per user** (D1 table via `db/schema.ts`), saved with a revision number. `lib/progress.ts` validates it with zod and rejects stale revisions. Guests keep the same shape in `localStorage` (`wortwerk-guest-progress`). Shape changes are gated by protocol versions: `XP_VERSION` (levels.js), `VOCABULARY_VERSION` (vocabulary.js) and `GRAMMAR_VERSION` (grammar-progress.js). The server rejects saves whose version doesn't match, so old open tabs can't overwrite migrated data. To change the shape, bump the version, add an upgrade path in `upgradeProgress`/`upgradeGrammar`, and accept the older literal in the zod schema. The README documents each version's history.

**Grammar content is spread over several files:** exercises in `grammar.js`, `grammar-topics.js` and `grammar-more.js` (first-round curated order) plus `grammar-extra.js` (mixed into later rounds); theory in `grammar-theory.js`; translations in `grammar-translations.js`; round sizes and pass targets (`ceil(n × 7/8)`) in `grammar-config.js`. `exerciseDeck(rule, cycle)` selects later rounds deterministically from topic and round number, so reloading resumes the same exercise. Rule IDs are progress keys, just like word IDs.

**Auth** (`lib/auth.ts`, `auth-handlers.ts`, `password.ts`) is hand-rolled: scrypt hashes, opaque session tokens stored as hashes, origin checks on mutations, and D1-backed rate limits. `app/api/auth/[action]/route.ts` dispatches on the last path segment. Routes reach D1 through `env.DB` from `cloudflare:workers`. README says not to lower the scrypt cost to fit the free-tier CPU limit.

**Tests:**
- `auth.test.mjs` bundles `tests/auth-worker.ts` with esbuild and runs it in Miniflare against an in-memory D1 with the real migrations. Miniflare and esbuild are resolved through wrangler's own dependencies.
- `progress-client.test.mjs` strips the `import` lines from `public/app.js` and evaluates it in a `node:vm` context with stubbed DOM/fetch. Its import-stripping regex lists the allowed module names, so a new import in `app.js` must be added there too. Tests call internal functions through `app.evaluate(...)`.
- `legacy-word-ids.json` pins historical vocabulary IDs to catch renumbering.

**Build/deploy:** `vite.config.ts` imports `scripts/worker-env.mjs` first, because it sets the paths Wrangler snapshots on load. Edit the root `wrangler.jsonc`, never the generated `dist/server/wrangler.json`. Production deploys from `main` via Cloudflare Workers Builds, which applies remote migrations first.

`docs/BACKLOG.md` lists planned larger changes (answer log, FSRS, grammar reviews).

## Commits

Do not add `Co-Authored-By` or other AI attribution lines to commit messages.
