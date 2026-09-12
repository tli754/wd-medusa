---
title: Goals and Scope
status: verified
owner: unassigned
last_verified: 2026-09-12
source_of_truth:
  - README.md
  - apps/backend/medusa-config.ts
  - apps/backend/src
related:
  - overview.md
  - current-status.md
---

# Goals and Scope

## Verified current scope

This repository is the stock **Medusa Next.js DTC starter**, plus one integration added on top:

- Standard Medusa commerce backend: products, carts, orders, customers, regions, promotions, fulfillment, and payments, delivered entirely by Medusa's own modules (`@medusajs/medusa`) — no custom Medusa modules exist in `apps/backend/src/modules` (the directory contains only a boilerplate `README.md`).
- Standard Medusa Next.js storefront: browsing, cart, multi-step checkout, customer accounts, order history, and order transfer, as described in `README.md`'s Features list and confirmed by the module directories under `apps/storefront/src/modules`.
- One added integration: `@rx-ventures/medusa-plugin-shopify-sync`, syncing customers, orders, products, and discounts with a Shopify store (see [../architecture/integrations.md](../architecture/integrations.md)).

There is no product-requirements or roadmap document in the repository. Anything beyond what is listed above and in [current-status.md](current-status.md) is unverified.

## Explicit non-goals

None are recorded in the repository. Do not infer non-goals beyond: this is a starter, not a specific merchant's finished storefront, and it has no B2B, marketplace, or subscription-commerce code (Medusa supports these as separate modules, but none are wired up here).

## Open questions

- Whether this repository is meant to stay a generic starter or become a specific store's production codebase is not recorded anywhere in-repo — confirm with the project owner before treating either assumption as fact.
- Whether the Shopify sync integration is a permanent architectural decision or a trial is unconfirmed — its registration is currently an uncommitted change (see [current-status.md](current-status.md)).
