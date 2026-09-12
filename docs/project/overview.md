---
title: Project Overview
status: verified
owner: unassigned
last_verified: 2026-09-12
source_of_truth:
  - README.md
  - package.json
  - apps/backend/package.json
  - apps/storefront/package.json
related:
  - goals-and-scope.md
  - current-status.md
  - glossary.md
  - ../architecture/system-overview.md
---

# Project Overview

## What this is

The **Medusa DTC Starter** (`dtc-starter-monorepo`, root `package.json`) is a Turborepo/pnpm monorepo that pairs a [Medusa v2](https://docs.medusajs.com) commerce backend with a Next.js storefront, intended as a starting point for a direct-to-consumer ecommerce store. This description is drawn from `README.md` and the workspace `package.json` files; no separate product-requirements document exists in the repository.

## Applications

| App | Path | Package name | Tech |
|---|---|---|---|
| Backend | `apps/backend` | `@dtc/backend` | Medusa v2.20.1 (`@medusajs/medusa`, `@medusajs/framework`), PostgreSQL |
| Storefront | `apps/storefront` | `@dtc/storefront` | Next.js 15 (App Router), React 19, Tailwind CSS, Stripe Elements |

`apps/storefront` is **optional** — a project built from this starter may omit it. See [`../../AGENTS.md`](../../AGENTS.md).

## Users and business context

`README.md` describes the target use case as "direct-to-consumer ecommerce stores" and lists storefront features: product browsing, cart, checkout, customer accounts, order history/management, and order transfer between accounts. No further business context (target market, brand, merchant identity) is recorded in the repository — this is a generic starter, not a store-specific build, as of `last_verified`.

## Technology stack

- **Backend**: Medusa v2.20.1 (`@medusajs/medusa`, `@medusajs/framework`, `@medusajs/admin-sdk`, `@medusajs/dashboard`), Node.js `^20.19.0 || >=22.12.0`, PostgreSQL 15+, Redis (referenced in `apps/backend/.env.template` as `REDIS_URL`, optional at the framework level).
- **Storefront**: Next.js 15.5.21, React 19, `@medusajs/js-sdk` for API access, Tailwind CSS 3, Stripe (`@stripe/react-stripe-js`, `@stripe/stripe-js`) for payment UI.
- **Tooling**: pnpm workspaces (`pnpm-workspace.yaml`), Turborepo (`turbo.json`) for task orchestration, ESLint (`@medusajs/eslint-plugin` on the backend, `eslint-config-next` on the storefront), Jest for backend tests.
- **Notable dependency**: `@rx-ventures/medusa-plugin-shopify-sync` — a third-party Medusa plugin syncing customers/orders/products/discounts with Shopify. See [`../architecture/integrations.md`](../architecture/integrations.md); as of `last_verified` its registration in `apps/backend/medusa-config.ts` is an **uncommitted** working-tree change (see [current-status.md](current-status.md)).

## Terminology

Project- and Medusa-specific terms are defined in [glossary.md](glossary.md).

## Related documents

- [goals-and-scope.md](goals-and-scope.md) — what is and isn't in scope
- [current-status.md](current-status.md) — verified implementation state, gaps, uncommitted work
- [../architecture/system-overview.md](../architecture/system-overview.md) — how the two apps fit together
