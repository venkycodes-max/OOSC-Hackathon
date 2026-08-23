# Trailhead backend changes

## Learning Trail reliability fix
- A completed assessment now triggers creation/update of the corresponding subject roadmap.
- Roadmap AI generation is optional. If Groq times out or fails, a deterministic full-curriculum roadmap is persisted instead.
- Every roadmap milestone still receives at least four resources.
- `GET /api/roadmap?subject=...` self-heals older accounts that have assessments but no saved roadmap.
- `POST /api/roadmap/refresh` also self-heals the roadmap without requiring AI availability.
- Existing assessment records are never deleted as part of roadmap generation.
