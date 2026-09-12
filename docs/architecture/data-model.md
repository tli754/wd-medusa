---
title: Data Model
status: needs-review
owner: unassigned
last_verified: 2026-09-12
source_of_truth:
  - apps/backend/src/modules
  - apps/backend/src/migration-scripts/initial-data-seed.ts
related:
  - backend.md
  - integrations.md
---

# Data Model

## Verified current behaviour

This backend defines **no custom data models**. `apps/backend/src/modules` contains no module subdirectories (only the framework's boilerplate `README.md`), so every table, entity, and relationship in the database is one of Medusa's own core modules: product, product variant, cart, order, customer, region, payment, payment collection, fulfillment, promotion, sales channel, stock location, inventory, store, API key, tax region, and so on. Their schemas are owned by `@medusajs/medusa` / `@medusajs/framework` and are not reproduced here — see [Medusa's own data model docs](https://docs.medusajs.com) for the authoritative reference, and inspect a given module's migrations in `node_modules/@medusajs/*/dist` only when you need exact column names (do not hand-copy them into this document, since they change with the pinned Medusa version, `2.20.1`).

`apps/backend/src/migration-scripts/initial-data-seed.ts` populates (not defines) this core schema: one sales channel, one publishable API key, one store, regions for `gb, de, dk, se, fr, es, it`, tax regions, stock locations, shipping profiles/options, and product categories/options.

## Plugin-added tables

The `@rx-ventures/medusa-plugin-shopify-sync` plugin (see [integrations.md](integrations.md)) adds two tables, per its own `README.md`, applied via `medusa db:migrate` once the plugin is registered:

| Table | Purpose |
|---|---|
| `shopify_config` | Singleton row holding encrypted Shopify credentials, webhook secret, and last-sync timestamps. |
| `shopify_webhook_log` | One row per inbound Shopify webhook delivery (success or failure), surfaced in an admin log page. |

These table definitions live inside the plugin package, not in this repository's own migrations.

## Module links

No custom module links exist (`apps/backend/src/links` has only the boilerplate `README.md`), so no cross-module associations beyond Medusa's built-in ones and whatever the Shopify plugin wires up internally.

## Open questions

- Whether any custom data model is planned is not recorded in the repository.
- The exact tables/columns the Shopify plugin's migrations create beyond the two named above are internal to that package; consult its installed copy under `node_modules/@rx-ventures/medusa-plugin-shopify-sync` or its GitHub repository if exact schema is needed.
