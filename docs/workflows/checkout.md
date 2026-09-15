---
title: Checkout Workflow Trace
status: verified
owner: unassigned
last_verified: 2026-09-15
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

> An earlier 4-step flow (Addresses → Shipping → Payment → Review) existed alongside the flow traced below, switchable via `NEXT_PUBLIC_CHECKOUT_VARIANT`. It was removed 2026-09-15 once this 3-step flow was validated; see [../execution/specs/2026-09-12-custom-checkout-design.md](../execution/specs/2026-09-12-custom-checkout-design.md) for the original design record.

## 1. Where the request originates

The shopper reaches `apps/storefront/src/app/[countryCode]/(checkout)/checkout/page.tsx` after adding items to a cart and navigating to checkout. The page is a React Server Component that loads the cart (`retrieveCart` / `retrieveCustomer`) and renders `CheckoutForm` (`apps/storefront/src/modules/checkout/templates/checkout-form`).

`CheckoutForm` is itself an async Server Component: it fetches `listCartPaymentMethods` up front and derives an `initialStep` (`"address" | "delivery" | "payment"`) from cart/metadata completeness — no email/`checkout_full_name`/`checkout_phone` → `"address"`; those present but no `shipping_address.address_1`/`shipping_methods` → `"delivery"`; else `"payment"`. It passes that to `checkout-steps.tsx` (client component), which owns `activeStep` in local React state and renders the three step components — `Details`, `Shipping`, `Payment` (`apps/storefront/src/modules/checkout/components/{details,shipping,payment}`) — passing each `isOpen` plus `onEdit`/`onContinue`/`onBack` callbacks.

Step transitions never touch the URL: clicking "Continue"/"Edit" calls a local state setter, not `router.push`. The URL stays whatever it was on arrival at `/checkout` (typically `?step=address`, appended by `apps/storefront/src/modules/cart/templates/summary.tsx`'s "Go to checkout" link — the new flow ignores that query string and derives its own initial step from the cart).

## 2. API endpoint(s) involved

No custom backend API route exists for checkout. All calls go to Medusa's built-in **store API** via the SDK (`apps/storefront/src/lib/config.ts`):

| Step | Endpoint (via SDK) | Storefront function |
|---|---|---|
| Save contact details (Details step) | `POST /store/carts/:id` | `updateCart()` in `cart.ts`, called directly from `Details` |
| List shipping options ("Calculate delivery") | `GET /store/shipping-options` | `listCartShippingMethods()` in `fulfillment.ts` |
| Save shipping address (Shipping step) | `POST /store/carts/:id` | `updateCart()` in `cart.ts`, called directly from `Shipping` |
| Set shipping method | `POST /store/carts/:id/shipping-methods` | `setShippingMethod()` in `cart.ts` |
| List payment providers | `GET /store/payment-providers` | `listCartPaymentMethods()` in `payment.ts` |
| Create payment session | `POST /store/payment-collections/:id/payment-sessions` | `initiatePaymentSession()` in `cart.ts` |
| Complete cart → order | `POST /store/carts/:id/complete` | `placeOrder()` in `cart.ts` (via `sdk.store.cart.complete`), called from the shared `PaymentButton` |

There is also one Next.js-side Route Handler, `GET /api/payment-return` (`apps/storefront/src/app/api/payment-return/route.ts`), which Stripe redirects back to after off-site payment authorization.

Unlike the removed 4-step flow, this flow has no `setAddresses` server-action/redirect step — `Details` and `Shipping` call `updateCart()` directly and advance via local state, not a form action.

## 3. Request validation

No custom validation/Zod schemas exist in this repository for checkout — validation is entirely Medusa core's own store-API validation, which is not part of this codebase. The storefront applies only UI-level guards: each step's own "required field" checks before calling `updateCart`, and the shared `PaymentButton`'s `notReady` check (address, billing address, email, shipping method all present) before enabling "Place order" — these are UX affordances, not a security or data-integrity boundary.

## 4. Workflow invocation

No custom `createWorkflow` composition exists. Cart completion runs Medusa's own core cart-completion workflow, invoked indirectly through `sdk.store.cart.complete()` inside `placeOrder()` (`apps/storefront/src/lib/data/cart.ts`). This is the one point in the whole flow where a cart is converted into an order.

## 5. Workflow steps

Not applicable to this repository's own code (no custom steps). The steps that run are internal to Medusa's core cart-completion workflow (payment capture/authorization check, inventory reservation, order creation) and are not implemented here.

## 6. Database changes

All database writes happen inside the Medusa backend, driven by the store-API calls above (cart update, shipping method attach, payment session create, cart→order completion). None of this repository's code writes to the database directly — the storefront never imports a DB client (see `../../AGENTS.md`'s "Common Mistakes").

