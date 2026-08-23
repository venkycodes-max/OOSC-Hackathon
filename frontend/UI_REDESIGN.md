# Trailhead UI Redesign

- Refreshed the public landing page with a modern, clean ed-tech layout.
- Added a persistent light/dark mode toggle using localStorage.
- Replaced the old text/globe-style branding with a Trailhead mountain/path logo.
- Updated navbar, sidebar, cards, buttons, typography, spacing, colors and responsive behavior.
- Added a Code Editor entry for UG Computer Science students.
- Added a browser-isolated JavaScript code editor at `/code-editor`.
- Kept existing API calls, authentication, assessments, subjects, analytics, resources and Doubt Solver flows intact.
- Backend was not changed.


## Theme visibility fix
- Light mode is now the default unless dark mode was explicitly saved.
- Normal cards and form surfaces use the semantic `surface` color instead of hard-coded white.
- Light/dark color-scheme is declared explicitly to avoid browser form/control rendering mismatches.
