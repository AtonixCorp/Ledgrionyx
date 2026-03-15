# ATC Capital Core Financial API v1 Developer Guide

## Overview

ATC Capital API v1 is a ledger-driven, multi-tenant financial API for organizations that need predictable accounting workflows, strong auditability, and enterprise-grade integration patterns.

This guide is for external developers integrating ATC Capital into ERP systems, client portals, workflow engines, treasury tools, and migration pipelines.

## Base URLs

- Production: `https://api.atc-capital.com/v1`
- Sandbox: `https://sandbox.api.atc-capital.com/v1`

## Getting Started

Every integration should follow this setup flow:

1. Create or obtain access to an organization.
2. Generate API credentials through the ATC Capital API key lifecycle.
3. Exchange client credentials for an OAuth2 bearer token.
4. Send requests with both `Authorization: Bearer <token>` and `X-Organization-Id: org_<id>`.

## Authentication

ATC Capital API v1 uses OAuth2 client credentials for machine-to-machine integrations.

### Token Request

`POST /auth/token`

```http
POST /auth/token
Content-Type: application/json

{
  "client_id": "your_client_id",
  "client_secret": "your_client_secret",
  "grant_type": "client_credentials"
}
```

### Token Response

```json
{
  "access_token": "abc123",
  "token_type": "Bearer",
  "expires_in": 3600
}
```

### Authenticated Request Pattern

```http
GET /accounts
Authorization: Bearer <token>
X-Organization-Id: org_123
```

## Multi-Tenant Request Rules

- Every organization-scoped request must include `X-Organization-Id`.
- Never reuse tenant identifiers across customers or business units.
- Never cache organization-scoped responses without a tenant-specific cache key.
- Treat `org_*` identifiers as required routing inputs, not optional metadata.

## Your First API Call

After exchanging credentials for a token, the most useful first calls are:

1. `GET /organizations` to confirm tenant access.
2. `GET /accounts` to inspect the chart of accounts.
3. `POST /customers` or `POST /vendors` to seed subledger data.

Example:

```bash
curl -X GET "https://sandbox.api.atc-capital.com/v1/accounts" \
  -H "Authorization: Bearer <token>" \
  -H "X-Organization-Id: org_123"
```

## Data Migration Workflow

Use migration endpoints when importing legacy accounting data or onboarding large datasets.

Recommended sequence:

1. Create a migration job with `POST /migration/jobs`.
2. Upload a source file reference or send JSON payloads to the appropriate migration endpoint.
3. Poll `GET /migration/jobs/{job_id}` until the job status is terminal.
4. Resolve row-level failures using the returned error metadata.
5. Confirm completion before switching operational traffic to ATC Capital.

### Recommended Import Order

1. Chart of accounts
2. Customers and vendors
3. Opening balances or historical financials
4. Invoices and bills
5. Payments and bank transactions
6. Reconciliation matches

## Financial Workflow Example

Standard revenue flow:

1. Create invoice with `POST /invoices`.
2. Record customer payment with `POST /invoices/{invoice_id}/payments`.
3. Confirm `journal_entry_id` is returned in the response.
4. Review trial balance or profit and loss output.
5. Reconcile imported bank activity through `POST /reconciliation/matches`.

Standard payable flow:

1. Create bill with `POST /bills`.
2. Record bill payment with `POST /bills/{bill_id}/payments`.
3. Reconcile outgoing bank activity against the corresponding ledger movement.

All financial POST endpoints are expected to be idempotent. Supply `X-Idempotency-Key` for invoice creation, bill creation, payments, journal entry posting, and migration operations.

## Banking Integration

### Bank Account Linking

Use `POST /bank-accounts` to register linked external accounts.

Rules:

- Submit masked account numbers only.
- Never transmit full account numbers.
- Store provider identifiers in your integration layer for idempotent re-linking.
- Use verification status to track bank-link completion state.

### Transaction Imports

