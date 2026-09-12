---
title: Payments Domain
status: verified
owner: unassigned
last_verified: 2026-09-12
source_of_truth:
  - apps/storefront/src/lib/data/payment.ts
  - apps/storefront/src/lib/data/cart.ts
  - apps/storefront/src/modules/checkout/components/payment-button
  - apps/storefront/src/modules/checkout/components/payment-wrapper
  - apps/storefront/src/lib/constants.tsx
  - apps/storefront/src/app/api/payment-return/route.ts
related:
  - ../workflows/checkout.md
  - cart-and-checkout.md
  - ../architecture/integrations.md
---

# Payments Domain

## Entities

- **Payment collection** — attached to a cart, groups one or more payment sessions.
- **Payment session** — one per attempted provider; created by `initiatePaymentSession()` (`apps/storefront/src/lib/data/cart.ts`), which calls `sdk.store.payment.initiatePaymentSession`.
- **Provider id** — a string like `pp_stripe_stripe`, `pp_medusa-payments_default`, `pp_system_default` (manual/test), `pp_paypal_paypal`; mapped to a display title/icon in `paymentInfoMap` (`apps/storefront/src/lib/constants.tsx`).

## Supported providers (as recognized by the storefront)

| Helper | Matches | UI behaviour |
|---|---|---|
| `isStripeLike(providerId)` | `pp_stripe_*`, `pp_medusa-*` | Renders `StripePaymentButton`; confirms payment client-side via Stripe.js, then calls `placeOrder()`. |
| `isManual(providerId)` | `pp_system_default` | Renders `ManualTestPaymentButton`; calls `placeOrder()` directly with no payment confirmation step — for local/testing use. |
| `isPaypal(providerId)` | `pp_paypal*` | Recognized in `paymentInfoMap`/`isPaypal`, but no dedicated PayPal button component was found under `checkout/components` — treat PayPal as **configured for display only**, not confirmed to have a working checkout path in this repository. |
| *(none of the above)* | any other/no session | `PaymentButton` renders a disabled "Select a payment method" button. |

## Payment confirmation flow (Stripe)

1. `StripePaymentButton.handlePayment()` calls `stripe.confirmPayment()` with `redirect: "if_required"` and a `return_url` pointing at `/api/payment-return`.
2. If Stripe can complete inline (no 3-D Secure/redirect needed), the promise resolves directly; on `requires_capture`/`succeeded`, the button calls `placeOrder()` itself.
3. If Stripe must redirect off-site (e.g. bank authorization), the browser returns to `GET /api/payment-return`, which re-validates the payment session against the cart and either sends the shopper back to the payment step (`redirect_status=failed`) or calls `placeOrder(cartId)` server-side. See [../workflows/checkout.md](../workflows/checkout.md) for the full trace.

## Business rules

- A cart can only be completed into an order once it has an address, email, shipping method, and (implicitly, via Medusa core) a payment session in a capturable/completed state — the storefront's `notReady` check in `PaymentButton` mirrors this but does not enforce it; Medusa core is the actual enforcement point.
- `payment-return/route.ts` treats a mismatched or missing payment session/client-secret as a hard failure, redirecting to `/cart?error=payment_failed` rather than attempting to place the order — this guards against a tampered or stale `payment_intent` query parameter.
- No currency-specific amount logic is implemented in this repository beyond `noDivisionCurrencies` in `apps/storefront/src/lib/constants.tsx`, which lists currencies (KRW, JPY, VND, CLP, PYG, XAF, ...) that are not divided by 100 when formatting — Medusa itself stores/returns amounts already in the display unit (see the `data-price-format` rule in the `medusa-dev:building-with-medusa` skill); this list is a storefront-only display nuance for zero-decimal currencies.

## Failure cases

- Stripe returns an `error` with a `payment_intent` in `requires_capture`/`succeeded` state (can happen with some redirect flows) — treated as success and forwarded to `placeOrder()`.
- Any other Stripe error — surfaced via `ErrorMessage`, order is not placed.
- `payment-return` route: missing `cart_id`/`payment_intent`/`payment_intent_client_secret`, no matching payment session, or a client-secret mismatch — redirects to `/cart?error=payment_failed`.
- `placeOrder()` throwing after a successful redirect-based payment — redirects to `/cart?error=order_failed` (cart likely still exists in a stale state; no automatic retry).

## Known gaps

- PayPal is listed in the provider map but has no confirmed dedicated confirmation UI in this repository — verify before assuming it works end-to-end.
- No automated tests cover any payment path.
