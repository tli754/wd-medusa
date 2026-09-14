---
title: Storefront Architecture
status: verified
owner: unassigned
last_verified: 2026-09-12
source_of_truth:
  - apps/storefront/src/middleware.ts
  - apps/storefront/src/lib/config.ts
  - apps/storefront/src/lib/data
  - apps/storefront/src/app
  - apps/storefront/src/modules
related:
  - system-overview.md
  - ../domains/cart-and-checkout.md
  - ../domains/customers.md
---

# Storefront Architecture

`apps/storefront` (`@dtc/storefront`) is a Next.js 15 App Router application. Route segments live under `src/app`, presentational/feature code under `src/modules`, and all backend access under `src/lib/data`.

## Structure

| Path | Responsibility |
|---|---|
| `src/app/[countryCode]/(main)/...` | Public browsing routes: home, products, collections, categories, cart, account, order. |
| `src/app/[countryCode]/(checkout)/checkout/page.tsx` | The checkout page. Renders one of two switchable flows based on `NEXT_PUBLIC_CHECKOUT_VARIANT`: the original 4-step flow (address → shipping → payment → review, `src/modules/checkout`) by default, or a 3-step flow (details → shipping → payment, `src/modules/checkout-new`) when set to `"new"`. See [../execution/specs/2026-09-12-custom-checkout-design.md](../execution/specs/2026-09-12-custom-checkout-design.md). |
| `src/app/api/payment-return/route.ts` | A Next.js Route Handler that Stripe redirects back to after off-site payment authorization; completes the cart into an order. See [../workflows/checkout.md](../workflows/checkout.md). |
| `src/middleware.ts` | Runs on every request (Next.js Edge middleware); resolves the visitor's region from `/store/regions` and redirects to a country-code-prefixed path (e.g. `/` → `/dk`), caching the region map for one hour. |
| `src/lib/config.ts` | Instantiates the single `@medusajs/js-sdk` client (`sdk`) used for all backend calls; wraps `sdk.client.fetch` to also forward a locale header. |
| `src/lib/data/*.ts` | Server actions/functions per domain (`cart.ts`, `customer.ts`, `orders.ts`, `products.ts`, `payment.ts`, `fulfillment.ts`, `regions.ts`, `collections.ts`, `categories.ts`, `variants.ts`, `onboarding.ts`, `cookies.ts`, `locales.ts`). Each wraps `sdk.client.fetch` or `sdk.store.*` calls; most are marked `"use server"`. |
| `src/lib/hooks`, `src/lib/context`, `src/lib/util` | React hooks, context providers, and formatting/URL utilities. |
| `src/modules/<domain>/{components,templates}` | UI feature modules: `cart`, `checkout`, `checkout-new`, `account`, `order`, `products`, `categories`, `collections`, `store`, `layout`, `home`, `shipping`, `skeletons`, `common`. `checkout-new` is the `NEXT_PUBLIC_CHECKOUT_VARIANT=new`-gated 3-step checkout flow; it does not modify anything under `checkout`. |

## Data access pattern

All backend access goes through the single SDK instance exported from `src/lib/config.ts`:
- Built-in Medusa endpoints use SDK methods (e.g. `sdk.store.cart.complete(...)` in `src/lib/data/cart.ts`).
- A few calls use `sdk.client.fetch("/store/...")` directly for endpoints without a dedicated SDK method (e.g. `listCartPaymentMethods` in `src/lib/data/payment.ts` fetches `/store/payment-providers`).
- Regular `fetch()` is used in exactly one place — `src/middleware.ts` — because Next.js Edge middleware cannot run the Node-targeted SDK; it manually sets the `x-publishable-api-key` header there instead.

Per the `medusa-dev:building-storefronts` skill's rules, any new storefront code should follow the same pattern (SDK first, `sdk.client.fetch` for custom routes, never a bare `fetch()` with manual headers) rather than the middleware's exception.

## Region and locale routing

`src/middleware.ts` fetches `/store/regions`, builds a country-code → region map (refreshed hourly), and redirects unprefixed paths to `/<countryCode>/...`, defaulting to `NEXT_PUBLIC_DEFAULT_REGION` (`dk` unless overridden). Locale handling lives alongside this in `src/lib/data/locales.ts` / `locale-actions.ts`.

## Payments in the UI

Stripe Elements is mounted conditionally based on the cart's active payment session provider (`isStripeLike` / `isManual` in `src/lib/constants.tsx`). See [../domains/payments.md](../domains/payments.md).

## Testing

No test files exist for the storefront (confirmed: no `*.test.*`/`*.spec.*` under `apps/storefront`), and its `package.json` defines no test script. See [../development/testing.md](../development/testing.md).
