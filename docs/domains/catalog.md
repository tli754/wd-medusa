---
title: Catalog Domain
status: verified
owner: unassigned
last_verified: 2026-09-12
source_of_truth:
  - apps/storefront/src/lib/data/products.ts
  - apps/storefront/src/lib/data/collections.ts
  - apps/storefront/src/lib/data/categories.ts
  - apps/backend/src/migration-scripts/initial-data-seed.ts
related:
  - ../architecture/data-model.md
  - ../workflows/product-import.md
---

# Catalog Domain

## Verified current behaviour

The catalog (products, variants, categories, collections) is entirely Medusa's built-in product module — this repository adds no custom fields, validation, or workflows for products. The storefront only *reads* catalog data:

| File | Responsibility |
|---|---|
| `apps/storefront/src/lib/data/products.ts` | `listProducts()`, `listProductsWithSort()` — paginated product listing/search against `/store/products`, region- and sales-channel-aware via the publishable API key. |
| `apps/storefront/src/lib/data/variants.ts` | Variant-level helpers (pricing/options lookups for a given product). |
| `apps/storefront/src/lib/data/collections.ts`, `categories.ts` | Listing/retrieval for collections and categories. |

Catalog data is populated by:
- `apps/backend/src/migration-scripts/initial-data-seed.ts` — creates product categories and shared product options (not full sample products) as part of initial store setup.
- The Shopify sync plugin's manual product sync, when configured — see [../workflows/product-import.md](../workflows/product-import.md) and [../architecture/integrations.md](../architecture/integrations.md).
- Manual creation through the Medusa Admin dashboard (`/app`), which is not repository code.

## Business rules

None are implemented in this repository beyond Medusa's own core product-module validation (not visible as repo code). Do not infer catalog business rules from the storefront's display behaviour — the storefront only renders what the backend returns; it does not enforce or duplicate business rules.

## Open questions

- Whether any product customization (custom fields, custom pricing rules) is planned is not recorded in the repository.
