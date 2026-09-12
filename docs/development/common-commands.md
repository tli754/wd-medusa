---
title: Common Commands
status: verified
owner: unassigned
last_verified: 2026-09-12
source_of_truth:
  - package.json
  - apps/backend/package.json
  - apps/storefront/package.json
  - turbo.json
related:
  - local-setup.md
  - testing.md
---

# Common Commands

Run from the repo root unless noted. `<pm>` is the detected package manager (currently `pnpm`) — see [repository-structure.md](repository-structure.md#package-manager-detection). Turbo skips missing apps automatically, so these are safe even when `apps/storefront` doesn't exist.

## Development

```bash
<pm> run dev                # all apps (pnpm -r dev)
<pm> run backend:dev        # backend only — turbo dev --filter=@dtc/backend (http://localhost:9000, admin at /app)
<pm> run storefront:dev     # storefront only — turbo dev --filter=@dtc/storefront (http://localhost:8000)
```

## Build

```bash
<pm> run build              # all apps (pnpm -r build)
<pm> run start              # turbo start (builds first via task dependsOn, then starts)
```

## Lint

```bash
<pm> run lint                          # all apps via turbo
cd apps/backend && <pm> run lint       # medusa lint
cd apps/storefront && <pm> run lint    # next lint
```

## Test

See [testing.md](testing.md) for why these currently execute zero tests.

```bash
<pm> run test                                          # turbo test (all apps)
cd apps/backend && <pm> run test:unit                  # **/src/**/__tests__/**/*.unit.spec.ts
cd apps/backend && <pm> run test:integration:modules   # **/src/modules/*/__tests__/**
cd apps/backend && <pm> run test:integration:http      # **/integration-tests/http/*.spec.ts
```

## Database

```bash
cd apps/backend
<pm> exec medusa db:generate <module-name>   # generate migrations for a custom module
<pm> exec medusa db:migrate                  # run migrations
<pm> exec medusa user -e admin@test.com -p supersecret
```

## Seed initial data

**Verified working command** (the root `backend:seed` script is broken — see below):

```bash
cd apps/backend
<pm> exec medusa exec ./src/migration-scripts/initial-data-seed.ts
```

**Known-broken command** — do not rely on this until `apps/backend/package.json` gains a `seed` script:

```bash
<pm> run backend:seed   # from root: `turbo seed --filter=@dtc/backend`
                         # apps/backend/package.json has no "seed" script;
                         # `npx turbo run seed --filter=@dtc/backend --dry=json` resolves
                         # the task's command to "<NONEXISTENT>".
```

## Other backend CLI

```bash
cd apps/backend
npx medusa lint --fix           # auto-fix lint issues
npx medusa exec <file> [args]   # run an arbitrary function-exporting script (used for seeding above)
```
