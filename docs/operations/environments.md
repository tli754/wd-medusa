---
title: Environments
status: needs-review
owner: unassigned
last_verified: 2026-09-12
source_of_truth:
  - apps/backend/.env.template
  - apps/storefront/.env.template
  - .github/workflows/update.yaml
related:
  - deployment.md
  - ../development/local-setup.md
---

# Environments

## Verified current behaviour

Only a **local development** environment is described in the repository (`README.md`'s Local Installation steps, `.env.template` files with `localhost` defaults). No staging or production environment configuration (URLs, secrets management, infra) exists as repository content.

`.github/workflows/update.yaml` references two GitHub Actions secrets used for an automated PR bot, implying at least one deployed/reference backend and storefront exist somewhere for that workflow to point at:

- `MEDUSA_PUBLISHABLE_KEY` → `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY`
- `MEDUSA_BACKEND_URL` → `NEXT_PUBLIC_MEDUSA_BACKEND_URL`

Their actual values are not, and must never be, recorded in this documentation.

## Environment variables (names only — never values)

**Backend** (`apps/backend/.env.template`): `STORE_CORS`, `ADMIN_CORS`, `AUTH_CORS`, `REDIS_URL`, `JWT_SECRET`, `COOKIE_SECRET`, `DATABASE_URL`, `DB_NAME`. Additionally, if the Shopify sync plugin is enabled: `SHOPIFY_SYNC_ENCRYPTION_KEY` (not yet in `.env.template` — see [../architecture/integrations.md](../architecture/integrations.md)).

**Storefront** (`apps/storefront/.env.template`): `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY`, `NEXT_PUBLIC_MEDUSA_BACKEND_URL`, `NEXT_PUBLIC_DEFAULT_REGION`, `NEXT_PUBLIC_BASE_URL`, `NEXT_PUBLIC_STRIPE_KEY`, `MEDUSA_CLOUD_S3_HOSTNAME`, `MEDUSA_CLOUD_S3_PATHNAME`, `NODE_ENV`.

## Open questions

- What staging/production environments exist, who owns them, and how they're configured is not recorded in this repository — confirm with whoever manages the deploy referenced by the GitHub Actions secrets above before assuming none exists.
