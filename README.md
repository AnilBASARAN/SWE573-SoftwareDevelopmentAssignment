# SWE573 - Software Development Practice

This repository was created for the SWE573 – Software Development Practice course project as part of the Master's Program in Software Engineering at Boğaziçi University.

## Project: Local Craft Discovery Guide

Local Craft Discovery Guide is a location-based web application for discovering handmade and indigenous craft items around places users are visiting or planning to visit.

The application aims to help travelers discover authentic local crafts, learn about their cultural background, find where they are available, and rate or review their experiences.

The idea is similar to a travel guide such as the Michelin Guide, but instead of focusing on restaurants and local cuisine, the platform focuses on local crafts, traditional products, and culturally significant handmade items.

## Problem

Information about authentic local crafts and traditional products is often scattered across travel websites, blogs, social media, and local sources.

This project aims to provide a single location-based platform where travelers can discover and evaluate local crafts near their current or planned travel destinations.

## Target Users

The primary users are travelers interested in authentic local experiences, handmade products, traditional craftsmanship, and cultural heritage.

## Project Goals

- Help travelers discover authentic handmade and local crafts based on location.
- Provide information about the cultural background and origin of local crafts.
- Allow users to rate and review crafts they have discovered.
- Make traditional and culturally significant products easier to discover while traveling.

## Current demo

The discovery page lists craft records from Django. Visitors can narrow the list
by district and category and open a craft to see its description, materials, and
photo when one is available. Use Django Admin to add or edit records and upload
photos. The demo records represent fictional workshops.

### Run locally

Activate a Python virtual environment, then run these commands from the repository root.

```sh
python -m pip install -r requirements.txt
python manage.py migrate
python manage.py loaddata demo_crafts
python manage.py createsuperuser
python manage.py runserver
```

Load the optional fixture into a fresh local database. It uses fixed IDs for the
three demo records. In a second terminal with Node.js 24 installed, run the frontend.

```sh
cd frontend
npm ci
npm run dev
```

Open the URL printed by Vite. For the demo, select Kadıköy and Seramik and open
Moda Seramik Atölyesi. To demonstrate images, add a photo to that record at
`http://127.0.0.1:8000/admin/` and reopen the craft detail page.

| API endpoint | Purpose |
| --- | --- |
| `GET /api/crafts/` | List records. Optional `location` and `category` query parameters accept exact names with case-insensitive matching where supported by the database. |
| `GET /api/crafts/<id>/` | Read a craft record. Unknown IDs return HTTP 404. |

Run `python manage.py test` for backend checks and `npm run build` inside
`frontend/` to build the React app. Reviews and the map are planned features.
