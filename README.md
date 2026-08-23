# Trailhead — AI for Equitable Education Access

Built for the OOSC Hackathon · Theme: *Education, Language Access and Personalized Learning*

Trailhead is a student-only platform that turns a diagnostic assessment into a personalized,
continuously-updated learning roadmap — grounded in open educational content, powered by an
open-source LLM.

## The flow

1. **Register / log in** — student-only accounts (name, email, password, class).
2. **Welcome** — a short, warm welcome screen, then the student picks a subject to start with.
3. **3-level diagnostic quiz** — Easy / Medium / Hard, 25 questions total. The hardest
   questions are deliberately pitched one grade level above the student, to probe the real
   ceiling of their understanding rather than just confirming the syllabus.
4. **Gap analysis** — answers are graded deterministically in code (not by the AI, so scoring
   is always trustworthy); the AI then reads the pattern of right/wrong answers by topic and
   difficulty and synthesizes weak topics, strong topics, and a plain-language summary.
5. **Aim selection** — the student says what they're working toward: an entrance exam, B.Tech
   placements, general school/college studies, or general improvement.
6. **AI-generated roadmap** — 5–8 milestones sequenced to close weak topics first, then build
   toward the stated aim, each with resource pointers to real open platforms (Khan Academy,
   NCERT, MIT OpenCourseWare, freeCodeCamp, GeeksforGeeks, Coursera).
7. **Dashboard** — the "Learning Trail": a visual route through the roadmap milestones, current
   weak/strong topics, score history, and a weekly quiz.
8. **Weekly quiz** — a shorter AI-generated quiz that re-targets current weak topics, so progress
   is actually re-measured, not just assumed.
9. **Logout** — all progress is written to MongoDB on every submit, not just on logout, so nothing
   is lost and the student resumes exactly where they left off next time they log in.

## Architecture

```
frontend/   React (Vite) + Tailwind — student UI, deployed to Vercel
backend/    Node/Express + MongoDB (Mongoose) + JWT auth — deployed to Render
AI layer    backend/services/aiService.js — calls Groq's free API, which serves
            open-source models (Llama 3.3 70B by default). This is the only place
            the AI is called from; every route goes through it.
```
## Tech Stack

      ### Frontend
      - React.js
      - Vite
      - JavaScript (ES6+)
      - Tailwind CSS
      - React Router
      - Axios
      
      ### Backend
      - Node.js
      - Express.js
      - JavaScript
      - REST APIs
      - JWT Authentication
      - CORS
      
      ### Database
      - MongoDB
      - MongoDB Atlas
      - Mongoose
      
      ### AI / Doubt Solver
      - AI-powered Doubt Solver
      - PDF/question-based doubt solving
      - AI service integration
      
      ### Deployment
      - Render — Frontend & Backend
      - GitHub — Version Control & CI/CD
      - MongoDB Atlas — Cloud Database
      
      ### Development Tools
      - Visual Studio Code
      - Git & GitHub
      - npm

### Why this AI setup
Groq was chosen because it's free, has no local hosting requirement (so it deploys cleanly
on Render's free tier, unlike self-hosted Ollama), and serves genuinely open-source models
(Llama) rather than a closed one — matching the brief's spirit while staying deployable in a
hackathon timeframe. `GROQ_MODEL` is an env var, so swapping models (or pointing at a different
OpenAI-compatible endpoint, including a self-hosted Ollama instance) requires no code changes.

### Where the AI is actually used
- `generateAssessmentQuestions` — writes the 3-level diagnostic quiz
- `analyzeAssessmentGaps` — turns graded results into weak/strong topics + a summary
- `generateRoadmap` — builds the personalized milestone roadmap
- `generateWeeklyQuiz` — writes a quiz targeted at current weak topics
- `updateProgressNarrative` — writes a short human-readable note after each weekly quiz

Grading itself (right/wrong, %) is computed deterministically in `routes/assessment.js`, not
by the AI — the AI's job is interpretation and content generation, not judging correctness.

## Local setup

### 1. MongoDB
Create a free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas) and grab the
connection string, or run MongoDB locally.

### 2. Groq API key
Sign up free at [console.groq.com/keys](https://console.groq.com/keys) — no credit card needed.

### 3. Backend
```bash
cd backend
cp .env.example .env      # fill in MONGODB_URI, JWT_SECRET, GROQ_API_KEY
npm install
npm run dev                # http://localhost:5000
```

### 4. Frontend
```bash
cd frontend
cp .env.example .env       # VITE_API_URL=http://localhost:5000/api
npm install
npm run dev                # http://localhost:5173
```

## Deployment (temporary/free-tier friendly)

**Backend → Render**
1. Push this repo to GitHub.
2. New Web Service on Render, root directory `backend`, build `npm install`, start `npm start`.
3. Add env vars: `MONGODB_URI`, `JWT_SECRET`, `GROQ_API_KEY`, `GROQ_MODEL`, `CLIENT_ORIGIN`
   (your Vercel URL once you have it).

**Frontend → Vercel**
1. New Project on Vercel, root directory `frontend`, framework preset Vite.
2. Add env var `VITE_API_URL` = your Render backend URL + `/api`.
3. Deploy. Update `CLIENT_ORIGIN` on Render to match the resulting Vercel URL.

## Deployment Note

The backend is deployed on Render using the free plan.

Because the backend is hosted on a free Render service, it may **spin down after a period of inactivity**. When someone visits the website after the backend has been inactive, the first request may take a little longer while Render starts the backend again.

After the backend starts, the website should work normally.

> **Note:** This does not mean the deployment has expired or been deleted. The backend is simply waking up from inactivity.

## Project structure

```
backend/
  config/db.js              MongoDB connection
  models/                   User, Assessment, Roadmap, Progress
  middleware/auth.js        JWT verification
  services/aiService.js     All Groq/LLM calls live here
  routes/                   auth, assessment, roadmap, quiz, dashboard
  server.js

frontend/
  src/pages/                Login, Register, Welcome, Assessment, AimSelection,
                             Dashboard, WeeklyQuizPage
  src/components/           QuizRunner, LearningTrail, Navbar, ProtectedRoute
  src/context/AuthContext.jsx
  src/api/axios.js
  src/lib/onboarding.js
```

## Notes for judges

- No teacher login exists by design, per the brief — this is a student-only tool.
- Every AI-generated resource links to a real platform via a search query rather than a
  fabricated deep link, so nothing ever 404s.
- The diagnostic intentionally probes above grade level so the roadmap isn't capped by the
  syllabus if a student is already ahead of it.
