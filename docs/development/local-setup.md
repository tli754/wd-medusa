---
title: Local Setup
status: verified
owner: unassigned
last_verified: 2026-09-12
source_of_truth:
  - README.md
  - apps/backend/.env.template
  - apps/storefront/.env.template
  - apps/backend/package.json
related:
  - common-commands.md
  - ../architecture/integrations.md
---

# Local Setup

Verified against `README.md` and both apps' `package.json` / `.env.template` files. Detect the package manager before running anything — see [`../../AGENTS.md`](../../AGENTS.md#package-manager); examples below use `pnpm` since that's what this repo is pinned to (`packageManager` field in the root `package.json`).

## Prerequisites

- Node.js `^20.19.0 || >=22.12.0` (root `package.json` `engines`)
- PostgreSQL 15+ (README.md)
- pnpm 10+ (`packageManager: "pnpm@10.11.1"`)

## Install

```bash
git clone <repo-url>
cd wd-medusa
pnpm install
```

## Backend environment

```bash
cp apps/backend/.env.template apps/backend/.env
```

Set `DATABASE_URL` in `apps/backend/.env` to a database that exists (e.g. `postgres://postgres:@localhost:5432/medusa-dtc-starter`). Other variables in `.env.template`: `STORE_CORS`, `ADMIN_CORS`, `AUTH_CORS`, `REDIS_URL`, `JWT_SECRET`, `COOKIE_SECRET`, `DB_NAME`.

> If you enable the Shopify sync plugin (`apps/backend/medusa-config.ts`'s `plugins` array), it additionally requires `SHOPIFY_SYNC_ENCRYPTION_KEY` (a 64-char hex string from `openssl rand -hex 32`) — this variable is **not** in `.env.template` as of this writing; add it yourself. See [../architecture/integrations.md](../architecture/integrations.md).

## Database

```bash
cd apps/backend
pnpm medusa db:migrate
```

## Seed initial data

The root script `pnpm run backend:seed` is currently **broken** (see [../project/current-status.md](../project/current-status.md)) — it resolves to a non-existent turbo task. Run the seed script directly instead:

```bash
cd apps/backend
pnpm exec medusa exec ./src/migration-scripts/initial-data-seed.ts
```

## Admin user

```bash
cd apps/backend
pnpm medusa user -e admin@test.com -p supersecret
```

## Start the backend

```bash
cd apps/backend
pnpm dev
```

Admin dashboard: `http://localhost:9000/app`. Retrieve the publishable API key at Settings → Publishable API key (or use the one created by the seed script).

## Storefront environment (optional app — see `../../AGENTS.md`)

```bash
cp apps/storefront/.env.template apps/storefront/.env.local
```

Set at minimum `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY`. Other variables: `NEXT_PUBLIC_MEDUSA_BACKEND_URL` (default `http://localhost:9000`), `NEXT_PUBLIC_DEFAULT_REGION` (default `dk`), `NEXT_PUBLIC_BASE_URL`, `NEXT_PUBLIC_STRIPE_KEY` (optional, for Stripe), `MEDUSA_CLOUD_S3_HOSTNAME` / `MEDUSA_CLOUD_S3_PATHNAME` (optional, Medusa Cloud only).

## Start the storefront

```bash
cd apps/storefront
pnpm dev
```

Runs on `http://localhost:8000`.

## Start everything from the root

```bash
pnpm dev
```

Runs `pnpm -r dev` (all workspace apps); Turbo/pnpm skip an app that doesn't exist, so this is safe even if `apps/storefront` was never installed.

## Full command reference

See [common-commands.md](common-commands.md).
