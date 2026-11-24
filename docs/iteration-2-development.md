# Iteration 2 — Discovery and contribution

## Implemented in source (runtime verification pending)
- FR-02: client-side name search and category filtering (#6); tags remain pending.
- NFR-01: single-world map bounds and responsive controls (#7).
- FR-03: registration and token login (#8). Tokens are kept in React memory; logout clears local state only.
- FR-04/05/10: authenticated craft creation, multipart image upload, coordinate validation (#9). Public approximate coordinates are entered manually.
- API tests added (#13), not yet executed.

## Current architecture
React + TypeScript + Leaflet → Vite development proxy → Django REST Framework → SQLite. Uploaded media is stored locally. PostgreSQL/PostGIS remain planned, not implemented.

## Run locally
From repository root in PowerShell:
```powershell
git pull origin main
.\.venv\Scripts\Activate.ps1
python manage.py migrate
python manage.py test crafts
python manage.py runserver
```
In a second terminal:
```powershell
cd frontend
npm ci
npm run build
npm run lint
npm run dev
```

## Manual acceptance checks
Search for cowboy, then a nonmatching name; clear filters. Register a test account, log in, submit a craft with approximate coordinates and optional photo, reload and confirm persistence. Verify mobile layout and category filtering with multiple records.

## Remaining work
Ownership association and edit/delete permissions (#10), category proposals and tags (#11), production methods and volume, complete design deliverables (#12), deployment and dependency audit (#13). Token revocation, authentication rate limiting, HTTPS and production settings are required before public deployment. No runtime test result is claimed here.
