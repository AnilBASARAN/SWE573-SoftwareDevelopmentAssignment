# Local Craft Discovery Guide: Project Scope (v0.1)

## Context and Problem
Travelers and craft enthusiasts struggle to find reliable, location-specific information about handmade and culturally significant crafts. Information about makers, production methods, materials, and regional origins is fragmented across different platforms.

## Vision
Create a location-based community web application where people can discover, document, and share traditional or handmade crafts, with emphasis on provenance and the people who make them.

## Stakeholders
- Visitors and travelers who browse crafts without an account
- Registered contributors who document crafts
- Artisans who wish to share their work
- Moderators responsible for inappropriate or misleading submissions

## MVP In Scope
1. Browse and search craft entries.
2. View craft details, including title, description, material, production process, images, and optional measurements such as weight and volume with explicit units.
3. Associate a craft entry with a geographic location while respecting contributors' privacy.
4. Create an account and sign in.
5. Allow authenticated contributors to create and edit their own craft entries.
6. Select an existing category or propose a new category; permit user-supplied tags separately.

## Deferred Beyond MVP
- Following users, likes, comments, and reviews
- Recommendation algorithms and notifications
- Sales, payments, and delivery
- Native mobile applications
- Complex artisan verification workflows

## Open Questions
- Should crafts be tied primarily to individual items, craft traditions, or artisans?
- Which fields must be mandatory at submission?
- Should precise maker coordinates be public or location precision be configurable?
- How should proposed categories be reviewed to avoid duplicates?
- What evidence, consent, and attribution is appropriate for indigenous cultural knowledge?

## Success Criteria for Initial Prototype
A visitor can browse and inspect sample craft records. A registered contributor can submit a craft with details and a location. The data persists in PostgreSQL and is accessible from the React interface through a documented Django REST API.

Status: initial planning draft, subject to user research and course feedback.
