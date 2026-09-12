---
title: Orders Domain
status: verified
owner: unassigned
last_verified: 2026-09-12
source_of_truth:
  - apps/storefront/src/lib/data/orders.ts
  - apps/storefront/src/lib/data/cart.ts
  - apps/storefront/src/modules/order
related:
  - ../workflows/checkout.md
  - ../workflows/order-processing.md
  - customers.md
---

# Orders Domain

## Entities and operations

An order is created by completing a cart (`sdk.store.cart.complete`, see [../workflows/checkout.md](../workflows/checkout.md)); there is no separate "create order" path in this repository. Post-creation, `apps/storefront/src/lib/data/orders.ts` exposes:

| Function | Purpose |
|---|---|
| `retrieveOrder(id)` | Fetch a single order by id. |
| `listOrders(...)` | Paginated order history for the logged-in customer. |
| `createTransferRequest(...)` | Start transferring an order to a different customer account (README.md's "Order transfer between accounts" feature). |
| `acceptTransferRequest(id, token)` | Accept an incoming transfer request. |
| `declineTransferRequest(id, token)` | Decline an incoming transfer request. |

UI for these lives under `apps/storefront/src/modules/order/**` (order history, order detail, order confirmation) and `apps/storefront/src/modules/account/**` for the account-side order list.

## State transitions

Order status/fulfillment/payment state transitions are entirely Medusa core behaviour (not implemented in this repository) — do not document specific state-machine values here without checking the pinned Medusa version's own source, since they are not owned by this codebase.

## Business rules

- Order transfer is a request/accept/decline flow gated by a `token` (verified server-side by Medusa core, not by code in this repo).
- No custom order validation, cancellation, or refund logic exists in this repository.

## Known gaps

- No automated tests cover order retrieval, listing, or transfer.

## Related

- [../workflows/order-processing.md](../workflows/order-processing.md) — how a cart becomes an order, and how the Shopify plugin's order webhooks relate.
