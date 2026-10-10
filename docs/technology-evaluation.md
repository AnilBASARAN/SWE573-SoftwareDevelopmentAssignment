# Technology Evaluation and Initial Decisions (v0.1)

## Decision Context
The Local Craft Discovery Guide needs account management, image-backed craft records, configurable tags and categories, a REST API, and geospatial search. The course emphasizes an observable software development process, maintainability, and incremental implementation.

## Backend: Python/Django vs Java/Spring Boot
| Criterion | Python + Django REST Framework | Java + Spring Boot |
| --- | --- | --- |
| REST interfaces | Django REST Framework serializers and views | Spring Web controllers |
| User management | Built-in Django authentication and admin | Spring Security and additional configuration |
| Geospatial integration | GeoDjango with PostGIS | Hibernate Spatial / spatial SQL with PostGIS |
| Early prototype | Integrated framework reduces initial setup | Strong conventions with typically more setup |
| Maintainability | Modular Django apps and automated tests | Strong typing and established enterprise practices |

**Decision:** Python with Django and Django REST Framework. The integrated authentication, administrative capabilities, and GeoDjango/PostGIS compatibility suit the first prototype. Spring Boot remains a viable alternative; this is a project-specific trade-off, not a universal ranking.

## Frontend
**Decision:** React with TypeScript and Vite. React supports reusable discovery cards, forms, and interactive maps. TypeScript helps validate data contracts at development time. Vite uses Node.js-based development tooling, but the application backend will remain Python rather than Node.js.

## Data Storage
**Decision:** PostgreSQL, with PostGIS enabled when implementing distance and geographic queries. Relational constraints are appropriate for users, crafts, categories, tags, media references, and contributions. Media binaries will be stored separately from relational metadata as the project evolves.

## Communication
The frontend will access versioned HTTP REST endpoints using JSON; authentication and cross-origin policy will be configured deliberately. Sensitive configuration will be read from environment variables.

## Risks and Mitigations
- Scope growth: focus on a small demonstrable MVP.
- Geography and privacy: permit approximate/public location and avoid exposing private addresses by default.
- User-generated categories: distinguish freely created tags from proposed, reviewable categories.
- Cultural sensitivity: record source, attribution, and consent when documenting culturally significant practices.
- Technology learning curve: implement and test one vertical slice before advanced social functionality.

## Decision Status
Initial architectural choice, to be revisited if requirements validation identifies a stronger constraint. No claim is made that the stack has already been implemented or tested.
