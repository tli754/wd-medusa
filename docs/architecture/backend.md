---
title: Backend Architecture
status: verified
owner: unassigned
last_verified: 2026-09-12
source_of_truth:
  - apps/backend/medusa-config.ts
  - apps/backend/src
  - apps/backend/package.json
related:
  - system-overview.md
  - data-model.md
  - integrations.md
  - ../development/repository-structure.md
---

# Backend Architecture

`apps/backend` (`@dtc/backend`) is a stock Medusa v2.20.1 application (`@medusajs/medusa`, `@medusajs/framework`). Configuration lives in `apps/backend/medusa-config.ts`.

## Layering

Medusa's required layering applies and is currently followed by default because there is no custom business logic yet:

```
Module (data + CRUD)  →  Workflow (business logic, mutations, rollback)  →  API route (HTTP)  →  Frontend
```

Rules for any new backend code in this repo (see `../../AGENTS.md` and the `medusa-dev:building-with-medusa` skill for the full pattern set):
- Mutations go through workflows, never directly from a route to a module service.
- Routes only support GET, POST, DELETE.
- Cross-module data access goes through `query.graph()` / `query.index()`, never direct cross-module service calls.

## Verified current behaviour

| Directory | Contents |
|---|---|
| `src/modules/` | Empty except the framework's `README.md` example. No custom modules exist. |
| `src/workflows/` | Empty except `README.md`. No custom workflows exist. Cart completion and store seeding use Medusa's own core workflows (`@medusajs/medusa/core-flows`), not code in this directory. |
| `src/links/` | Empty except `README.md`. No custom module links exist. |
| `src/subscribers/` | Empty except `README.md`. No event subscribers exist. |
| `src/jobs/` | Empty except `README.md`. No scheduled jobs exist. |
| `src/api/store/custom/route.ts` | A placeholder `GET` handler returning HTTP 200. Not a real endpoint. |
| `src/api/admin/custom/route.ts` | Same placeholder shape, under `/admin`. |
| `src/admin/` | Admin dashboard extension scaffolding (`i18n/`, `tsconfig.json`, `vite-env.d.ts`) — no widgets or custom pages implemented. |
| `src/migration-scripts/initial-data-seed.ts` | A real script (839 lines) that seeds a default sales channel, publishable API key, store, regions (`gb, de, dk, se, fr, es, it`), tax regions, stock locations, shipping profiles/options, and product categories/options, using `@medusajs/medusa/core-flows` workflows. Run via `medusa exec` — see [../development/common-commands.md](../development/common-commands.md). |

Because there is no custom module/workflow/route code beyond the above, **all commerce behaviour in this backend is Medusa's own, unmodified**, configured through `medusa-config.ts` and the seed script. Effectively the only customization is the plugin described in [integrations.md](integrations.md).

## Configuration (`medusa-config.ts`)

- `projectConfig.databaseUrl` — from `DATABASE_URL`.
- `projectConfig.http.{storeCors,adminCors,authCors}` — from `STORE_CORS` / `ADMIN_CORS` / `AUTH_CORS`.
- `projectConfig.http.{jwtSecret,cookieSecret}` — from `JWT_SECRET` / `COOKIE_SECRET`.
- `plugins` — currently one entry: `@rx-ventures/medusa-plugin-shopify-sync` (uncommitted at time of writing; see [../project/current-status.md](../project/current-status.md)).

No `modules` array is declared in `defineConfig`, meaning no module overrides/customizations (e.g. custom payment or fulfillment providers) are configured beyond Medusa's defaults and whatever the Shopify plugin registers internally.

## Scripts (`apps/backend/package.json`)

See [../development/common-commands.md](../development/common-commands.md) for the full, verified command list, including the `backend:seed` script gap.

## Open questions

- Whether custom modules/workflows are planned but not yet started, or whether this backend is meant to stay unmodified Medusa, is not recorded in the repository.
