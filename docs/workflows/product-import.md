---
title: Product Import / Migration Workflow Trace
status: needs-review
owner: unassigned
last_verified: 2026-09-12
source_of_truth:
  - apps/backend/src/migration-scripts/initial-data-seed.ts
  - node_modules/@rx-ventures/medusa-plugin-shopify-sync (README.md)
related:
  - ../domains/catalog.md
  - ../architecture/integrations.md
---

# Product Import / Migration Workflow Trace

This repository has no custom "product import" API route or workflow. Two distinct, unrelated mechanisms touch product data at setup/import time:

## 1. Initial data seed (categories and options only, not full products)

- **Where the request originates**: a manual CLI invocation, `medusa exec ./src/migration-scripts/initial-data-seed.ts` (see [../development/common-commands.md](../development/common-commands.md)) — not triggered by any route or event.
- **What it does**: creates a default sales channel, publishable API key, store, regions, tax regions, stock locations, shipping profiles/options, product categories/options, and sample products, via Medusa's core workflows (`createProductCategoriesWorkflow`, `createProductOptionsWorkflow`, `createProductsWorkflow`, all from `@medusajs/medusa/core-flows`). `createProductsWorkflow` is invoked at `initial-data-seed.ts:344`.
- **Database changes**: writes through Medusa core workflows only; no raw SQL.
- **External calls / events / retries**: none beyond what Medusa's core workflows do internally; this script is a one-shot, not idempotent-by-design import (re-running it was not verified to be safe — check for duplicate-creation errors before re-running against a non-empty database).
- **Tests**: none.

## 2. Shopify product sync (the closest thing to a recurring "import")

Per the installed `@rx-ventures/medusa-plugin-shopify-sync` plugin's own README (see [../architecture/integrations.md](../architecture/integrations.md) for full integration detail):

- **Trigger**: an admin-dashboard button (Settings → Shopify Sync) for manual, paginated product sync; also inbound webhooks (`products/{create,update,delete}`) for ongoing updates.
- **What it does**: pulls products from Shopify, downloads their images from Shopify's CDN, and re-uploads them through Medusa's File module.
- **Where it runs**: entirely inside the plugin package (`node_modules/@rx-ventures/medusa-plugin-shopify-sync`), not in this repository's own `src/`.
- **Status**: the plugin's registration in `medusa-config.ts` is an uncommitted change at time of writing — treat this import path as not-yet-shipped until committed and verified.

## Open questions

- No other product-import mechanism (CSV import, custom migration script) exists in this repository as of this writing.
