# Wortwerk

An early German A1–A2 practice app with English instructions.

## What is implemented

- German → English multiple-choice vocabulary exercises.
- English → German typed recall and letter-building exercises.
- 44 vocabulary entries and 10 grammar modules (five questions per module).
- Repeated grammar rounds with an 85% rolling mastery target.
- Email/password registration, sign-in, sign-out and account-specific progress in Cloudflare D1.
- A responsive interface for phones and desktops.

This is a prototype, not a complete A1/A2 curriculum. The streak and activity
tracking and exercise answer validation need further work.

## Authentication and deployment status

Accounts now use email/password; no ChatGPT account or identity headers are used.
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
self-service password-reset emails are not implemented. Existing ChatGPT Site
progress is not automatically linked to new accounts.

This source is prepared for standalone Cloudflare Workers + D1. It has not yet
been deployed into the owner's Cloudflare account. The earlier ChatGPT-hosted
version remains separate and unchanged.

## Local development

Requirements: Node.js 22.13 or newer and pnpm 11.25.0.

```sh
pnpm install --frozen-lockfile
pnpm dev
```

A clean checkout uses the portable development profile. Mock ChatGPT sign-in is
disabled. Accounts use the local D1 database while developing. HTTP session
cookies are permitted only on localhost/loopback; deployment requires HTTPS.

```sh
pnpm build
```

To initialize the local D1 database after the first build:

```sh
pnpm exec wrangler d1 migrations apply DB --local --config wrangler.jsonc --persist-to .wrangler/state
```

The first migration creates progress storage; the next adds accounts, sessions,
rate limits and progress revisions. Apply both in order. Do not re-run applied
migrations manually. The historical [starter notes](docs/STARTER.md) describe the
original platform; their ChatGPT-auth instructions no longer apply to this app.

## Tests

```sh
pnpm test
pnpm exec tsc --noEmit
```

The authentication suite runs in Cloudflare's local Workers runtime with D1.
It exercises password policy, normalized emails, failed login, session cookies,
expiry/revocation, CSRF rejection, forged identity headers, account isolation,
stale progress revisions and persistent rate limits.

## Deploy to your own Cloudflare account

1. Authenticate from your own terminal: `pnpm exec wrangler login`.
2. Create a D1 database: `pnpm exec wrangler d1 create wortwerk`.
3. Put the returned database ID in `wrangler.jsonc`, replacing the placeholder.
   Database IDs are configuration, not passwords. Never commit API tokens.
4. Run `pnpm deploy`. This builds, applies migrations, then deploys the Worker.
5. Open the HTTPS URL printed by Wrangler and create your account.

Deployment deliberately stops until a real database ID is configured. No
Cloudflare billing plan is enabled or upgraded by these scripts.

### Cloudflare GitHub integration (Workers Builds)

When Cloudflare is connected directly to this repository, its build service
handles deployment authentication. No GitHub Actions secrets are required.

Create a D1 database named `wortwerk` in your Cloudflare account and replace the
placeholder `database_id` in `wrangler.jsonc` with its ID. Keep the binding name
`DB`. Database bindings are declared only in `wrangler.jsonc`: the Vite plugin
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

## Source layout

- `public/app.js`: curriculum, exercises and client progress handling.
- `public/styles.css`: interface styles.
- `app/page.tsx` and `app/sign-in/page.tsx`: app shell and account form.
- `app/api/progress/route.ts`: authenticated progress endpoint.
- `lib/auth.ts`, `lib/auth-handlers.ts`, `lib/password.ts`: independent authentication.
- `lib/progress.ts`: validated, account-owned progress with revision checks.
- `db/` and `drizzle/`: database schema and migrations.

## Next work

- Deploy into the owner's Cloudflare account and verify production CPU limits.
- Add email verification and password-reset delivery if required.
- Expand and review the A1/A2 curriculum.

No credentials, user progress data, installed dependencies or build output
are included in this repository. Third-party notices are retained with their
respective source files.
