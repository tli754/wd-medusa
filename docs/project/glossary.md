---
title: Glossary
status: verified
owner: unassigned
last_verified: 2026-09-12
source_of_truth:
  - apps/backend/src
  - apps/storefront/src
related:
  - overview.md
  - ../architecture/system-overview.md
---

# Glossary

Medusa framework terms as used in this repository, plus project-specific shorthand. General Medusa concepts are linked to the official docs rather than redefined in full.

| Term | Meaning in this repository |
|---|---|
| **Module** | A Medusa building block owning its own data models and a service (CRUD only). This repo uses only Medusa's built-in modules (product, cart, order, customer, region, payment, fulfillment, etc.); `apps/backend/src/modules` has no custom ones. See [docs.medusajs.com/learn/fundamentals/modules](https://docs.medusajs.com/learn/fundamentals/modules). |
| **Workflow** | A durable, composable series of steps with rollback, used for all mutations. `apps/backend/src/workflows` currently has none beyond the framework README stub; mutations in this repo (cart completion, seeding) use Medusa's own core workflows from `@medusajs/medusa/core-flows`. |
| **Step** | A single unit of work inside a workflow, created with `createStep`. |
| **Module link** | An association between data models in two different modules that preserves module isolation (`defineLink`). None are defined in `apps/backend/src/links` beyond the boilerplate example. |
| **Subscriber** | A handler for a Medusa-emitted event (e.g. `product.created`). None exist in `apps/backend/src/subscribers` beyond the boilerplate example. |
| **Scheduled job** | A cron-triggered background function. None exist in `apps/backend/src/jobs` beyond the boilerplate example. |
| **Plugin** | A packaged, installable bundle of Medusa modules/workflows/routes/admin UI, registered in `medusa-config.ts`'s `plugins` array. This repo has one: `@rx-ventures/medusa-plugin-shopify-sync`. |
| **Publishable API key** | A key scoped to one or more sales channels that the storefront sends as `x-publishable-api-key` (handled automatically by `@medusajs/js-sdk`) to authorize storefront requests. Configured via `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY`. |
| **Region** | A Medusa grouping of countries sharing currency/tax/payment-provider configuration. The storefront's `middleware.ts` maps request country codes to regions to prefix routes (e.g. `/dk/...`). |
| **Sales channel** | A Medusa entity scoping which products/prices/inventory are visible to a given storefront/channel. Seeded as "Default Sales Channel" in `initial-data-seed.ts`. |
| **Cart** | The pre-order Medusa entity holding line items, addresses, shipping method, and payment collection until it is completed into an order. |
| **Payment collection / payment session** | A cart's payment collection groups one or more payment sessions (one per attempted provider, e.g. Stripe or the manual test provider). Completing the cart requires a payment session in a capturable/completed state. |
| **DTC** | Direct-to-consumer — the storefront model this starter targets (README.md). |
| **Shopify sync** | Shorthand in this documentation for the `@rx-ventures/medusa-plugin-shopify-sync` plugin; see [../architecture/integrations.md](../architecture/integrations.md). |
| **Manual (test) payment provider** | The `pp_system_default` payment provider — a non-Stripe path in storefront checkout (`isManual()` in `apps/storefront/src/lib/constants.tsx`) used for local/testing order placement without a real payment processor. |

For definitions not covered here, prefer the [official Medusa glossary/docs](https://docs.medusajs.com) over guessing — do not invent Medusa terminology.
