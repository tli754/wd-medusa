---
title: Checkout Workflow Trace
status: verified
owner: unassigned
last_verified: 2026-09-12
source_of_truth:
  - apps/storefront/src/app/[countryCode]/(checkout)/checkout/page.tsx
  - apps/storefront/src/modules/checkout
  - apps/storefront/src/lib/data/cart.ts
  - apps/storefront/src/app/api/payment-return/route.ts
related:
  - ../domains/cart-and-checkout.md
  - ../domains/payments.md
  - order-processing.md
---

# Checkout Workflow Trace

This traces the actual runtime path for checkout in this repository. There is no custom Medusa workflow for checkout — the "workflow" here is the storefront's orchestration of Medusa's core store API (cart, payment, order) across a Next.js page and one Route Handler.

> A second checkout flow (Details → Shipping → Payment, `apps/storefront/src/modules/checkout-new`) exists alongside the flow traced below, gated behind `NEXT_PUBLIC_CHECKOUT_VARIANT=new`. See [../execution/specs/2026-09-12-custom-checkout-design.md](../execution/specs/2026-09-12-custom-checkout-design.md) for its design; the trace below covers only the legacy (default) flow.

## 1. Where the request originates

The shopper reaches `apps/storefront/src/app/[countryCode]/(checkout)/checkout/page.tsx` after adding items to a cart and navigating to checkout. The page is a React Server Component that loads the cart (`retrieveCart` / `retrieveCustomer`) and, for the legacy flow, renders `CheckoutForm` (`apps/storefront/src/modules/checkout/templates/checkout-form`) with step components for addresses, shipping, and payment (`apps/storefront/src/modules/checkout/components/{addresses,shipping,payment,review}`).

## 2. API endpoint(s) involved

No custom backend API route exists for checkout. All calls go to Medusa's built-in **store API** via the SDK (`apps/storefront/src/lib/config.ts`):

| Step | Endpoint (via SDK) | Storefront function |
|---|---|---|
| Set addresses | `POST /store/carts/:id` | `setAddresses()` in `cart.ts` |
| List shipping options | `GET /store/shipping-options` | `listCartShippingMethods()` in `fulfillment.ts` |
| Set shipping method | `POST /store/carts/:id/shipping-methods` | `setShippingMethod()` in `cart.ts` |
| List payment providers | `GET /store/payment-providers` | `listCartPaymentMethods()` in `payment.ts` |
| Create payment session | `POST /store/payment-collections/:id/payment-sessions` | `initiatePaymentSession()` in `cart.ts` |
| Complete cart → order | `POST /store/carts/:id/complete` | `placeOrder()` in `cart.ts` (via `sdk.store.cart.complete`) |

There is also one Next.js-side Route Handler, `GET /api/payment-return` (`apps/storefront/src/app/api/payment-return/route.ts`), which Stripe redirects back to after off-site payment authorization.

## 3. Request validation

No custom validation/Zod schemas exist in this repository for checkout — validation is entirely Medusa core's own store-API validation, which is not part of this codebase. The storefront applies only UI-level guards, e.g. `PaymentButton`'s `notReady` check (address, billing address, email, shipping method all present) before enabling the "Place order" button — this is a UX affordance, not a security or data-integrity boundary.

## 4. Workflow invocation

No custom `createWorkflow` composition exists. Cart completion runs Medusa's own core cart-completion workflow, invoked indirectly through `sdk.store.cart.complete()` inside `placeOrder()` (`apps/storefront/src/lib/data/cart.ts:394`). This is the one point in the whole flow where a cart is converted into an order.

## 5. Workflow steps

Not applicable to this repository's own code (no custom steps). The steps that run are internal to Medusa's core cart-completion workflow (payment capture/authorization check, inventory reservation, order creation) and are not implemented here.

## 6. Database changes

All database writes happen inside the Medusa backend, driven by the store-API calls above (cart update, shipping method attach, payment session create, cart→order completion). None of this repository's code writes to the database directly — the storefront never imports a DB client (see `../../AGENTS.md`'s "Common Mistakes").

## 7. External calls

- **Stripe** (browser-side): `stripe.confirmPayment()` in `StripePaymentButton` (`apps/storefront/src/modules/checkout/components/payment-button/index.tsx`), called directly from the browser via Stripe.js — not proxied through the Medusa backend.
- **Stripe** (server-side, inside Medusa core): payment intent creation/capture, as part of Medusa's built-in Stripe payment-provider module — not visible as code in this repository.

## 8. Events emitted

Not traced in this repository's own code — Medusa core emits its own lifecycle events (e.g. order-related events) as part of cart completion, but no subscriber in this repo listens for them (`apps/backend/src/subscribers` has no implementation). If the Shopify sync plugin reacts to order creation, that is internal to the plugin, not this repo's code.

## 9. Failure and retry behaviour

| Failure point | Handling |
|---|---|
| Stripe declines / requires further action, not `requires_capture`/`succeeded` | `StripePaymentButton` shows the Stripe error message via `ErrorMessage`; no order is placed; shopper can retry the same payment session. |
| Off-site redirect returns with `redirect_status=failed` | `payment-return/route.ts` sends the shopper back to `/checkout?step=payment` with Stripe's own return params forwarded, so the Payment Element can re-mount against the same (still `requires_payment_method`) PaymentIntent. |
| `payment-return` finds no matching/valid payment session for the given `cart_id`/`payment_intent` | Redirects to `/cart?error=payment_failed` — treated as a hard failure, no retry offered inline. |
| `placeOrder()` throws inside `payment-return` (cart completion failed after successful payment) | Redirects to `/cart?error=order_failed`; `unstable_rethrow(error)` re-throws Next.js internal redirect/notFound errors first so they are not swallowed. |
| `placeOrder()` succeeds | `revalidateTag("orders")`, clears the cart cookie (`removeCartId()`), redirects to `/{countryCode}/order/{orderId}/confirmed`. |

There is no automated retry/backoff logic anywhere in this path; every retry is the shopper manually re-attempting via the UI.

## 10. Relevant tests

None. No test file exercises any part of this flow (see [../development/testing.md](../development/testing.md)).

## Key source paths

- `apps/storefront/src/app/[countryCode]/(checkout)/checkout/page.tsx`
- `apps/storefront/src/modules/checkout/components/payment-button/index.tsx`
- `apps/storefront/src/modules/checkout/components/payment-wrapper/{index.tsx,stripe-wrapper.tsx}`
- `apps/storefront/src/app/api/payment-return/route.ts`
- `apps/storefront/src/lib/data/cart.ts` (`setAddresses`, `setShippingMethod`, `initiatePaymentSession`, `placeOrder`)
- `apps/storefront/src/lib/data/payment.ts` (`listCartPaymentMethods`)
