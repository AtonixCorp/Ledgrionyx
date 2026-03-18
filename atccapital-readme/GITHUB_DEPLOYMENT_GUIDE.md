# ATC Capital GitHub Deployment Guide

This guide explains how to deploy ATC Capital from GitHub using the deployment assets already present in this repository.

It is written against the current repo state:

- GitHub Actions currently provides CI validation through `.github/workflows/ci.yml`.
- Full release automation today is implemented in `bitbucket-pipelines.yml`.
- Production runtime assets already exist for Docker, Kubernetes, and Terraform.

If you want GitHub to become the primary deployment control plane, this document shows the recommended shape and the exact repository contracts that already exist.

## 1. Deployment Architecture

ATC Capital is structured as a two-service application with optional scheduled background sync:

- `backend/`: Django + Django REST Framework API
- `frontend/`: React application built into static assets and served by NGINX
- `banking-sync`: scheduled Django management command for banking integration fallbacks

Production deployment is designed around:

- Docker images for backend and frontend
- Kubernetes manifests in `deploy/k8s/base`
- Environment overlays in `deploy/k8s/overlays/dev`, `staging`, and `prod`
- Terraform infrastructure in `infra/terraform/environments/dev`, `staging`, and `prod`

## 2. What Already Exists In The Repo

### GitHub

The current GitHub workflow is `.github/workflows/ci.yml` and does the following:

- Runs backend tests
- Builds the frontend
- Executes on push and pull request for `main` and `master`

It does **not** currently:

- Build and push production container images
- Authenticate to AWS
- Apply Kubernetes manifests
- Run Terraform
- Post deployment events back into the platform

### Bitbucket

The full production-ready automation already exists in `bitbucket-pipelines.yml`.

That pipeline already handles:

- Backend validation
- Frontend validation
- Dependency scanning
- Production image build and push
- Kubernetes deployment for `dev`, `staging`, and `prod`
- Post-deploy health checks against `/api/health/`
- Terraform plan/apply lanes
- Platform deployment event logging through `/api/platform/events/`

### Containers

- `backend/Dockerfile.prod` builds the Django API image and serves it with Gunicorn.
- `frontend/Dockerfile.prod` builds the React app and serves it with NGINX.
- `docker-compose.yml` supports local multi-service development and includes the `banking-sync` service.

### Kubernetes

The repository already contains a proper multi-environment deployment layout:

- Shared manifests: `deploy/k8s/base`
- Environment-specific overlays:
  - `deploy/k8s/overlays/dev`
  - `deploy/k8s/overlays/staging`
  - `deploy/k8s/overlays/prod`

The manifests include Deployments, Services, Ingress, HPA, PodDisruptionBudgets, and a NetworkPolicy.

### Terraform

Terraform is already structured for environment-specific infrastructure:

- Shared conventions: `infra/terraform/global`
- Reusable modules: `infra/terraform/modules`
- Stack roots: `infra/terraform/environments/dev`, `staging`, and `prod`

## 3. Recommended GitHub Deployment Model

If GitHub is the source of truth, use this promotion path:

1. Pull request to `main`
2. GitHub Actions runs backend tests, frontend build, and optional security scans
3. Merge to `main`
4. GitHub Actions builds and pushes immutable backend and frontend images tagged with the Git SHA
5. GitHub Actions deploys `dev`
6. GitHub Environment approval promotes to `staging`
7. GitHub Environment approval promotes to `prod`
8. After each deployment, GitHub validates `https://<host>/api/health/`
9. GitHub posts a structured deployment event to `/api/platform/events/`

This mirrors the intent of the existing Bitbucket pipeline while fitting GitHub's environment and approval model.

## 4. Required GitHub Repository Setup

### Branches

- Default branch: `main`
- Protected branch rules for `main`
- Pull request checks required before merge

### GitHub Environments

Create these GitHub Environments:

- `dev`
- `staging`
- `prod`

Recommended protections:

- `dev`: optional reviewer approval
- `staging`: required reviewer approval
- `prod`: required reviewer approval and restricted secret access

