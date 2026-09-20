# Wortwerk

An early German A1–A2 practice app with English instructions.

## What is implemented

- German → English multiple-choice vocabulary exercises.
- English → German typed recall and letter-building exercises.
- 44 vocabulary entries and 10 grammar modules (five questions per module).
- Repeated grammar rounds with an 85% rolling mastery target.
- Progress views and a Cloudflare D1 persistence endpoint.
- A responsive interface for phones and desktops.

This is a prototype, not a complete A1/A2 curriculum. The streak and activity
tracking, answer validation and progress synchronization need further work.

## Authentication and deployment status

The current source was built for ChatGPT Sites. Its sign-in flow and trusted
identity headers are supplied by that hosting platform. **It does not yet offer
independent Google or email/password authentication.**

Do not expose the current progress API on standalone hosting while trusting
client-supplied `oai-authenticated-user-*` headers: these headers must come
from a trusted authentication gateway. Independent authentication is required
before deploying outside ChatGPT Sites.

The planned destination is the owner's Cloudflare account using Workers and D1.
That migration has not been completed. The hosting manifest retains only
logical database settings; it does not include the original Site identity.

## Local development

Requirements: Node.js 22.13 or newer and pnpm 11.25.0.

```sh
pnpm install --frozen-lockfile
pnpm dev
```

A clean checkout uses the portable development profile. Local development
includes a mock ChatGPT sign-in; this is not production authentication.

```sh
pnpm build
```

To initialize the local D1 database after the first build:

```sh
pnpm exec wrangler d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_amazing_maelstrom.sql
```

See [the starter development notes](docs/STARTER.md) for runtime details.

## Source layout

- `public/app.js`: curriculum, exercises and client progress handling.
- `public/styles.css`: interface styles.
- `app/page.tsx`: app shell and current account controls.
- `app/api/progress/route.ts`: authenticated progress endpoint.
- `app/chatgpt-auth.ts`: current platform-specific authentication.
- `db/` and `drizzle/`: database schema and migrations.

## Next work

- Replace platform-specific sign-in with independent authentication.
- Harden progress validation, isolation and synchronization.
- Configure deployment into the owner's Cloudflare account.
- Expand and review the A1/A2 curriculum.

No credentials, user progress data, installed dependencies or build output
are included in this repository. Third-party notices are retained with their
respective source files.
