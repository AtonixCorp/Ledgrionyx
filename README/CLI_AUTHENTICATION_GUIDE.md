# ATC CLI Authentication Guide

This document defines the implemented ATC Capital CLI authentication flow built on API keys, short-lived bearer tokens, local encrypted storage, and multi-profile switching.

## Install the CLI

Bootstrap the repo and CLI in one command:

```bash
./setup.sh
```

Or install the CLI directly into the backend virtual environment:

```bash
cd tools/atc_cli
/home/atonixdev/atccapital/backend/.venv/bin/python -m pip install -e .
```

The editable install exposes the `atc` command.

## Authentication Model

The CLI authenticates with a long-lived ATC API key and exchanges it for a short-lived bearer token.

- API key source: `POST /v1/api-keys`
- CLI login endpoint: `POST /auth/cli-login`
- Token refresh endpoint: `POST /auth/refresh`
- Session validation endpoint: `GET /auth/me`

ATC API keys are emitted as a single string in the `api_key` response field when an integration key is created or rotated. The value is composed as:

```text
<client_id>.<client_secret>
```

## Commands

Login with a saved profile:

```bash
atc login --api-key <API_KEY> --org org_123 --profile prod
```

Safer login without placing the secret directly in shell history:

```bash
/home/atonixdev/atccapital/backend/.venv/bin/python - <<'PY' | atc login --api-key-stdin --org org_123 --profile prod
import getpass
import sys

sys.stdout.write(getpass.getpass('ATC API key: '))
PY
```

Switch profiles:

```bash
atc use prod
```

Validate the current session:

```bash
atc whoami
```

List profiles:

```bash
atc profiles
```

List accessible organizations:

```bash
atc organizations list
```

List accounts, customers, or vendors:

```bash
atc accounts list
atc customers list
atc vendors list
```

Run financial reports:

```bash
atc reports trial-balance --as-of-date 2026-03-31
atc reports balance-sheet --as-of-date 2026-03-31
atc reports profit-and-loss --from-date 2026-03-01 --to-date 2026-03-31
atc reports cash-flow --from-date 2026-03-01 --to-date 2026-03-31
```

Remove the active profile:

```bash
atc logout
```

## Storage Model

Profile metadata is stored in `config.json` with `0600` permissions.

- macOS: `~/Library/Application Support/atc/config.json`
- Linux: `~/.config/atc/config.json`
- Windows: `%APPDATA%/atc/config.json`

Stored fields per profile:

- host URL
- organization ID
- organization name
- user identity
- token expiry timestamp
- encrypted access token
- encrypted API key

Encryption behavior:

- Preferred: OS keyring-backed Fernet key
- Fallback: local Fernet key file with `0600` permissions if a keyring backend is unavailable

## Runtime Behavior

Every authenticated CLI request injects:

- `Authorization: Bearer <access_token>`
- `X-Organization-Id: <org_id>`
- `User-Agent: ATC-CLI/<version>`

If the bearer token is near expiry or a request returns `401`, the CLI refreshes automatically with the stored API key and retries once.

The current business command set is read-only and includes:

- `organizations list`
- `accounts list`
- `customers list`
- `vendors list`
- `reports trial-balance`
- `reports profit-and-loss`
- `reports balance-sheet`
- `reports cash-flow`

## Backend Endpoints

`POST /auth/cli-login`

Request:

```json
{
  "api_key": "cli_xxx.secret_xxx",
  "organization_id": "org_123"
}
```

Response:

```json
{
  "access_token": "string",
  "expires_in": 3600,
  "organization_id": "org_123",
  "user": {
    "id": "user_001",
    "email": "developer@company.com",
    "role": "developer"
  }
}
```

`POST /auth/refresh`

Request:

```json
{
  "api_key": "cli_xxx.secret_xxx"
}
```

`GET /auth/me`

Headers:

```text
Authorization: Bearer <access_token>
X-Organization-Id: org_123
```

Response:

```json
{
  "organization": {
    "id": "org_123",
    "name": "ATC Demo LLC"
  },
  "user": {
    "id": "user_001",
    "email": "developer@company.com",
    "role": "developer"
  },
  "session": {
    "expires_at": "2026-03-15T12:00:00Z",
    "token_type": "Bearer"
  }
}
```

## Error Format

CLI command failures are rendered as:

```text
Error: <message>
Code: <error_code>
```

Examples:

```text
Error: Invalid API key
Code: INVALID_API_KEY
```

```text
Error: Network request failed
Code: NETWORK_ERROR
```

## Local Development

The CLI enforces HTTPS for non-local hosts. Plain HTTP is only accepted for local development hosts such as `localhost`.