---
title: Testing
status: verified
owner: unassigned
last_verified: 2026-09-12
source_of_truth:
  - apps/backend/package.json
  - apps/backend/integration-tests
  - turbo.json
related:
  - ../project/current-status.md
  - common-commands.md
---

# Testing

## Verified current behaviour

`apps/backend/package.json` defines three Jest-based scripts, each setting `TEST_TYPE` and targeting a different glob:

| Script | Command | Target glob |
|---|---|---|
| `test:unit` | `TEST_TYPE=unit NODE_OPTIONS=--experimental-vm-modules jest --silent --runInBand --forceExit` | `**/src/**/__tests__/**/*.unit.spec.ts` |
| `test:integration:modules` | `TEST_TYPE=integration:modules ... jest ...` | `**/src/modules/*/__tests__/**` |
| `test:integration:http` | `TEST_TYPE=integration:http ... jest ...` | `**/integration-tests/http/*.spec.ts` |

`turbo.json` wires a `test` task (root `pnpm test` → `turbo test`), and the root `package.json` exposes `pnpm test`.

**No test files currently exist.** The only file under `apps/backend/integration-tests` is `setup.js` (Jest's `setupFiles` entry) — there are no `*.spec.ts` files anywhere in the repository, in `src/modules/*/__tests__`, `src/**/__tests__`, or `integration-tests/http/`. Running any of the three scripts today executes zero tests. `apps/storefront` has no test script and no test files.

## Requirements to actually run tests (once they exist)

Integration suites need a live, reachable PostgreSQL database — do not run the test task without one.

## How to run a single test (once test files exist)

```bash
cd apps/backend
pnpm run test:unit -- src/modules/foo/__tests__/service.unit.spec.ts
pnpm run test:unit -- -t "returns the cart"
```

(Pass the path/pattern through to Jest; keep `TEST_TYPE` set by the npm script.)

## Known gap

There is no automated test coverage for any of the flows documented in `docs/workflows/` or `docs/domains/` (checkout, payments, orders, customers, catalog). See [../project/current-status.md](../project/current-status.md) for the risk this implies (no regression safety net, no CI gate).

## Recommendation for new code

Per `../../AGENTS.md` and the repository's own test-driven-development conventions, new backend business logic should ship with a corresponding `*.unit.spec.ts` or `*.spec.ts` file in the matching glob above so the existing scripts start exercising real coverage.
