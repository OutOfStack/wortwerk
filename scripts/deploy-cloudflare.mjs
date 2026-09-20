import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
const config = JSON.parse(readFileSync(new URL('../wrangler.jsonc', import.meta.url), 'utf8'));
const id = config.d1_databases?.[0]?.database_id;
if (!id || id === '00000000-0000-4000-8000-000000000000') {
  throw new Error('Create your D1 database and set its database_id in wrangler.jsonc before deploying. See README.md.');
}
const pnpm = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm';
for (const args of [
  ['build'],
  ['exec', 'wrangler', 'd1', 'migrations', 'apply', 'DB', '--remote', '--config', 'wrangler.jsonc'],
  ['exec', 'wrangler', 'deploy', '--config', 'wrangler.jsonc'],
]) {
  const result = spawnSync(pnpm, args, { stdio: 'inherit', shell: process.platform === 'win32' });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}
