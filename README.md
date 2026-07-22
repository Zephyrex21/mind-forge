<div align="center">

# 🧠 MindForge

**A daily check-in for your mental wellbeing.**

Log your mood, energy, and sleep in under a minute — and get a warm, AI-written reflection grounded in your own words. Never diagnostic. Always supportive.

[![CI](https://github.com/Zephyrex21/mind-forge/actions/workflows/ci.yml/badge.svg)](https://github.com/Zephyrex21/mind-forge/actions/workflows/ci.yml)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-20-339933?logo=node.js&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

[Live Demo](#-live-demo) · [Features](#-features) · [Getting Started](#-getting-started) · [Architecture](#-architecture) · [Roadmap](#-roadmap)

</div>

---

## 📖 About

**MindForge** is a full-stack MERN wellness journaling app built around a simple idea: checking in on yourself shouldn't take more than a minute, and the response you get back should feel like it actually read what you wrote.

Every check-in — your mood, energy, sleep, and a few words about your day — is sent through a safety-aware AI pipeline that generates a short, grounded reflection: no diagnoses, no generic advice, no hallucinated facts. Just a reflection of what you shared, with crisis resources always surfaced first if they're ever needed.

Built for **UN SDG 3 — Good Health & Wellbeing**.

> ⚠️ **MindForge is a journaling companion, not a clinical tool.** It is not a substitute for professional mental health care.

---

## 🌐 Live Demo

**Website:** `<your-demo-link>`

<!--
  Add a screenshot or short GIF of the homepage / check-in flow here once
  you have one — e.g.:
  <p align="center"><img src=".github/assets/demo.gif" width="800" alt="MindForge demo" /></p>
-->

---

## ✨ Features

- 🤖 **AI-powered reflections** — Gemini-generated, grounded strictly in what you actually logged
- 📝 **Daily mood, energy & sleep check-ins** — a guided flow that takes under a minute
- 💬 **Conversational & classic check-in modes** — reflect your way, with full feature parity between them
- 🔐 **Secure JWT authentication** — httpOnly cookies, cross-site safe by default
- 🧯 **Safety-first by design** — crisis-language screening surfaces real crisis resources even if the AI call fails
- ⚡ **Smart AI infrastructure** — per-user response caching, automatic model fallback chains, and retry handling for a flaky upstream API
- 📊 **Personal dashboard** — mood & energy trends, streaks, and check-in history, computed entirely from your own data
- 🗓️ **Weekly recap** — a rolling 7-day summary of your mood/energy/sleep, best & toughest days, and what's helped most, right on the dashboard
- 🔍 **Searchable check-in history** — filter past entries by keyword, mood range, or time period
- ⬇️ **Export your data** — download your check-ins as CSV, or print/save a clean PDF copy
- 🎯 **Habit tracker** — track small daily goals alongside your check-ins, each with its own streak
- 🔔 **Daily reminders** — an optional nudge (browser notification + in-app banner) if you haven't checked in yet today
- 📈 **Emotion insights** — real patterns from your own data: sleep vs. mood, day-of-week trends, which coping tools actually correlate with a better mood, and a mood/energy correlation score
- 🌬️ **Guided breathing exercise** — box breathing, 4-7-8, or simple calm breathing, with a synced animated visual — surfaced automatically after a low-mood check-in, and open to anyone without an account
- 🎨 **Polished, animated UI** — light/dark mode, scroll-aware navigation, and tasteful motion throughout
- ✅ **Real test coverage** — 208 automated tests (unit + integration) across frontend and backend, enforced in CI

---

## 🛠 Tech Stack

| Layer              | Technologies                                   |
| ------------------ | ----------------------------------------------- |
| **Frontend**        | React 19, Vite, Tailwind CSS, Framer Motion |
| **Backend**         | Node.js, Express.js                             |
| **Database**        | MongoDB, Mongoose                                |
| **Authentication**  | JWT (httpOnly cookies)                          |
| **AI**              | Google Gemini API                               |
| **Testing**         | Vitest                                          |
| **Linting**         | ESLint (flat config)                            |
| **CI/CD**           | GitHub Actions                                  |
| **Deployment**      | Vercel (frontend) · Railway (backend)           |

---

## 🏗 Architecture

```text
Client (React + Vite)
        │
        ▼
  Express API
        │
        ├── Authentication (JWT, httpOnly cookies)
        ├── User Management
        ├── Mood Check-ins
        ├── Journal Management
        │
        ├── AI Conversation Engine
        │     ├── Prompt Optimizer
        │     ├── Model Router (fallback chain)
        │     ├── Response Cache (per-user)
        │     └── Retry Handler
        │
        ├── Safety Layer (crisis-language screening)
        │
        └── Google Gemini API
```

<details>
<summary><strong>Project structure</strong></summary>

```text
mind-forge/
├── src/                      # Frontend (React + Vite)
│   ├── app/
│   │   ├── providers/         # Theme & app-level context providers
│   │   └── routes/            # Page-level route components
│   ├── components/
│   │   ├── common/            # Shared UI (orbs, cursor glow, float wrapper...)
│   │   ├── conversation/      # Conversational check-in UI
│   │   ├── editor/            # Journal/entry editing UI
│   │   └── wellness/          # Mood, energy, sleep widgets
│   ├── features/
│   │   ├── auth/              # Auth context & provider
│   │   └── generator/         # Guided check-in step flow
│   ├── hooks/                 # Custom React hooks
│   ├── services/              # API client layer
│   ├── constants/
│   └── utils/
│
├── server/                   # Backend (Node.js + Express)
│   ├── routes/                 # Express route handlers
│   ├── models/                 # Mongoose schemas
│   ├── middleware/             # Auth, error handling, etc.
│   ├── services/
│   │   ├── ai/                  # Prompt optimizer, model router, cache, retry
│   │   └── safety/               # Crisis-language screening
│   ├── db/                     # DB connection & reset scripts
│   └── utils/
│
└── .github/workflows/ci.yml  # Lint + test + build on every push/PR
```

</details>

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 20+
- A **MongoDB** connection string ([Atlas free tier](https://www.mongodb.com/cloud/atlas) works fine)
- A **Google Gemini API key** ([Google AI Studio](https://aistudio.google.com/))

### 1. Clone the repository

```bash
git clone https://github.com/Zephyrex21/mind-forge.git
cd mind-forge
```

### 2. Install dependencies

Install both the frontend and backend in one step:

```bash
npm run setup
```

<details>
<summary>Or install them separately</summary>

```bash
npm install              # frontend
cd server && npm install # backend
```

</details>

### 3. Configure environment variables

Copy `server/.env.example` to `server/.env` and fill in real values:

```env
PORT=3001
NODE_ENV=development
MONGODB_URI=
JWT_SECRET=
JWT_EXPIRES_IN=7d
GEMINI_API_KEY=
CORS_ORIGIN=http://localhost:5173
```

> The server validates these at startup and refuses to boot with a clear error message if any are missing or still contain placeholder text — a misconfigured `.env` shows up immediately instead of as a mysterious runtime crash.

### 4. Run it

Starts both servers together, with color-coded `FRONTEND` / `BACKEND` output:

```bash
npm run dev
```

The app will be running at **http://localhost:5173**.

---

## ✅ Testing & Code Quality

Both the frontend and backend ship with real automated test suites (Vitest) and lint configs (ESLint flat config) — **208 tests total**, all enforced in CI.

The backend suite has two layers:
- **Unit tests** — pure functions in isolation (streak math, validation, prompt building, retry/backoff logic).
- **Integration tests** (`*.integration.test.js`) — the real Express app via `supertest`, with real middleware, real cookie-based JWT auth, and real request validation. The persistence layer (Mongoose models) is swapped for an in-memory fake at the boundary rather than a real MongoDB — this proves the HTTP/auth/validation wiring is correct without depending on `mongodb-memory-server`'s binary download working in every environment (including sandboxed CI runners with restricted network egress).

```bash
# Frontend (from project root)
npm test          # run tests once
npm run lint       # lint

# Backend
cd server
npm test
npm run lint
```

CI runs both automatically on every push/PR via [GitHub Actions](.github/workflows/ci.yml) — lint, test, and build for the frontend; lint and test for the backend.

---

## 🏭 Production Readiness

An honest account of what's actually covered versus what's a known trade-off — the kind of thing worth knowing before relying on this in production, not just at hackathon-demo scale.

**In place:**
- Tiered rate limiting: a global per-IP limiter, a stricter brute-force limiter on auth endpoints, and a per-user (not per-IP) limiter on the AI generation endpoint with a smart client-ID fallback for anonymous traffic
- httpOnly, environment-aware cookies (`SameSite=None; Secure` on HTTPS, `Lax` locally — derived from the actual request, not a config flag that's easy to leave wrong)
- Helmet security headers, strict CORS origin checking, JSON body size limits
- Structured request logging with a request ID on every response (`X-Request-Id`), so a single request can be traced through logs even across the AI pipeline's retries/fallbacks
- A dedicated error-reporting seam (`services/errorReporter.js`) that every unexpected 5xx flows through — currently structured logging, with a clearly marked integration point for a real APM tool (Sentry, etc.) rather than a faked one
- Integration tests covering auth, check-ins, and goals end-to-end at the HTTP layer
- Cursor-based pagination on check-ins (not skip/limit, which gets slower the deeper a user pages in) — the browsing/export page loads 30 at a time with "Load More," while dashboard/insights aggregation uses a separate lightweight endpoint that returns the full history but only the handful of numeric fields those computations actually need, not every reflection's full text
- Single animation library — the homepage originally shipped both Framer Motion and GSAP for different effects; the GSAP-specific ones (scroll-linked parallax, scramble-text reveal) were migrated onto Framer Motion equivalents and the GSAP dependency dropped entirely, cutting that page's JS from ~173KB to ~59KB (~61KB → ~16KB gzipped)

**Known trade-offs (not yet done):**
- No real APM/error-tracking service wired up (the seam exists; no DSN configured)
- No accessibility audit has been run (ad hoc `aria-label`s added as features were built, not a systematic WCAG pass)
- Daily reminders are client-side only (localStorage + best-effort browser Notification) — no service worker, so no true background push

---

## ☁️ Deployment

| Service     | Platform | Notes                                                   |
| ----------- | -------- | -------------------------------------------------------- |
| Frontend    | [Vercel](https://vercel.com)   | Static build, API calls rewritten to the backend (`vercel.json`) |
| Backend     | [Railway](https://railway.app) | Express API, connects to MongoDB Atlas                   |

The frontend build (`npm run build`) is fully static and can be deployed anywhere that serves static files — Vercel is just what this project uses.

---

## 🗺 Roadmap

- [ ] AI-powered personalized wellness recommendations
- [x] Habit tracking and goal management
- [x] Guided meditation and mindfulness exercises
- [x] Emotion analytics dashboard
- [ ] Calendar and reminder integration
- [ ] Multi-language support
- [x] Export journal entries
- [ ] Progressive Web App (PWA) support

---

## 🤝 Contributing

This started as a hackathon project, but issues and pull requests are welcome. If you're planning a larger change, please open an issue first to discuss what you'd like to change.

---

## 📄 License

Licensed under the **[MIT License](LICENSE)**.

---

## 👤 Author

**Saurabh Raj Shekhar**
GitHub: [@Zephyrex21](https://github.com/Zephyrex21)
