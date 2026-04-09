# Ledgrionyx CLI

Python implementation of the `ledgrionyx` command for API-key based Ledgrionyx authentication.

Install with repo bootstrap:

```bash
./setup.sh
```

Or install locally without the full app bootstrap:

```bash
cd tools/atc_cli
/home/atonixdev/ledgrionyx/api/.venv/bin/python -m pip install -e .
```

Core commands:

```bash
ledgrionyx login --api-key <API_KEY> --org <ORGANIZATION_ID>
ledgrionyx whoami
ledgrionyx use <PROFILE>
ledgrionyx logout
ledgrionyx organizations list
ledgrionyx accounts list
ledgrionyx customers list
ledgrionyx vendors list
ledgrionyx reports trial-balance --as-of-date 2026-03-31
```