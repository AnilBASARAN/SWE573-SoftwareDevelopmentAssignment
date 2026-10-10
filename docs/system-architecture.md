# Initial System Architecture (v0.1)

## Overview
The application follows a client/server architecture with a React + TypeScript single-page frontend, a Django REST Framework backend, and PostgreSQL persistent storage. PostGIS is planned for spatial queries.

```text
Browser (React + TypeScript)
            |
         HTTPS / JSON
            |
Django REST Framework (Python)
       |               |
Authentication     Craft domain logic
       |               |
       +------- PostgreSQL -------+
                   |
                PostGIS

Media storage (planned): uploaded craft photographs
```

## Core Domain Entities (Provisional)
- User: registered contributor or moderator.
- Craft: title, narrative, materials, production methods, optional measurements, creator, timestamps.
- Location: geographic coordinates with publicly visible precision rules.
- Category: moderated taxonomy; new entries can be proposed.
- Tag: flexible contributor-supplied keywords.
- CraftImage: reference and metadata for uploaded images.

## Planned API Responsibilities
- Read craft listings and craft details for visitors.
- Authenticate contributors before write operations.
- Create and update entries with server-side validation.
- Search/filter crafts and later support geographic radius queries.
- Enforce record ownership and moderation permissions.

## Initial Development Strategy
1. Establish local development and database environments.
2. Implement a minimal health endpoint and frontend API request.
3. Model craft records and expose list/detail/create endpoints.
4. Add forms and map visualization with test coverage.
5. Expand based on validated user stories.

## Quality Considerations
- Never commit credentials or secrets.
- Validate file uploads, geographic coordinates, numeric units, and user input.
- Add automated model/API tests as features are implemented.
- Document run commands and dependencies after verified setup.

Status: proposed design, not an as-built system diagram.