Use `POST /bank-accounts/{bank_account_id}/transactions` for batch imports.

Rules:

- `external_id` must be stable and unique per provider transaction.
- The platform treats repeated imports with the same external identifier as duplicates.
- Include `raw_data` for traceability and later investigation.
- Reconcile imported transactions explicitly after posting.

## Reports

ATC Capital v1 exposes the following reporting endpoints:

- `GET /reports/trial-balance`
- `GET /reports/profit-and-loss`
- `GET /reports/balance-sheet`
- `GET /reports/cash-flow`

These reports are ledger-driven. Integrations should treat them as the source of truth for posted accounting activity rather than recalculating balances client-side.

## Webhook Integration

Use webhooks for near-real-time downstream processing.

### Setup

1. Register an endpoint with `POST /webhooks/endpoints`.
2. Subscribe only to the event types your system actually consumes.
3. Store the signing secret returned during endpoint registration.

### Handling Rules

- Validate the HMAC SHA-256 signature for every delivery.
- Process webhook deliveries asynchronously in your own system.
- Treat deliveries as retryable and idempotent.
- Store event identifiers and delivery logs on your side.
- Use event replay endpoints when rebuilding downstream state.

### Relevant Endpoints

- `POST /webhooks/endpoints`
- `GET /webhooks/deliveries`
- `POST /webhooks/events/{event_id}/replay`
- `GET /events`

## Error Handling

ATC Capital integrations should normalize all failures to this structure:

```json
{
  "error": {
    "code": "INVALID_REQUEST",
    "message": "The provided account_id does not exist.",
    "details": {}
  }
}
```

Recommended client behavior:

1. Treat `400` as validation or contract failures.
2. Treat `401` and `403` as authentication or tenant access failures.
3. Treat `404` as invalid identifiers or unavailable tenant-scoped resources.
4. Treat `429` as rate limiting and back off.
5. Treat `5xx` as retryable only when your request is idempotent.

## Idempotency and Atomicity

ATC Capital’s financial endpoints are designed around atomic writes and duplicate prevention.

Integration rules:

- Always send a unique `X-Idempotency-Key` for financial POST requests.
- Reuse the same key when retrying the same logical operation.
- Never generate a new idempotency key for a transport retry of the same business action.
- Assume partial writes are unacceptable and investigate any mismatch between your source system and the ATC response.

## Engineering Rules for Integrators

These platform rules are non-negotiable and should shape your client design.

### Ledger Rules

- Ledger entries are immutable.
- Reversals must be explicit.
- Silent balance corrections are not allowed.

### Data Integrity Rules

- No orphan records.
- No missing references.
- No partial writes.
- No silent failures.

### Security Rules

- Enforce OAuth2 tokens in machine integrations.
- Respect API key scopes.
- Respect rate limits.
- Preserve auditability in downstream systems.

### Versioning Rules

- Use only `/v1` endpoints for this integration guide.
- Expect breaking changes to ship under `/v2`.
- Plan for deprecation windows rather than assuming permanent parity.

## Common Integration Sequence

For a typical end-to-end deployment:

1. Authenticate.
2. Confirm organization access.
3. Seed master data.
4. Import legacy balances.
5. Start live invoicing and bill workflows.
6. Import bank feeds continuously.
7. Reconcile daily.
8. Subscribe to webhooks.
9. Pull reports for financial review.

## Reference Artifacts

- OpenAPI blueprint: [backend/openapi/atc-capital-v1-openapi.yaml](../backend/openapi/atc-capital-v1-openapi.yaml)
- Backend implementation: [backend/finances/v1_views.py](../backend/finances/v1_views.py)
- Route map: [backend/finances/v1_urls.py](../backend/finances/v1_urls.py)

## Final Principle

ATC Capital is not a thin CRUD API. It is a financial operating system. Integrations that succeed are the ones that treat tenant scoping, idempotency, ledger immutability, reconciliation, and auditability as first-class concerns from day one.