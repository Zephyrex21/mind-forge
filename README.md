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
- 🎨 **Polished, animated UI** — light/dark mode, scroll-aware navigation, and tasteful motion throughout
- ✅ **Real test coverage** — 90 automated tests across frontend and backend, enforced in CI

---

## 🛠 Tech Stack

| Layer              | Technologies                                   |
| ------------------ | ----------------------------------------------- |
| **Frontend**        | React 19, Vite, Tailwind CSS, Framer Motion, GSAP |
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

Both the frontend and backend ship with real automated test suites (Vitest) and lint configs (ESLint flat config) — **90 tests total**, all enforced in CI.

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

## ☁️ Deployment

| Service     | Platform | Notes                                                   |
| ----------- | -------- | -------------------------------------------------------- |
| Frontend    | [Vercel](https://vercel.com)   | Static build, API calls rewritten to the backend (`vercel.json`) |
| Backend     | [Railway](https://railway.app) | Express API, connects to MongoDB Atlas                   |

The frontend build (`npm run build`) is fully static and can be deployed anywhere that serves static files — Vercel is just what this project uses.

---

## 🗺 Roadmap

- [ ] AI-powered personalized wellness recommendations
- [ ] Habit tracking and goal management
- [ ] Guided meditation and mindfulness exercises
- [ ] Emotion analytics dashboard
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
