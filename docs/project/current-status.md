---
title: Current Status
status: verified
owner: unassigned
last_verified: 2026-09-12
source_of_truth:
  - git status / git diff (working tree at time of writing)
  - apps/backend/package.json
  - apps/backend/src
  - apps/backend/integration-tests
  - .github/workflows/update.yaml
related:
  - overview.md
  - ../development/testing.md
  - ../operations/deployment.md
---

# Current Status

## Verified current behaviour

- The backend runs on stock Medusa v2.20.1 modules. `apps/backend/src/modules`, `src/workflows`, `src/links`, `src/jobs`, and `src/subscribers` each contain only the framework-generated boilerplate `README.md` — no custom module, workflow, link, scheduled job, or subscriber has been implemented.
- The two "custom" API routes (`src/api/store/custom/route.ts`, `src/api/admin/custom/route.ts`) are placeholder handlers that only return HTTP 200 — not real endpoints.
- `apps/backend/src/migration-scripts/initial-data-seed.ts` is a real, non-trivial script that seeds a default sales channel, publishable API key, store, regions, tax regions, stock locations, shipping profiles/options, and product categories/options using Medusa's core workflows (`@medusajs/medusa/core-flows`).
- The storefront (`apps/storefront`) is a fully built-out Medusa Next.js starter: region-aware routing middleware, product browsing, cart, multi-step checkout (address → shipping → payment → review), Stripe payment via `@stripe/react-stripe-js`, a "manual" test payment provider path, customer accounts, order history, and order-transfer requests. See [../architecture/storefront.md](../architecture/storefront.md).

## Known limitations

- **No test files exist.** `apps/backend/package.json` defines `test:unit`, `test:integration:modules`, and `test:integration:http` Jest scripts (also wired into `turbo.json`'s `test` task), but the only file under `apps/backend/integration-tests` is `setup.js` (Jest `setupFiles`); no `*.spec.ts` files exist anywhere in the repository. Running these scripts currently executes zero tests. See [../development/testing.md](../development/testing.md).
- **`backend:seed` is broken.** The root `package.json` script `backend:seed` runs `turbo seed --filter=@dtc/backend`, but `apps/backend/package.json` defines no `seed` script. Verified with `npx turbo run seed --filter=@dtc/backend --dry=json`, which resolves the task's `command` to `"<NONEXISTENT>"`. The seed script is currently only runnable directly: `npx medusa exec ./src/migration-scripts/initial-data-seed.ts` from `apps/backend`. See [../development/common-commands.md](../development/common-commands.md).
- **No CI build/lint/test pipeline.** The only workflow in `.github/workflows/update.yaml` ("Update Medusa") is a manually-triggered job that opens a PR bumping Medusa's version via `medusajs/medusa-update-action`; it does not build, lint, or test the repository. There is no pipeline that runs on pull requests.
- **No containerization or deployment config.** No `Dockerfile`, `docker-compose.yml`, or infrastructure-as-code exists in the repository. `README.md` only points at deploying via Medusa Cloud's dashboard. See [../operations/deployment.md](../operations/deployment.md).

## Uncommitted working-tree changes (at time of writing)

`git status` showed the following modified-but-uncommitted files, which this documentation treats as in-progress, not yet part of the verified baseline:

| File | Change |
|---|---|
| `apps/backend/medusa-config.ts` | Adds `@rx-ventures/medusa-plugin-shopify-sync` to `plugins`, reading `SHOPIFY_SYNC_ENCRYPTION_KEY` from the environment. |
| `apps/backend/package.json` | Adds `@rx-ventures/medusa-plugin-shopify-sync` as a dependency. |
| `apps/storefront/src/app/[countryCode]/(checkout)/checkout/page.tsx` | Adds three debug `console.log` calls (cart and customer objects) — appears to be leftover debugging, not intentional behaviour. |
| `.gitignore` | Adds `.idea` to ignored paths. |
| `pnpm-lock.yaml` | Lockfile update reflecting the new dependency. |

Recommendation: remove the debug `console.log`s from `checkout/page.tsx` before committing, and confirm whether the Shopify plugin wiring is ready to ship (`SHOPIFY_SYNC_ENCRYPTION_KEY` is not present in `apps/backend/.env.template` as of this writing — see [../architecture/integrations.md](../architecture/integrations.md)).

## Risks / blockers supported by evidence

- Shipping a build with no automated tests and no CI gate means regressions in checkout/payment/order flows would not be caught before merge.
- The undocumented `SHOPIFY_SYNC_ENCRYPTION_KEY` environment variable (required by the plugin per its own README) is missing from `.env.template`; a deploy that enables the plugin without setting it will fail plugin initialization or leave Shopify credentials unencryptable.

## Open questions

- Is the Shopify sync integration intended to ship, or is it exploratory work? (It is currently uncommitted.)
- Is a CI pipeline planned, or is testing expected to be manual for this starter?
