# Trailhead final update

## UG branch-aware onboarding
- New-account overall diagnostic is 25 questions: 8 easy, 8 medium, 9 hard.
- For UG users, the six onboarding subjects are Mathematics, Physics, Chemistry, Biology, English, and the selected branch subject.
- Mechanical Engineering, Electrical Engineering, and Electronics & Communication Engineering have their own curricula, diagnostic questions, quiz fallback banks, roadmaps, and subject validation.
- Computer Science appears as the branch subject only when Computer Science is selected.
- Logged-in subject quizzes remain strictly subject-specific.

## Language UI
- Added English, Hindi, German, Spanish, French, Russian, and Japanese options.
- Google Translate is kept as a hidden translation engine; its banner is suppressed with a DOM observer and CSS so it cannot obstruct navigation or reset the selected language.

## Check-in isolation
- Dashboard and assessment-history responses explicitly enforce the authenticated user's ownership.
- New users see an empty check-in history until they complete an assessment.
- Check-in timestamps now display date and time.

## 2026-08-23 — 25-question onboarding + branch-weighted UG diagnostic
- New-account overall diagnostic increased from 15 to 25 questions.
- Difficulty contract is now 8 easy / 8 medium / 9 hard.
- UG distribution is exactly 3 Mathematics + 3 Physics + 3 Chemistry + 3 Biology + 3 English + 10 selected branch-subject questions.
- Non-UG distribution is exactly 4 Mathematics + 4 Physics + 4 Chemistry + 4 Biology + 4 Computer Science + 5 English.
- Senior-school (Class 11/12) and all UG onboarding diagnostics require at least two hard Mathematics questions and two hard Physics questions, with at least one explicit extreme question in each.
- Added `challenge: standard|extreme` to assessment question persistence.
- Added branch-aware deterministic fallback banks for Computer Science, Mechanical Engineering, Electrical Engineering, and Electronics & Communication Engineering.
- Branch roadmaps continue to use the branch-specific canonical curriculum.
