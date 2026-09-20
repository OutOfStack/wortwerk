import { fileURLToPath } from 'node:url';

const localPath = path => fileURLToPath(new URL(`../.wrangler/${path}`, import.meta.url));

// Keep local tooling state in the checkout without changing the caller's HOME.
process.env.CLOUDFLARE_CF_FETCH_ENABLED ??= 'false';
process.env.WRANGLER_SEND_METRICS ??= 'false';
process.env.WRANGLER_WRITE_LOGS ??= 'false';
process.env.WRANGLER_LOG_PATH ??= localPath('logs');
process.env.WRANGLER_REGISTRY_PATH ??= localPath('dev-registry');
process.env.MINIFLARE_REGISTRY_PATH ??= localPath('registry');
