# Repository Guidelines

## Project Structure & Module Organization

Wortwerk is a German A1–A2 practice app using React, Vinext/Vite, and Cloudflare Workers with D1.

- `app/`: page shells, sign-in UI, and API route adapters.
- `lib/`: authentication, password hashing, and validated progress persistence.
- `public/`: imperative practice UI (`app.js`), vocabulary (`vocabulary.js`), grammar exercises, theory and translations (`grammar*.js`), XP and ranks (`levels.js`), topic icons, styles, web manifest and icons. The server imports `vocabulary.js`, `levels.js`, `grammar-progress.js` and `grammar-config.js` to validate progress, so they must stay dependency-free ES modules.
- `db/schema.ts` and `drizzle/`: Drizzle schema and ordered SQL migrations.
- `tests/`: authentication integration tests, client regression tests, grammar and level tests, and fixtures.
- `scripts/`: local Worker tooling and deployment automation.

## Build, Test, and Development Commands

Use Node.js 22.13+ and pnpm 11.25.0.

- `pnpm install --frozen-lockfile`: install locked dependencies.
- `pnpm exec wrangler d1 migrations apply DB --local --config wrangler.jsonc --persist-to .wrangler/state`: initialize or update local D1.
- `pnpm dev`: start development on port 5173.
- `pnpm build`: generate the production bundle; `pnpm start` serves it locally through Wrangler.
- `pnpm test`: run all Node tests.
- `pnpm typecheck` and `pnpm lint`: check strict TypeScript and ESLint rules.
- `pnpm db:generate`: generate migrations after schema changes.
- `pnpm deploy`: build, apply remote migrations, and deploy to Cloudflare.

## Coding Style & Naming Conventions

Use semicolons and ES modules. Match the surrounding style: TypeScript and most modules use two-space indentation, while `public/app.js` uses compact one-space, often single-line code. Existing files use both quote styles. Use camelCase for functions and variables, PascalCase for React components and types, and descriptive kebab-case filenames. Keep framework filenames such as `page.tsx` and `route.ts`. Use `@/` for root-relative TypeScript imports. ESLint uses Next.js Core Web Vitals and TypeScript configurations; no standalone formatter is configured.

## Testing Guidelines

Name tests `tests/*.test.mjs` and use `node:test` with strict assertions. Authentication tests run Workers and D1 through Miniflare. Add regression coverage for changed authentication, account isolation, progress revisions, vocabulary, grammar progress, or XP and level behavior. No numeric coverage threshold is configured. Run tests, typecheck, lint, and build before submitting; check visible changes on mobile and desktop.

## Commit & Pull Request Guidelines

Never commit or push changes unless the user explicitly asks for or approves that action. Completing a task does not authorize a commit or push. When changes are ready, you may suggest committing and pushing, but must wait for the user's approval before doing either. Permission to commit alone does not authorize pushing. This also applies to empty commits used to trigger deployments.

History uses imperative, descriptive subjects such as “Fix duplicate D1 bindings in Cloudflare Vite deployment.” Keep commits focused. PRs should explain the problem, resulting behavior, validation, and migration implications; link relevant issues and include screenshots for UI changes.

## Data & Configuration Safety

Vocabulary IDs and grammar rule IDs are permanent progress keys: never renumber, rename or reuse them. When the saved progress shape changes, bump `XP_VERSION`, `VOCABULARY_VERSION` or `GRAMMAR_VERSION`, add an upgrade path, and keep accepting the older version in `lib/progress.ts`. Declare the `DB` binding only in `wrangler.jsonc`. Add migrations instead of rewriting applied ones. Never commit credentials or log passwords, cookies, or tokens.
