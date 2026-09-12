---
title: Architecture Decision Records
status: verified
owner: unassigned
last_verified: 2026-09-12
source_of_truth:
  - git log
related:
  - ADR-template.md
  - ../architecture/system-overview.md
---

# Architecture Decision Records (ADRs)

## Verified current status

No ADRs exist in this repository as of this writing, and no historical document records *why* past architectural choices (e.g. Turborepo + pnpm, Next.js App Router, adding the Shopify sync plugin) were made. Do not retroactively invent reasoning for these choices — where the reasoning isn't recorded, say so as an open question rather than presenting a guess as fact.

## When to write an ADR

Write one when a change:
- Introduces or removes a major dependency, plugin, or integration (e.g. adding a payment provider, a sync integration, a new module).
- Changes a cross-cutting pattern (e.g. how workflows are structured, how the storefront talks to the backend).
- Cannot easily be reversed, or would be expensive to reverse.

Small, local, easily-reversible changes do not need an ADR.

## Process

1. Copy [`ADR-template.md`](ADR-template.md) to `docs/decisions/ADR-NNNN-short-title.md`, using the next sequential number.
2. Fill in every section; leave `Open Questions` explicit rather than skipping uncertain parts.
3. Link the ADR from the architecture/domain document(s) it affects.
4. When a later decision supersedes an ADR, set the old ADR's `Status` to `Superseded` and add a `Superseded by` link to the new one — never delete a past ADR.

## Before an architectural change

Read any ADR related to the area you're touching (search `docs/decisions/` and the "related" links in the relevant `docs/architecture/*.md` or `docs/domains/*.md` file) before proposing a change that might conflict with a recorded decision.
