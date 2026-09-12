---
title: Fulfillment Domain
status: needs-review
owner: unassigned
last_verified: 2026-09-12
source_of_truth:
  - apps/storefront/src/lib/data/fulfillment.ts
  - apps/backend/src/migration-scripts/initial-data-seed.ts
related:
  - cart-and-checkout.md
  - ../architecture/data-model.md
---

# Fulfillment Domain

## Verified current behaviour

Fulfillment configuration (stock locations, shipping profiles, shipping options) is created once by `apps/backend/src/migration-scripts/initial-data-seed.ts`, using Medusa's core `createStockLocationsWorkflow`, `createShippingProfilesWorkflow`, and `createShippingOptionsWorkflow`. No custom fulfillment provider or logic exists in this repository.

The storefront reads fulfillment data via `apps/storefront/src/lib/data/fulfillment.ts`:

| Function | Purpose |
|---|---|
| `listCartShippingMethods(cartId)` | List shipping options available for a cart's current address/region. |
| `calculatePriceForShippingOption(...)` | Get the calculated price for a specific shipping option (for options with calculated, not flat, pricing). |

The chosen method is attached to the cart via `setShippingMethod()` in `apps/storefront/src/lib/data/cart.ts` (see [cart-and-checkout.md](cart-and-checkout.md)).

## Business rules

Fulfillment eligibility, rate calculation, and any provider-specific logic are entirely Medusa core behaviour (not implemented in this repository). The Shopify sync plugin also handles inbound Shopify fulfillment webhooks (create/update), reconciling them onto the corresponding Medusa order — see [../architecture/integrations.md](../architecture/integrations.md) — but that is a Shopify→Medusa sync path, not a fulfillment *provider* used to actually ship orders.

## Open questions

- Which real-world fulfillment provider(s), if any, this project intends to use beyond Medusa's manual/default fulfillment is not recorded in the repository.
