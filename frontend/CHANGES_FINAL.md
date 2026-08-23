# Trailhead final frontend update

- Sidebar subjects are branch-aware for UG users.
- Mechanical, Electrical, and ECE subject pages/quiz links are available to the correct branch instead of Computer Science.
- Overall onboarding remains mixed; logged-in subject quizzes remain subject-specific.
- Language selector supports English, Hindi, German, Spanish, French, Russian, and Japanese without exposing the Google Translate banner.
- Recent check-ins are filtered to the authenticated user and show date/time.
- New users see a clear empty check-in state until their first assessment.


## Page-unresponsive / translation fix
- Removed the MutationObserver and recurring setInterval previously used to suppress Google Translate's banner.
- Google Translate is initialized once and language changes use only bounded, one-shot timers.
- Static CSS hides the Google Translate banner without reacting to DOM mutations.
- This prevents the browser main-thread feedback loop that caused Chrome's "Page Unresponsive" dialog.

## 2026-08-23 — Wide responsive layout + branch trail rendering
- Expanded authenticated and public page frames to use substantially more desktop viewport width while preserving readable inner text widths.
- Increased the authenticated sidebar to 280px and removed the old 1440px application shell cap.
- Added Mechanical Engineering, Electrical Engineering, and Electronics & Communication Engineering curricula to frontend Learning Trail normalization so branch roadmaps no longer render as empty.
- Updated fallback resource searches so branch/UG topics are not forced into Class 10 wording.
- Quiz UI now displays `Hard · Extreme` when the diagnostic marks a question as extreme.
