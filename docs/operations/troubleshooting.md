---
title: Troubleshooting
status: verified
owner: unassigned
last_verified: 2026-09-12
source_of_truth:
  - AGENTS.md (prior version)
  - apps/backend/.env.template
  - apps/storefront/.env.template
related:
  - ../development/testing.md
  - ../development/common-commands.md
  - ../project/current-status.md
---

# Troubleshooting

Verified, repository-grounded failure modes. This is not a general Medusa troubleshooting guide — consult [docs.medusajs.com](https://docs.medusajs.com) or the `medusa` MCP server for framework-level issues.

## Common mistakes (development)

| Symptom | Cause | Fix |
|---|---|---|
| A storefront command fails or does nothing | `apps/storefront/` doesn't exist in this checkout (it's optional) | Check for the directory before running storefront commands; don't assume it was deleted by mistake. |
| A second lockfile appears, or a command silently uses the wrong package manager | The manager wasn't detected before running a command | Detect via the `packageManager` field / lockfile, per [../development/repository-structure.md](../development/repository-structure.md#package-manager-detection). |
| A newly added dependency isn't found at runtime | It was installed at the repo root instead of inside the app that needs it | `cd apps/backend && <pm> add <pkg>` (or `apps/storefront`), not the root. |
| A custom module's model change "does nothing" | Migration wasn't generated | `cd apps/backend && <pm> exec medusa db:generate <module-name>`. |
| Raw SQL / a DB client is used directly in backend code | Bypasses module services / workflows | Go through module services or workflows instead — see [../development/coding-conventions.md](../development/coding-conventions.md). |
| Storefront requests to the Medusa API fail with a non-obvious error, not a clean 401 | Missing `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` | Set it in `apps/storefront/.env.local`; get it from Admin → Settings → Publishable API key. |
| `pnpm run test` / `test:unit` / `test:integration:*` reports nothing meaningful | No test files exist yet (see [../development/testing.md](../development/testing.md)) | Not a bug — there is currently no test suite to run. |
| Integration test scripts hang or error immediately | No reachable PostgreSQL | Ensure `DATABASE_URL` points at a running Postgres instance before running integration suites. |
| `pnpm run backend:seed` fails or does nothing | The script is broken — `apps/backend/package.json` has no `seed` script (see [../project/current-status.md](../project/current-status.md)) | Run `cd apps/backend && pnpm exec medusa exec ./src/migration-scripts/initial-data-seed.ts` directly. |
| `@medusajs/*` ESLint rule fails and someone wants to disable it | The rule usually caught a real framework-shape problem | Fix the underlying code; don't silence the rule. |
| Shopify sync plugin fails to start / Shopify token can't be decrypted | `SHOPIFY_SYNC_ENCRYPTION_KEY` missing or changed between deploys | Set it once, keep it stable across deploys; see [../architecture/integrations.md](../architecture/integrations.md). Re-paste the Shopify token via the admin UI if the key was rotated. |

## Safe troubleshooting steps

1. Confirm which app(s) exist and which package manager is in use before touching commands.
2. For backend issues, check `medusa develop`/`medusa build` output first — lint failures from `@medusajs/eslint-plugin` often point directly at the real problem.
3. For storefront data-fetching issues, check that the SDK (`apps/storefront/src/lib/config.ts`) has a reachable `NEXT_PUBLIC_MEDUSA_BACKEND_URL` and a valid publishable key before assuming a backend bug.
4. Never run destructive DB commands (drops, resets) against a database you don't own without explicit confirmation from whoever owns it.

## What is not covered here

Logging/monitoring tooling, health checks, and incident response procedures are not represented anywhere in this repository — there is no verified content to document for them. If these exist operationally, they live outside this codebase; do not present assumptions about them as fact.