### GitHub Secrets And Variables

Use the same names already assumed by the Bitbucket deployment pipeline where possible. That keeps the future GitHub workflow simple and reduces translation errors.

Repository or environment secrets/variables expected by the deployment model:

- `DOCKER_REGISTRY`
- `DOCKER_USERNAME`
- `DOCKER_PASSWORD`
- `AWS_DEFAULT_REGION`
- `ATC_PLATFORM_EVENT_URL`
- `PLATFORM_EVENT_TOKEN`
- `DEV_EKS_CLUSTER_NAME`
- `STAGING_EKS_CLUSTER_NAME`
- `PROD_EKS_CLUSTER_NAME`
- `DEV_APP_HOST`
- `STAGING_APP_HOST`
- `PROD_APP_HOST`
- `TF_STATE_BUCKET`
- `TF_STATE_LOCK_TABLE`

Terraform-related values required if GitHub will also run infrastructure changes:

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

## 5. Kubernetes Secret Contract

Regardless of whether deployment is triggered from Bitbucket or GitHub, the cluster must provide a Kubernetes secret named `atc-capital-app-secrets`.

It must contain at least:

- `django-secret-key`
- `database-url`
- `platform-event-token`

Recommended additional runtime secrets include banking provider credentials and any production-only integration keys required by the backend.

Do not commit secrets into this repository. Sync them from your cloud secret manager into the cluster.

## 6. Production Image Contracts

### Backend image

`backend/Dockerfile.prod`:

- Uses Python 3.13 slim
- Installs build dependencies and Python requirements
- Collects static files during build
- Runs Gunicorn on port `8000`

### Frontend image

`frontend/Dockerfile.prod`:

- Builds the React application with Node 20 Alpine
- Serves the static build with NGINX
- Exposes port `80`

### Tagging strategy

Use immutable tags from the GitHub commit SHA.

Recommended image names:

- `${DOCKER_REGISTRY}/atc-capital/backend:${GITHUB_SHA}`
- `${DOCKER_REGISTRY}/atc-capital/frontend:${GITHUB_SHA}`

Avoid mutable deployment tags such as `latest` for promoted environments.

## 7. GitHub Deployment Workflow Design

The repository does not yet contain a full GitHub deployment workflow, but the recommended design is straightforward because the Bitbucket logic already defines the target behavior.

### Workflow A: CI validation

Keep `.github/workflows/ci.yml` for:

- Backend tests
- Frontend install/build
- Pull request validation

Recommended additions:

- Django `check --deploy`
- Frontend tests
- Dependency/security scanning
- Production image build verification on pull requests

### Workflow B: Release images

Trigger on push to `main` and:

1. Check out the repository
2. Authenticate to the container registry
3. Build `backend/Dockerfile.prod`
4. Build `frontend/Dockerfile.prod`
5. Push both images tagged with `${GITHUB_SHA}`

### Workflow C: Deploy application

Trigger manually with `workflow_dispatch` or after successful image publication.

For each environment:

1. Authenticate to AWS with GitHub OIDC
2. Fetch cluster credentials with `aws eks update-kubeconfig`
3. Update the overlay image registry and tag references
4. Apply `kubectl apply -k deploy/k8s/overlays/<env>`
5. Wait for rollout success for backend and frontend Deployments
6. Validate `https://<app-host>/api/health/`
7. POST a deployment event to the platform event endpoint

### Workflow D: Terraform

Use a separate manually approved workflow for infrastructure.

Important: the current helper script `tools/ci/run_terraform_pipeline.sh` bootstraps Bitbucket OIDC specifically through `tools/ci/bootstrap_bitbucket_oidc.sh`.

For GitHub Actions, do one of the following:

- Replace the Bitbucket OIDC bootstrap step with `aws-actions/configure-aws-credentials`
- Or create a GitHub-specific Terraform wrapper script that preserves the same `TF_VAR_*` rendering behavior but uses GitHub OIDC identity

Do not reuse the Bitbucket OIDC bootstrap unchanged inside GitHub Actions.

