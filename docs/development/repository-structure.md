---
title: Repository Structure
status: verified
owner: unassigned
last_verified: 2026-09-12
source_of_truth:
  - pnpm-workspace.yaml
  - apps/backend/src
  - apps/storefront/src
related:
  - ../architecture/backend.md
  - ../architecture/storefront.md
---

# Repository Structure

```text
.
├── apps/
│   ├── backend/                  # Medusa application (@dtc/backend)
│   │   ├── medusa-config.ts      # DB URL, CORS, secrets, plugins
│   │   ├── integration-tests/    # setup.js (Jest setupFiles); no *.spec.ts files exist yet
│   │   └── src/
│   │       ├── admin/            # Admin dashboard extension scaffolding (i18n/); no widgets implemented
│   │       ├── api/              # File-based routes: api/store/*, api/admin/* (only placeholder "custom" routes exist)
│   │       ├── jobs/              # Scheduled jobs (boilerplate example only)
│   │       ├── links/             # Module links (boilerplate example only)
│   │       ├── migration-scripts/ # initial-data-seed.ts — real seed script, run via `medusa exec`
│   │       ├── modules/           # Custom modules (none implemented — directory has only a README)
│   │       ├── subscribers/       # Event subscribers (boilerplate example only)
│   │       └── workflows/         # Workflows (boilerplate example only)
│   └── storefront/               # Next.js storefront (@dtc/storefront) — optional, see below
│       └── src/
│           ├── app/               # App Router routes, incl. [countryCode]/(main), (checkout), api/payment-return
│           ├── lib/
│           │   ├── data/          # Server actions wrapping the Medusa SDK, one file per domain
│           │   ├── context/, hooks/, util/
│           │   └── config.ts      # The single @medusajs/js-sdk instance
│           ├── middleware.ts      # Region/locale routing (Edge middleware)
│           └── modules/           # Feature UI: cart, checkout, account, order, products, categories, collections, ...
├── eslint.config.ts               # Root ESLint: @medusajs/eslint-plugin recommended
├── turbo.json                     # Task graph: build, dev, start, lint, test, seed
├── pnpm-workspace.yaml            # Workspace globs: apps/**, excluding apps/backend/.medusa/**
└── docs/                          # This documentation tree
```

**`apps/storefront` is optional and may not exist** in a given deployment of this starter — it is skipped when a user chooses not to install it. Before running a storefront command or assuming a full-stack change is possible, check that `apps/storefront/` exists.

Each app may have its own nested `AGENTS.md` for app-specific context (none exist in this repository as of this writing) — agents read the nearest one in the directory tree.

## Package manager detection

The package manager is chosen at install time, not fixed. Detect it in this order before running anything:

1. The `packageManager` field in the root `package.json` (currently `"pnpm@10.11.1"`) — authoritative when present.
2. The lockfile at the repo root: `pnpm-lock.yaml` → pnpm, `yarn.lock` → yarn, `package-lock.json` → npm.

```bash
node -p "require('./package.json').packageManager ?? 'unset'"
ls pnpm-lock.yaml yarn.lock package-lock.json bun.lock bun.lockb 2>/dev/null
```

Use that manager for every command and never introduce a second lockfile. `<pm> run <script>` and `<pm> exec <bin>` work across npm/pnpm/yarn/bun; workspace-filter flags do not, so per-app commands `cd` into the app instead of using a filter flag.
