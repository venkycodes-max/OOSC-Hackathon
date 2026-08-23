# Trailhead frontend — sidebar pass

This build adds the full student-app sidebar and supporting pages:

- Dashboard
- My Learning Trail
- Subjects expandable menu
  - Mathematics
  - Physics
  - Chemistry
  - Biology
  - Computer Science
  - English
- Doubt Solver (text + image/PDF upload UI)
- Weekly Tests + report history
- Progress & Analytics with line, bar, and pie visualizations
- Resources
- Trailhead Insight shortcut
- Settings
- Help & support
- Responsive mobile sidebar drawer
- Subject-specific routes at `/subjects/:slug`
- App footer using the flex page shell so short pages keep the footer at the bottom

## Backend integration hooks

The existing dashboard endpoint remains `/dashboard`.

The subject page is ready for:

`GET /progress/subject?subject=Mathematics`

Expected subject snapshot fields can include:

- `latestScore`
- `scoreHistory`
- `topicsWeak`
- `topicsMastered`
- `roadmap`
- `recentAssessments`
- `summary`

The Doubt Solver now supports a configurable endpoint via `VITE_DOUBT_SOLVER_ENDPOINT`. If it is not configured, it tries these compatible POST routes in order:

`/doubts/solve`
`/doubt/solve`
`/doubts/ask`
`/doubt-solver/solve`
`/ai/doubt-solver`

using `multipart/form-data` with:

- `subject`
- `question` (optional when a file is supplied)
- `file` (optional image/PDF/document)

The UI intentionally shows a clear integration message when these new backend endpoints are not available yet instead of inventing subject or AI data.
