# Trailhead data persistence

Assessment attempts are stored in MongoDB in the `Assessment` collection under the authenticated user's `_id`. Logging out only removes the browser's JWT/session state; it does not delete assessments, progress, doubts, or roadmaps.

The frontend Test Reports and Progress & Analytics pages use `/api/assessment/history` so older test attempts are not lost merely because the dashboard only shows a recent subset.

Do not create a new account after logging out if you want to see the old data: log back in with the same email/password. The backend uses the same user ID to retrieve the existing records.
