# AGENTS.md

Shared instructions for any coding agent (Claude Code, Codex, or otherwise) working in this repository. Tool-neutral; project knowledge itself lives under [`docs/`](docs/README.md), not here.

## What this repository is

A Turborepo/pnpm monorepo: a Medusa v2 backend (`apps/backend`, `@dtc/backend`) and an optional Next.js storefront (`apps/storefront`, `@dtc/storefront`). **`apps/storefront` may not exist** — check before running storefront commands or assuming a full-stack change is possible. Full structure: [docs/development/repository-structure.md](docs/development/repository-structure.md).

## Repository navigation

- Start at [docs/README.md](docs/README.md) — its "When working on…" table routes you to the right document(s) for a task (backend, storefront, a specific domain, deployment, etc.).
- Each app may carry its own nested `AGENTS.md`; read the nearest one in the directory tree, since it takes precedence for that subtree.
- Detect the package manager before running anything — see [docs/development/repository-structure.md](docs/development/repository-structure.md#package-manager-detection). Never introduce a second lockfile.

## Documentation routing

| You are about to... | Read |
|---|---|
| Touch backend code (modules, routes, workflows) | [docs/architecture/backend.md](docs/architecture/backend.md) |
| Touch storefront code | [docs/architecture/storefront.md](docs/architecture/storefront.md) |
| Change a specific business domain (catalog, cart, orders, customers, payments, fulfillment) | the matching file in [docs/domains/](docs/README.md#when-working-on) |
| Trace or change a multi-step flow (checkout, order processing, product import) | the matching file in [docs/workflows/](docs/README.md#when-working-on) |
| Make an architectural change | [docs/decisions/README.md](docs/decisions/README.md) first, for any relevant prior ADR |
| Run or configure the project | [docs/development/](docs/development/local-setup.md) |
| Deploy or debug production | [docs/operations/](docs/operations/deployment.md) |

## Planning expectations

- Small, local, easily-reversible changes can proceed directly.
- Anything touching more than one file, a shared pattern, a public API shape, or an external integration needs a short plan first — what will change, why, and what it affects — before editing.
- Inspect the current implementation before planning a change to it. Do not plan against what a document says the code does; verify first, since documentation can lag the code.

## Code ownership expectations

- Preserve module isolation, workflow-only mutations, and file-based routing (see [docs/development/coding-conventions.md](docs/development/coding-conventions.md)) — don't bypass a layer to save time.
- Keep a change inside the domain/module boundary it belongs to. A checkout fix stays in checkout code; it doesn't reach into catalog or customer code unless the task requires it.
- Stay within the requested scope. Don't refactor, rename, or "improve" adjacent code the task didn't ask about; flag it instead and let the user decide.

## Testing and verification expectations

- Run the build/lint/test commands relevant to what you changed ([docs/development/common-commands.md](docs/development/common-commands.md)) before calling work done.
- As of this writing, this repository has package-script-level test commands but no actual test files (see [docs/development/testing.md](docs/development/testing.md)) — running them proving nothing failed is not the same as proving your change works. Say so plainly rather than implying coverage that doesn't exist.
- New backend logic should ship with a test in the location the existing Jest globs expect, so coverage actually starts accumulating.
- Never claim a task is complete, fixed, or passing without having run the verification that shows it.

## Documentation update rules

- When you change behaviour that a `docs/` file describes, update that file in the same change — don't leave it to a follow-up.
- Prefer editing the existing, authoritative document over creating a new one; prefer a relative link over copying a fact that already lives elsewhere in `docs/`.
- Bump a changed document's `last_verified` date only when you actually re-checked its content against the code.
- If you're not sure which document is affected, check [docs/README.md](docs/README.md)'s routing table.

## Handling conflicts

- Code, configuration, and tests are the source of truth. When a `docs/` file disagrees with the repository, trust the repository, fix the document, and say so — don't silently pick one or the other without noting the discrepancy.
- When a user's instruction conflicts with a documented architectural boundary or a safety rule below (off-limits paths, destructive commands), say so and ask before proceeding, rather than silently complying or silently refusing.
- Never invent a requirement, business rule, or command that isn't backed by the repository or an explicit instruction. If something is unknown, say it's unknown (and where in `docs/` that gap is already tracked) rather than filling it in with a plausible guess.

## Common mistakes (see [docs/operations/troubleshooting.md](docs/operations/troubleshooting.md) for the full, evidenced list)

- Running storefront commands without checking `apps/storefront/` exists.
- Installing a dependency at the repo root instead of inside the app that needs it.
- Editing a custom module's model without regenerating its migration.
- Writing raw SQL or importing a DB client directly instead of going through module services/workflows.
- Treating `pnpm run backend:seed` as working — it currently is not; see [docs/development/common-commands.md](docs/development/common-commands.md) for the working command.
- Silencing a `@medusajs/*` ESLint rule instead of fixing the underlying pattern.

## Off-limits

- `apps/backend/.medusa/`, `.next/`, `dist/`, `out/`, `.turbo/` — build output, excluded from the workspace and regenerated.
- The lockfile (`pnpm-lock.yaml` or whichever this install produced) — never hand-edit or delete; change it only as a side effect of a package manager command.
- `.env` / `.env.local` — never commit, print, or copy secret values out of them. Edit `.env.template` instead when documenting a new variable.
- Existing migrations in `src/modules/*/migrations/` — add a new migration rather than rewriting one that may already have run.
- Destructive DB commands (drops, resets) against a database you don't own, without explicit confirmation.

## Medusa skills & MCP server

If the `medusa-dev` agent skills are available, load the relevant one *before* writing code — `building-with-medusa` for any backend work, `building-admin-dashboard-customizations` for `apps/backend/src/admin`, `building-storefronts` for `apps/storefront`. They contain architectural rules (workflow-only mutations, price formatting, query patterns) this file only summarizes. If a `medusa` MCP server exposing the official docs is connected, prefer it over web search or memory for Medusa API/config questions.
