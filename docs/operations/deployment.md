---
title: Deployment
status: needs-review
owner: unassigned
last_verified: 2026-09-12
source_of_truth:
  - README.md
  - .github/workflows/update.yaml
related:
  - environments.md
  - ../project/current-status.md
---

# Deployment

## Verified current behaviour

`README.md` documents exactly one deployment path: [Medusa Cloud](https://cloud.medusajs.com)'s dashboard — "Create a Medusa Cloud account" and "Deploy this starter directly from your dashboard." This is a hosted-platform flow external to the repository; no repository code configures or triggers it.

No `Dockerfile`, `docker-compose.yml`, Kubernetes manifests, Terraform/Pulumi, or any other infrastructure-as-code exists in the repository. There is no build-and-push CI job.

The only automation in `.github/workflows/` is `update.yaml` ("Update Medusa"): a manually-triggered (`workflow_dispatch`) job that runs `medusajs/medusa-update-action` to open a PR bumping the pinned Medusa version. It is a maintenance bot, not a deployment pipeline — it does not build, test, or deploy the application.

## Proposed or planned behaviour

None recorded.

## Open questions

- How this project is actually deployed today (Medusa Cloud, a custom host, something else) beyond what `README.md` suggests is not confirmed by repository evidence — the presence of deploy-adjacent secrets in `.github/workflows/update.yaml` (see [environments.md](environments.md)) implies *some* deployed environment exists, but its mechanism is not in this repo.
- Whether a CI pipeline (build/lint/test on PR) is planned is not recorded.
