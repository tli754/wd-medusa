# CLAUDE.md

**Project**: Medusa DTC Starter — a Turborepo monorepo with a Medusa v2 backend (`apps/backend`) and an optional Next.js storefront (`apps/storefront`). See [docs/project/overview.md](docs/project/overview.md).

**Project knowledge lives in [`docs/`](docs/README.md)**, indexed by task in [docs/README.md](docs/README.md#when-working-on)'s "When working on…" table. `AGENTS.md` (read it) carries the shared operational rules that apply regardless of which agent or tool is running.

Before proposing or making a change:

- Read the relevant `docs/` entry for the area you're touching, then inspect the current implementation directly (routes, workflows, services, models) — don't rely on the docs alone, and don't rely on filenames or descriptions.
- Trace behaviour along its real execution path: route/event → validation → workflow → steps/services → persistence/external call. See [docs/workflows/checkout.md](docs/workflows/checkout.md) for a worked example of this trace.
- For anything broader than a small, local fix, write a short plan before editing.
- Preserve existing architectural and domain boundaries (module isolation, workflow-only mutations, file-based routing) — see [docs/development/coding-conventions.md](docs/development/coding-conventions.md).
- Before an architectural change, check [docs/decisions/](docs/decisions/README.md) for a relevant ADR.

When you're done:

- Update any `docs/` file whose described behaviour you changed, in the same change.
- Review and test AI-generated code to the same standard as human-written code — run the relevant build/lint/test commands ([docs/development/common-commands.md](docs/development/common-commands.md)) before calling something done.
- Don't claim a fix, a passing test, or a completed task without having actually run the verification that shows it.
