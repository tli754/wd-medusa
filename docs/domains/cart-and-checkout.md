---
title: Cart and Checkout Domain
status: verified
owner: unassigned
last_verified: 2026-09-12
source_of_truth:
  - apps/storefront/src/lib/data/cart.ts
  - apps/storefront/src/modules/checkout
related:
  - ../workflows/checkout.md
  - payments.md
  - ../architecture/storefront.md
---

# Cart and Checkout Domain

For the full request-by-request trace (route → workflow → persistence → events), see [../workflows/checkout.md](../workflows/checkout.md). This document covers the domain rules.

> Checkout is a single 3-step flow: Details → Shipping → Payment (`apps/storefront/src/modules/checkout`). An earlier 4-step flow and the `NEXT_PUBLIC_CHECKOUT_VARIANT` switch between them were removed 2026-09-15 after the 3-step flow was validated; see [../execution/specs/2026-09-12-custom-checkout-design.md](../execution/specs/2026-09-12-custom-checkout-design.md) for the original design record.

## Entities

- **Cart** — Medusa core entity. Identified client-side by a cookie (`getCartId`/`setCartId` in `apps/storefront/src/lib/data/cookies.ts`). Created lazily per region by `getOrSetCart()` in `apps/storefront/src/lib/data/cart.ts`.
- **Line item** — a variant + quantity on a cart (`addToCart`, `updateLineItem`, `deleteLineItem`).
- **Shipping method** — attached to the cart via `setShippingMethod()`, calling `sdk.store.cart.addShippingMethod`.
- **Payment collection / payment session** — created via `initiatePaymentSession()`; see [payments.md](payments.md).
- **Promotion codes** — applied via `applyPromotions()`, which sets `promo_codes` on the cart.

## Business rules (as implemented in the storefront layer)

- A cart is always scoped to a region; `getOrSetCart()` throws if no region matches the given country code, and re-points an existing cart's `region_id` if the visitor's region has changed.
- `addToCart()` requires a non-empty `variantId`; it creates a cart on demand via `getOrSetCart()` if none exists yet.
- Every cart mutation (`updateCart`, `addToCart`, `updateLineItem`, `setShippingMethod`, `applyPromotions`) revalidates the `"carts"` Next.js cache tag (and `"fulfillment"` for changes that affect shipping-option pricing) so subsequent reads are fresh.
- `PaymentButton` (`apps/storefront/src/modules/checkout/components/payment-button`) disables order placement (`notReady`) unless the cart has a shipping address, billing address, email, and at least one shipping method — this is a **client-side** convenience check only; it is not proof the backend enforces the same invariant (Medusa's own cart-completion validation is the actual enforcement and is not part of this repo's code).

## Known gaps

- `applyGiftCard()` and `removeDiscount()` in `apps/storefront/src/lib/data/cart.ts` are present but their bodies are commented out — gift cards and discount removal are **not functional** in the storefront UI as of this writing.
- No backend-side validation logic exists in this repo for cart/checkout business rules; all such enforcement is Medusa's own core behaviour, external to this codebase.

## Related APIs and code

- Data layer: `apps/storefront/src/lib/data/cart.ts`, `payment.ts`, `fulfillment.ts`
- UI: `apps/storefront/src/modules/checkout/**`
- Checkout page: `apps/storefront/src/app/[countryCode]/(checkout)/checkout/page.tsx`

## Tests

None exist for this domain (see [../development/testing.md](../development/testing.md)).
