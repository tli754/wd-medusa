---
title: Coding Conventions
status: verified
owner: unassigned
last_verified: 2026-09-12
source_of_truth:
  - eslint.config.ts
  - apps/backend/package.json
related:
  - ../../AGENTS.md
  - repository-structure.md
---

# Coding Conventions

## Linting

- The backend must satisfy `@medusajs/eslint-plugin`'s recommended config (`eslint.config.ts`: `defineConfig([...medusa.configs.recommended])`). Its rules encode Medusa framework requirements — correct route/workflow/module shapes, not just style — so a lint failure usually means the code is actually wrong. Never disable a `@medusajs/*` rule to make lint pass; fix the code instead.
- `medusa build` / `medusa develop` run linting by default when this plugin is configured and fail on lint errors. Run it explicitly with `npx medusa lint` (`--fix` and `--quiet` supported).
- The storefront uses `next lint` (`eslint-config-next`) — no Medusa-specific rules apply there.

## Style

- No semicolons. Double quotes. 2-space indentation.
- Files: kebab-case. Types/classes: PascalCase. Functions/variables: camelCase. Database columns: snake_case.
- No emojis in code, comments, or commit messages.

## Backend architectural conventions

(See the `medusa-dev:building-with-medusa` skill for the full rule set; summarized here for reference.)

- **File-based routing.** A store endpoint is `src/api/store/<path>/route.ts` exporting `GET`/`POST`/etc. Don't add a router or register routes manually.
- **Business logic belongs in workflows**, not route handlers. Routes resolve and run a workflow; workflows compose steps. (No custom workflow exists yet in this repo — see [../architecture/backend.md](../architecture/backend.md).)
- Only `GET`, `POST`, `DELETE` HTTP methods — never `PUT`/`PATCH`.
- Cross-module data access goes through `query.graph()` (cross-module retrieval) or `query.index()` (filtering across modules linked via module links) — never direct cross-module service calls or JS-side `.filter()` on linked data.
- **Prices are stored and returned as-is** (e.g. `49.99`, not `4999`) — never multiply by 100 when saving or divide by 100 when displaying.
- Import Zod from `@medusajs/framework/zod` (Zod v4), never from `zod` directly.
- Static imports only — no `await import()` in a route handler body.

## Storefront conventions

- All backend calls go through the single `@medusajs/js-sdk` instance in `apps/storefront/src/lib/config.ts` — never a bare `fetch()` (it won't carry the publishable API key / auth headers the SDK adds automatically). The one deliberate exception is `apps/storefront/src/middleware.ts`, which must use `fetch()` because Next.js Edge middleware can't run the SDK; it sets `x-publishable-api-key` manually there.
- Pass plain objects to `sdk.client.fetch`'s `body` — never `JSON.stringify()` it (the SDK serializes automatically).
- Server actions that mutate data (`apps/storefront/src/lib/data/*.ts`) are marked `"use server"` and revalidate the relevant Next.js cache tag (`getCacheTag`) after a successful write.

## Task graph

Adding a task to `turbo.json` requires declaring its `outputs`, or Turbo will cache nothing or the wrong thing.

## Off-limits paths

See [`../../AGENTS.md`](../../AGENTS.md#off-limits).
