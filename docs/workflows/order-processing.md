---
title: Order Processing Workflow Trace
status: needs-review
owner: unassigned
last_verified: 2026-09-12
source_of_truth:
  - apps/storefront/src/lib/data/cart.ts
  - apps/storefront/src/lib/data/orders.ts
  - node_modules/@rx-ventures/medusa-plugin-shopify-sync (README.md)
related:
  - checkout.md
  - ../domains/orders.md
  - ../architecture/integrations.md
---

# Order Processing Workflow Trace

## Verified current behaviour

**Order creation** happens exclusively as the last step of checkout — cart completion via `sdk.store.cart.complete()` (see [checkout.md](checkout.md)). There is no separate "process order" workflow, custom fulfillment-trigger, or post-purchase automation implemented in this repository. Post-creation, the storefront only reads and manages orders (`retrieveOrder`, `listOrders`, transfer requests) via `apps/storefront/src/lib/data/orders.ts` — see [../domains/orders.md](../domains/orders.md).

Everything after order creation — payment capture, fulfillment creation, status transitions, notifications — is handled by Medusa core, which is not implemented in this repository and must be checked against the pinned Medusa version (`2.20.1`) rather than assumed.

## Proposed or planned behaviour

None recorded. There is no code, comment, or document indicating planned custom order-processing automation.

## Shopify sync plugin: a parallel, separate order path

The `@rx-ventures/medusa-plugin-shopify-sync` plugin (uncommitted at time of writing — see [../project/current-status.md](../project/current-status.md)) independently syncs Shopify orders **into** Medusa via webhooks (`orders/{create,updated,cancelled,paid,fulfilled,partially_fulfilled,edited}`, `refunds/create`) and via a paginated manual sync, per its own README. This is a distinct mechanism from the storefront checkout path above — it creates/updates Medusa orders that originated in Shopify, not orders placed through this storefront. The two paths are not documented (in the plugin or this repo) as interacting with each other beyond both ultimately writing to Medusa's order tables.

## Open questions

- Whether orders placed through this storefront are also expected to sync back to Shopify (the plugin's README does not describe outbound order sync, only inbound) is unconfirmed — treat as "no" until evidence says otherwise.
- Fulfillment-webhook reconciliation logic ("runs reconcile on parent order, writes fulfillment chain," per the plugin README) is internal to the plugin package and was not inspected line-by-line in this pass.