## 8. Step-By-Step GitHub Deployment Procedure

### Step 1: Validate the application

Run these checks on pull requests:

- Backend dependency install
- `python manage.py test`
- Optional: `python manage.py check --deploy`
- Frontend `npm ci`
- Frontend `npm run build`

### Step 2: Build production images

Build from:

- `backend/Dockerfile.prod`
- `frontend/Dockerfile.prod`

Push them to your target registry with the commit SHA.

### Step 3: Prepare the cluster

Ensure before the first deployment that:

- The EKS cluster exists
- Namespaces exist for `dev`, `staging`, and `prod`
- `atc-capital-app-secrets` is present in each environment
- Ingress DNS records resolve correctly
- Registry pull access is configured for the cluster

### Step 4: Deploy to dev

Apply:

- `deploy/k8s/overlays/dev`

Verify:

- Backend rollout succeeded
- Frontend rollout succeeded
- `https://<dev-host>/api/health/` returns success

### Step 5: Promote to staging

Apply:

- `deploy/k8s/overlays/staging`

Verify the same rollout and health checks.

### Step 6: Promote to prod

Apply:

- `deploy/k8s/overlays/prod`

Protect this deployment with required GitHub Environment approval.

## 9. Database And Migration Handling

The repository currently recommends adding database migration execution as a dedicated release step before backend rollout.

That is the correct design.

Before calling a GitHub deployment flow production-ready, add an explicit migration stage such as:

1. Run `python manage.py migrate` against the target environment
2. Confirm migration success
3. Continue with backend rollout

Do not rely on ad hoc manual migrations during production release windows.

## 10. Health Checks And Post-Deploy Validation

Use `GET /api/health/` as the authoritative readiness check for deployed environments.

After each environment deployment, validate:

- Kubernetes rollout status for backend
- Kubernetes rollout status for frontend
- HTTP health check success at `/api/health/`
- Optional smoke test against a critical authenticated API path

The platform also supports deployment event logging through `POST /api/platform/events/`. GitHub deployments should continue emitting those events so release history stays observable.

## 11. Rollback Strategy

Recommended rollback order:

1. Identify the last known good image SHA
2. Re-apply the target overlay with the previous image tag
3. Confirm backend rollout
4. Confirm frontend rollout
5. Re-run `/api/health/`

If the issue is infrastructure-related rather than application-related, rollback the infrastructure change separately from the application release.

## 12. GitHub Deployment Readiness Checklist

Use this checklist before calling GitHub deployment complete:

- [ ] GitHub Environments created for `dev`, `staging`, and `prod`
- [ ] Required repository and environment secrets configured
- [ ] Container registry credentials verified
- [ ] AWS OIDC trust configured for GitHub Actions
- [ ] Kubernetes secret `atc-capital-app-secrets` present in each environment
- [ ] Kubernetes overlay image references tested
- [ ] Backend tests passing in GitHub Actions
- [ ] Frontend build passing in GitHub Actions
- [ ] Production image build verified in CI
- [ ] Migration step added before backend rollout
- [ ] Post-deploy health checks passing
- [ ] Deployment event logging enabled

## 13. Recommended Next Repo Changes

To move from documentation to a fully GitHub-native deploy pipeline, the next concrete repo changes should be:

1. Add a GitHub Actions image build workflow.
2. Add a GitHub Actions deploy workflow for `dev`, `staging`, and `prod`.
3. Add a GitHub-specific Terraform workflow using GitHub OIDC.
4. Add a migration job that runs before backend rollout.
5. Replace temporary overlay mutation with a cleaner image substitution approach if you want purely immutable workflow runs.

## 14. Summary

This repository is already deployment-ready from an infrastructure and runtime perspective.

What is missing is not deployment design, but GitHub-native release automation.

The good news is that the target behavior is already fully described by the existing Dockerfiles, Kubernetes overlays, Terraform layout, and Bitbucket pipeline. A GitHub deployment workflow should mirror those same contracts rather than invent a second deployment architecture.
