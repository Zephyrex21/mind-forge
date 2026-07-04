# README Forge — AI GitHub Profile & Project README Builder

README Forge is a production-grade, commercial-quality SaaS application designed to help developers create custom, visually rich, and professional GitHub profile READMEs and automated project documentation in minutes. Powered by the Google Gemini API, it uses a robust backend AI gateway to optimize prompts, prevent rate limits, cache identical generations, and secure API operations.

## Links
* **Live Application (Frontend)**: [https://forge-readme.vercel.app/](https://forge-readme.vercel.app/)
* **Hosted API Gateway (Backend)**: [https://readme-forge-server.onrender.com](https://readme-forge-server.onrender.com)

---

## Key Features

* **Dual Builder Modes**:
  * **Classic Wizard**: A structured step-by-step assistant (About Me, Tech Stack, Work Experience, Projects, Stats Cards, visitor counters, and more).
  * **Conversational Builder**: An interactive guided chat experience with progressive inputs, widget triggers, and session recovery.
* **Repository Intelligence Engine**: Imports a GitHub repository URL, runs framework and stacking analysis, parses dependencies, and automatically compiles tech stack documentation, install instructions, and code diagrams.
* **Secure GitHub OAuth Authentication**: SQLite-backed session cookie management allows saving, managing, and duplicating custom templates, complete with a fallback offline developer mock sandbox.
* **Central Command Palette (`Ctrl + K`)**: Keyboard-navigable quick actions menu to switch routes, toggle theme styles, search projects, and manage configurations.
* **Server-Side AI Gateway**:
  * **Prompt Optimization**: Strips empty fields, compresses whitespace, and compiles data to save tokens and improve context quality.
  * **Model Fallback Chain**: Dynamically routes requests through working model tiers (`gemini-2.5-flash-lite` -> `gemini-2.5-flash` -> `gemini-3.5-flash`).
  * **Resilient Retry Handling**: Built-in exponential backoff specifically handling rate limits (429) and server errors (5xx).
  * **Request Deduplication**: In-memory request queue prevents duplicate simultaneous generation requests from the same user or IP.
  * **SHA-256 Caching**: Database-backed hashes cache configuration payloads to return identical README requests instantly.
* **SEO & PWA Ready**: Dynamic metadata syncing hook, `sitemap.xml`, `robots.txt`, and mobile-ready `manifest.json` configurations.
* **Premium Design**: Harmonious dark/light themes, subtle Framer Motion micro-animations, queue-based notification toasts, skeleton shimmer loaders, and a highly polished user interface.

---

## Tech Stack

### Frontend
* **Core**: React 18 + Vite
* **Styling**: Tailwind CSS v3
* **Animations**: Framer Motion
* **Icons**: Lucide React
* **Router**: React Router DOM v7

### Backend
* **Core**: Node.js + Express
* **Database**: SQLite (`better-sqlite3`) for persistent user sessions, projects tracking, and cost/token usage logs.
* **Security & Limiting**: CORS + Express Rate Limit + CSRF State Verification

---

## Codebase Structure

```
github_readme_builder/
├── dist/                          # Production built frontend assets
├── docs/                          # Developer reference documentation (Architecture, Deployment, etc.)
├── public/                        # Static assets (brand favicon.png, logo.png, robots.txt, manifest.json)
├── src/                           # Frontend React application
│   ├── app/                       # Global providers, routing, and config
│   │   ├── config/                # Central app configurations and feature flags
│   │   ├── providers/             # Auth, Theme, and Toast providers
│   │   └── routes/                # Application pages (Home, Builder, Settings, Dashboard, Projects)
│   ├── components/                # Shared layout components
│   │   ├── common/                # UI primitives (Buttons, CommandPalette, Skeletons, ErrorStates)
│   │   ├── conversation/          # Conversational Guided Chat Builder UI
│   │   └── editor/                # Layout Wizard panels (TopBar, BottomBar)
│   ├── features/                  # Main app feature modules (Auth modals, generator preview)
│   ├── hooks/                     # Custom hooks (useGenerator state engine, useSEO, useAuth)
│   └── utils/                     # Custom logger, formatting helpers
│
├── server/                        # Express API Gateway
│   ├── auth/                      # GitHub OAuth strategies and developer sandbox
│   ├── db/                        # Database connection and SQLite schema
│   ├── middleware/                # Rate limiter and authentication handlers
│   ├── routes/                    # API routes (/api/auth, /api/generate, /api/projects)
│   └── services/                  # Business logic services (AI fallbacks, caching, scanner)
│
├── tests/                         # Testing architecture
│   ├── common/                    # Component unit tests (Vitest)
│   └── e2e/                       # End-to-End integration tests (Playwright)
```

---

## Local Development Setup

To run this project on your machine, you must run both the backend server and the frontend development server.

### Prerequisites
* **Node.js** (v18 or newer recommended)
* **npm** (v9 or newer)
* **Google Gemini API Key** (Get a free key from [Google AI Studio](https://aistudio.google.com/))

### 1. Setup the Backend Server
1. Navigate to the `server/` directory:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `server/` directory based on the `.env.example`:
   ```env
   PORT=3001
   NODE_ENV=development
   DATABASE_URL=sqlite:data/readme-forge.db
   JWT_SECRET=your-jwt-secret-key
   GEMINI_API_KEY=your_gemini_api_key_here
   CORS_ORIGIN=http://localhost:5173
   GITHUB_CLIENT_ID=your_dev_github_client_id
   GITHUB_CLIENT_SECRET=your_dev_github_client_secret
   GITHUB_REDIRECT_URI=http://localhost:3001/api/auth/callback
   ```
4. Start the development server (runs with automatic hot-reloads on file changes):
   ```bash
   npm run dev
   ```
   The backend will start on `http://localhost:3001` and initialize the SQLite database.

### 2. Setup the Frontend Server
1. Navigate back to the root directory:
   ```bash
   cd ..
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite dev server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to `http://localhost:5173`.

---

## Technical Documentation
For in-depth guides and system reference maps, please review the files inside the `/docs` directory:
* 🗺️ [Architecture Reference](file:///D:/CODE/github_readme_builder/docs/Architecture.md) — Detailed service blueprints, entity-relationship diagrams, and caching mechanisms.
* 🤝 [Contributing Guide](file:///D:/CODE/github_readme_builder/docs/Contributing.md) — Step-by-step setup guides and PR criteria.
* 🚀 [Deployment Guide](file:///D:/CODE/github_readme_builder/docs/Deployment.md) — Instructions for hosting your frontend on Vercel and backend on Render.
* 📂 [Folder Structure Map](file:///D:/CODE/github_readme_builder/docs/FolderStructure.md) — Explains the package boundaries and directory layout.
* 📖 [Developer Guide](file:///D:/CODE/github_readme_builder/docs/DeveloperGuide.md) — Walkthroughs of the AI generation pipeline, state synchronization, and roadmap implementations.
