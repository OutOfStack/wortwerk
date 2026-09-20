# Repository Guidelines

## Project Structure & Module Organization

Wortwerk is a German A1–A2 practice app using React, Vinext/Vite, and Cloudflare Workers with D1.

- `app/`: page shells, sign-in UI, and API route adapters.
- `lib/`: authentication, password hashing, and validated progress persistence.
- `public/`: imperative practice UI (`app.js`), shared vocabulary (`vocabulary.js`), styles, and favicon.
- `db/schema.ts` and `drizzle/`: Drizzle schema and ordered SQL migrations.
- `tests/`: authentication integration tests, client regression tests, and fixtures.
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

Use two-space indentation, semicolons, and ES modules. Match surrounding quote style; existing files use both styles. Use camelCase for functions and variables, PascalCase for React components and types, and descriptive kebab-case filenames. Keep framework filenames such as `page.tsx` and `route.ts`. Use `@/` for root-relative TypeScript imports. ESLint uses Next.js Core Web Vitals and TypeScript configurations; no standalone formatter is configured.

## Testing Guidelines

Name tests `tests/*.test.mjs` and use `node:test` with strict assertions. Authentication tests run Workers and D1 through Miniflare. Add regression coverage for changed authentication, account isolation, progress revisions, or vocabulary behavior. No numeric coverage threshold is configured. Run tests, typecheck, lint, and build before submitting; check visible changes on mobile and desktop.

## Commit & Pull Request Guidelines

Never commit or push changes unless the user explicitly asks for or approves that action. Completing a task does not authorize a commit or push. When changes are ready, you may suggest committing and pushing, but must wait for the user's approval before doing either. Permission to commit alone does not authorize pushing. This also applies to empty commits used to trigger deployments.

History uses imperative, descriptive subjects such as “Fix duplicate D1 bindings in Cloudflare Vite deployment.” Keep commits focused. PRs should explain the problem, resulting behavior, validation, and migration implications; link relevant issues and include screenshots for UI changes.

## Data & Configuration Safety

Vocabulary IDs are permanent progress keys: never renumber or reuse them. Declare the `DB` binding only in `wrangler.jsonc`. Add migrations instead of rewriting applied ones. Never commit credentials or log passwords, cookies, or tokens.
