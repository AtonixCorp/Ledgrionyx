# ATC Capital Platform Implementation Directive

This repository now includes the baseline platform structure required to run ATC Capital as an automated, auditable deployment system rather than a manually operated application.

## What was added

### Application runtime
- The Django backend now reads its operational settings from environment variables.
- The backend exposes `GET /api/health/` for Kubernetes readiness and liveness checks.
- The backend exposes `POST /api/platform/events/` for CI/CD and platform telemetry ingestion.
- Production Python dependencies now include `dj-database-url`, `gunicorn`, and `psycopg[binary]`.

### Production containers
- `backend/Dockerfile.prod` runs the API with Gunicorn.
- `frontend/Dockerfile.prod` builds the React application and serves it with NGINX.
- `frontend/nginx/default.conf` routes `/api/` traffic to the backend service.

### Kubernetes layout
- `deploy/k8s/base` contains the shared runtime manifests.
- `deploy/k8s/overlays/dev`, `staging`, and `prod` preserve structural parity while changing only environment-specific values.
- The base includes Deployments, Services, an Ingress, a backend HPA, PodDisruptionBudgets, and a namespace-scoped NetworkPolicy.
- Secrets are not committed to the repository; the manifests expect a synced secret named `atc-capital-app-secrets`.

### Terraform layout
- `infra/terraform/modules` contains reusable modules for networking, EKS, load balancer security groups, PostgreSQL, object storage, observability, secrets access, and CI identity.
- `infra/terraform/environments/dev`, `staging`, and `prod` each define a complete stack root.
- `infra/terraform/global/README.md` documents the shared conventions for remote state and execution discipline.

### CI/CD layout
- `bitbucket-pipelines.yml` now covers backend validation, frontend validation, dependency scanning, production image verification on pull requests, registry publishing on `main`, Kubernetes deployment promotion, post-deploy health validation, Terraform plan/apply lanes, and event logging back into ATC Capital.

## Required environment contracts

### Kubernetes secret contract
The runtime expects the following keys in `atc-capital-app-secrets`:

- `django-secret-key`
- `database-url`
- `platform-event-token`

Those values should be sourced from the cloud secret manager and synchronized into the cluster through the platform’s chosen secret-sync controller.

### Bitbucket repository variables
The CI pipeline assumes the following repository or deployment variables are configured:

- `DOCKER_REGISTRY`
- `DOCKER_USERNAME`
- `DOCKER_PASSWORD`
- `AWS_DEFAULT_REGION`
- `TF_STATE_BUCKET`
- `TF_STATE_LOCK_TABLE`
- `BITBUCKET_OIDC_PROVIDER_ARN`
- `BITBUCKET_OIDC_SUBJECT_CLAIM`
- `BITBUCKET_OIDC_AUDIENCE_CLAIM`
- `BITBUCKET_OIDC_AUDIENCE`
- `BITBUCKET_OIDC_SUBJECTS_JSON`
- `ATC_PLATFORM_EVENT_URL`
- `PLATFORM_EVENT_TOKEN`
- `DEV_EKS_CLUSTER_NAME`
- `STAGING_EKS_CLUSTER_NAME`
- `PROD_EKS_CLUSTER_NAME`
- `DEV_APP_HOST`
- `STAGING_APP_HOST`
- `PROD_APP_HOST`

### Terraform plan pipeline variables
The Terraform custom pipelines also require these variables so the plan and apply steps can export a complete `TF_VAR_*` set per environment:

- `DEV_TERRAFORM_ROLE_ARN`
- `STAGING_TERRAFORM_ROLE_ARN`
- `PROD_TERRAFORM_ROLE_ARN`
- `DEV_TF_AVAILABILITY_ZONES_JSON`
- `STAGING_TF_AVAILABILITY_ZONES_JSON`
- `PROD_TF_AVAILABILITY_ZONES_JSON`
- `DEV_TF_DB_USERNAME`
- `STAGING_TF_DB_USERNAME`
- `PROD_TF_DB_USERNAME`
- `DEV_TF_DB_PASSWORD`
- `STAGING_TF_DB_PASSWORD`
- `PROD_TF_DB_PASSWORD`
- `DEV_TF_ARTIFACT_BUCKET_NAME`
- `STAGING_TF_ARTIFACT_BUCKET_NAME`
- `PROD_TF_ARTIFACT_BUCKET_NAME`
- `DEV_TF_SECRET_ARNS_JSON`
- `STAGING_TF_SECRET_ARNS_JSON`
- `PROD_TF_SECRET_ARNS_JSON`
- `DEV_TF_ECR_REPOSITORY_ARNS_JSON`
- `STAGING_TF_ECR_REPOSITORY_ARNS_JSON`
- `PROD_TF_ECR_REPOSITORY_ARNS_JSON`
- `DEV_TF_STATE_BUCKET_ARN`
- `STAGING_TF_STATE_BUCKET_ARN`
- `PROD_TF_STATE_BUCKET_ARN`
- `DEV_TF_STATE_LOCK_TABLE_ARN`
- `STAGING_TF_STATE_LOCK_TABLE_ARN`
- `PROD_TF_STATE_LOCK_TABLE_ARN`

## Operating rules

1. Run Terraform only from Bitbucket custom pipelines.
2. Keep environment shape identical across `dev`, `staging`, and `prod`.
3. Push immutable image tags based on `BITBUCKET_COMMIT`.
4. Publish deployment events to `POST /api/platform/events/` after each successful release.
5. Use `GET /api/health/` as the authoritative platform health contract.

## Recommended next platform tasks

1. Replace the placeholder registry domains in the Kubernetes overlays with the real registry namespace used in your cloud account.
2. Connect the Kubernetes secret contract to AWS Secrets Manager through External Secrets or Secrets Store CSI Driver.
3. Add database migration execution as a dedicated release step before the backend rollout.
4. Extend the platform event ingestion path from structured logs into a persisted ATC Capital ledger model if you want in-app release history rather than log-only ingestion.