## 7. External calls

- **Stripe** (browser-side): `stripe.confirmPayment()` in `StripePaymentButton` (`apps/storefront/src/modules/checkout/components/payment-button/index.tsx`), called directly from the browser via Stripe.js — not proxied through the Medusa backend. This component is shared, unmodified from before the flow removal.
- **Stripe** (server-side, inside Medusa core): payment intent creation/capture, as part of Medusa's built-in Stripe payment-provider module — not visible as code in this repository.

Selecting a Stripe-like payment method in the `Payment` step calls `initiatePaymentSession(cart, { provider_id })`, then `router.refresh()` — since no step transition in this flow navigates, nothing else would force the Server Component tree (and therefore `PaymentWrapper`'s Stripe Elements `client_secret`) to pick up the newly created session. `router.refresh()` re-fetches the Server Component tree without remounting client components, so `checkout-steps.tsx`'s `activeStep` state survives it.

## 8. Events emitted

Not traced in this repository's own code — Medusa core emits its own lifecycle events (e.g. order-related events) as part of cart completion, but no subscriber in this repo listens for them (`apps/backend/src/subscribers` has no implementation). If the Shopify sync plugin reacts to order creation, that is internal to the plugin, not this repo's code.

## 9. Failure and retry behaviour

| Failure point | Handling |
|---|---|
| Stripe declines / requires further action, not `requires_capture`/`succeeded` | `StripePaymentButton` shows the Stripe error message via `ErrorMessage`; no order is placed; shopper can retry the same payment session. |
| Off-site redirect returns with `redirect_status=failed` | `payment-return/route.ts` sends the shopper back to `/checkout?step=payment`. The `step` query param itself has no effect on this flow (see §1) — the Payment step reopens because, by this point, Details and Shipping are already complete on the cart, so `getInitialStep(cart)` derives `"payment"` independently, and the Payment Element re-mounts against the same (still `requires_payment_method`) PaymentIntent. |
| `payment-return` finds no matching/valid payment session for the given `cart_id`/`payment_intent` | Redirects to `/cart?error=payment_failed` — treated as a hard failure, no retry offered inline. |
| `placeOrder()` throws inside `payment-return` (cart completion failed after successful payment) | Redirects to `/cart?error=order_failed`; `unstable_rethrow(error)` re-throws Next.js internal redirect/notFound errors first so they are not swallowed. |
| `placeOrder()` succeeds | `revalidateTag("orders")`, clears the cart cookie (`removeCartId()`), redirects to `/{countryCode}/order/{orderId}/confirmed`. |

There is no automated retry/backoff logic anywhere in this path; every retry is the shopper manually re-attempting via the UI.

## 10. Relevant tests

None. No test file exercises any part of this flow (see [../development/testing.md](../development/testing.md)). Verified manually via a scripted Playwright smoke pass (add to cart → Details → Shipping → Payment, edit a completed step, select a payment method) when the flow removal landed 2026-09-15 — not checked into the repo as an automated test.

## Key source paths

- `apps/storefront/src/app/[countryCode]/(checkout)/checkout/page.tsx`
- `apps/storefront/src/modules/checkout/templates/checkout-form/{index.tsx,checkout-steps.tsx}`
- `apps/storefront/src/modules/checkout/components/{details,shipping,payment}/index.tsx`
- `apps/storefront/src/modules/checkout/components/payment-button/index.tsx`
- `apps/storefront/src/modules/checkout/components/payment-wrapper/{index.tsx,stripe-wrapper.tsx}`
- `apps/storefront/src/app/api/payment-return/route.ts`
- `apps/storefront/src/lib/data/cart.ts` (`updateCart`, `setShippingMethod`, `initiatePaymentSession`, `placeOrder`)
- `apps/storefront/src/lib/data/payment.ts` (`listCartPaymentMethods`)
- `apps/storefront/src/lib/data/fulfillment.ts` (`listCartShippingMethods`, `calculatePriceForShippingOption`)
