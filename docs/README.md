---
title: Documentation Index
status: verified
owner: unassigned
last_verified: 2026-09-12
source_of_truth:
  - AGENTS.md
  - CLAUDE.md
related:
  - project/overview.md
  - architecture/system-overview.md
---

# Documentation Index

This is the entry point into the project knowledge base for **Medusa DTC Starter** — a Turborepo monorepo containing a Medusa v2 backend (`apps/backend`) and an optional Next.js storefront (`apps/storefront`).

Read [`../AGENTS.md`](../AGENTS.md) first for the operational contract (navigation, planning, testing, and doc-update rules). This index tells you *which* document to read for a given task.

## When working on…

| Task | Read first | Then, if needed |
|---|---|---|
| Local setup / running the apps | [development/local-setup.md](development/local-setup.md) | [development/common-commands.md](development/common-commands.md) |
| Backend / API changes | [architecture/backend.md](architecture/backend.md) | [development/coding-conventions.md](development/coding-conventions.md) |
| Storefront changes | [architecture/storefront.md](architecture/storefront.md) | [architecture/system-overview.md](architecture/system-overview.md) |
| Product / catalog work | [domains/catalog.md](domains/catalog.md) | [architecture/data-model.md](architecture/data-model.md) |
| Cart and checkout | [workflows/checkout.md](workflows/checkout.md) | [domains/cart-and-checkout.md](domains/cart-and-checkout.md), [domains/payments.md](domains/payments.md) |
| Orders | [domains/orders.md](domains/orders.md) | [workflows/order-processing.md](workflows/order-processing.md) |
| Customers | [domains/customers.md](domains/customers.md) | [architecture/storefront.md](architecture/storefront.md) |
| Payments | [domains/payments.md](domains/payments.md) | [workflows/checkout.md](workflows/checkout.md) |
| Fulfillment | [domains/fulfillment.md](domains/fulfillment.md) | [architecture/data-model.md](architecture/data-model.md) |
| Product import / migration | [workflows/product-import.md](workflows/product-import.md) | [architecture/integrations.md](architecture/integrations.md) |
| External integrations (Shopify, Stripe) | [architecture/integrations.md](architecture/integrations.md) | [domains/payments.md](domains/payments.md), [workflows/product-import.md](workflows/product-import.md) |
| Database / migrations | [architecture/data-model.md](architecture/data-model.md) | [development/local-setup.md](development/local-setup.md) |
| Deployment | [operations/deployment.md](operations/deployment.md) | [operations/environments.md](operations/environments.md) |
| Production troubleshooting | [operations/troubleshooting.md](operations/troubleshooting.md) | [operations/deployment.md](operations/deployment.md) |
| Architectural decisions | [decisions/README.md](decisions/README.md) | [architecture/system-overview.md](architecture/system-overview.md) |

## Structure

```text
docs/
├── project/        # purpose, scope, status, glossary
├── architecture/    # system design, per-app design, data model, integrations
├── domains/         # business-domain rules (catalog, cart, orders, ...)
├── workflows/       # traced request/event → workflow → persistence paths
├── decisions/       # ADRs (architecture decision records)
├── development/     # setup, structure, conventions, testing, commands
└── operations/      # environments, deployment, troubleshooting
```

## Authoritative sources

Documentation describes the code; it is never the other way around. When a document and the repository disagree, the repository (source + config + tests) wins — but the conflict should be reported and the document corrected. Authoritative sources, in order:

1. **Source code and configuration** under `apps/*` — always the final word on current behaviour.
2. **`package.json` scripts / `turbo.json`** — the final word on what commands actually exist and do.
3. **This `docs/` tree** — the agreed, verified description of the above, kept in sync as code changes.
4. **`AGENTS.md` / `CLAUDE.md`** — short operational pointers into this tree; they should not contain facts that live nowhere else.

## Document status meanings

| Status | Meaning |
|---|---|
| `verified` | Checked against current code/config/tests as of `last_verified`. |
| `draft` | Written but not fully cross-checked against the repository; treat with caution. |
| `needs-review` | Known to be incomplete, stale, or disputed; see the document's Open Questions section. |
| `deprecated` | Describes behaviour that has been superseded; kept for history, linked from its replacement. |

## Keeping this current

When you change behaviour (a route, workflow, data model, integration, or command), update the document(s) that describe it in the same change, and bump `last_verified`. If you're not sure which document is affected, check the table above, then grep `docs/` for the file/symbol you changed. Prefer editing an existing document over creating a new one; prefer linking over duplicating a fact that already lives elsewhere in this tree.
