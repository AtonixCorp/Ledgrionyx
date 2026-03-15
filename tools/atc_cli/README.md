# ATC Capital CLI

Python implementation of the `atc` command for API-key based ATC Capital authentication.

Install with repo bootstrap:

```bash
./setup.sh
```

Or install locally without the full frontend bootstrap:

```bash
cd tools/atc_cli
/home/atonixdev/atccapital/backend/.venv/bin/python -m pip install -e .
```

Core commands:

```bash
atc login --api-key <API_KEY> --org <ORGANIZATION_ID>
atc whoami
atc use <PROFILE>
atc logout
atc organizations list
atc accounts list
atc customers list
atc vendors list
atc reports trial-balance --as-of-date 2026-03-31
```