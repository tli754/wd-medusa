---
title: External Integrations
status: verified
owner: unassigned
last_verified: 2026-09-12
source_of_truth:
  - apps/backend/medusa-config.ts
  - apps/backend/package.json
  - node_modules/@rx-ventures/medusa-plugin-shopify-sync (package.json, README.md)
  - apps/storefront/src/modules/checkout
  - apps/storefront/src/lib/constants.tsx
  - README.md
related:
  - ../domains/payments.md
  - ../workflows/product-import.md
  - ../project/current-status.md
---

# External Integrations

## Stripe (payment)

- **Where**: storefront only. `apps/storefront/src/modules/checkout/components/payment-wrapper` mounts Stripe Elements when `NEXT_PUBLIC_STRIPE_KEY` is set; `payment-button/index.tsx` calls `stripe.confirmPayment()` client-side and, on success/`requires_capture`, calls the storefront's `placeOrder()`.
- **Backend side**: Stripe is configured as a Medusa payment provider (provider ids matched by `isStripeLike()` in `apps/storefront/src/lib/constants.tsx`: `pp_stripe_*`, `pp_medusa-*`). No custom Stripe backend code exists in this repo — the payment session lifecycle (create/authorize/capture) is handled by Medusa's built-in Stripe payment provider module, configured at the Medusa-project level (not visible as repo code; likely admin-configured or via a `modules` entry not present in the currently committed `medusa-config.ts`).
- **Redirect flow**: `apps/storefront/src/app/api/payment-return/route.ts` — see [../workflows/checkout.md](../workflows/checkout.md).
- **Manual/test provider**: `pp_system_default`, matched by `isManual()`, used to place orders without a real payment processor (e.g. local development).

## Shopify (via `@rx-ventures/medusa-plugin-shopify-sync`)

- **Status**: registered in `apps/backend/medusa-config.ts`'s `plugins` array — **as an uncommitted working-tree change** at time of writing (see [../project/current-status.md](../project/current-status.md)). Treat as not-yet-shipped until committed and verified working.
- **What it does** (per the installed package's own `README.md`, version `0.4.8`): syncs customers, orders, products, and discounts between Shopify and Medusa, in both directions —
  - **Manual (admin-triggered) sync**: paginated for customers, orders, products (including image re-upload through Medusa's File module), and discounts.
  - **Inbound webhooks**: customers (create/update/delete/enable/disable), orders (create/updated/cancelled/paid/fulfilled/partially_fulfilled/edited) and refunds, products (create/update/delete), inventory levels (update/connect/disconnect), fulfillments (create/update, reconciled onto the parent order). Draft orders are logged only, not synced.
  - Every webhook delivery is logged to a `shopify_webhook_log` table, visible in a dedicated admin page ("Shopify webhook logs") with auto-refresh and filters.
- **Configuration**: `options.encryption_key` is read from `process.env.SHOPIFY_SYNC_ENCRYPTION_KEY` in `medusa-config.ts`. This variable is **not present** in `apps/backend/.env.template` — a gap to fix before this plugin can be relied on in a fresh environment. Per the plugin's README, this key must be a 64-char hex string, generated once (`openssl rand -hex 32`) and kept stable across deploys (it encrypts the stored Shopify access token at rest; rotating it invalidates the saved token).
- **Runtime setup**: connection (store URL + Shopify Admin API access token) is configured through the admin dashboard at Settings → Shopify Sync, not through repo code or environment variables (beyond the encryption key and optional `webhook_base_url`/`shopify_api_version` overrides shown, commented out, in `medusa-config.ts`).
- **Required Shopify API scopes** (per plugin README): `read_customers, write_customers, read_orders, write_orders, read_products, write_products, read_discounts, write_webhooks`.
- **Database impact**: adds `shopify_config` and `shopify_webhook_log` tables; see [data-model.md](data-model.md).
- **Product import relevance**: this plugin's manual product sync is the closest thing in this repository to a "product import" mechanism. See [../workflows/product-import.md](../workflows/product-import.md).

## Medusa Cloud

`README.md` documents deploying this starter via [Medusa Cloud](https://cloud.medusajs.com)'s dashboard as the "fastest way to get started." No repository code (Dockerfile, IaC, deploy scripts) implements or configures this — it is a hosted-platform deploy path external to the repo. See [../operations/deployment.md](../operations/deployment.md).

## GitHub Actions: automated Medusa updates

`.github/workflows/update.yaml` runs `medusajs/medusa-update-action` on manual dispatch, opening a PR that bumps the pinned Medusa version, using repository secrets (`MEDUSA_PUBLISHABLE_KEY`, `MEDUSA_BACKEND_URL`, `ANTHROPIC_API_KEY`, `GITHUB_TOKEN`). This is a maintenance automation, not a runtime integration.

## Open questions

- Whether the Shopify plugin is meant to ship: confirm before committing `medusa-config.ts`'s current change.
- Which Stripe payment-provider module/config backs `pp_stripe_*` server-side — not visible in the committed backend config as of this writing.
