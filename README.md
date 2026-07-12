# Mind Forge

An AI-powered mental wellness platform that helps users build healthier habits through intelligent conversations, guided journaling, mood tracking, and personalized daily check-ins.

Mind Forge combines modern AI with a secure full-stack architecture to provide a private space for self-reflection, emotional awareness, and personal growth.

---

## Live Demo

**Website:** `<your-demo-link>`

---

## Features

* AI-powered mental wellness assistant
* Daily mood and emotional check-ins
* Guided journaling experience
* Personalized AI reflections and insights
* Conversation history and session management
* Secure JWT authentication
* Intelligent prompt optimization
* AI response caching and retry handling
* Safety-aware AI responses
* Responsive and modern user interface

---

## Tech Stack

| Category       | Technologies              |
| -------------- | ------------------------- |
| Frontend       | React, Vite, Tailwind CSS |
| Backend        | Node.js, Express.js       |
| Database       | MongoDB, Mongoose         |
| Authentication | JWT                       |
| AI             | Google Gemini API         |
| Deployment     | Vercel, Railway           |

---

## Architecture

```text
Client
    │
    ▼
Express API
    │
    ├── Authentication
    ├── User Management
    ├── Mood Check-ins
    ├── Journal Management
    ├── AI Conversation Engine
    ├── Prompt Optimizer
    ├── Request Queue
    ├── Response Cache
    ├── Retry Handler
    ├── Safety Layer
    └── Google Gemini API
```

---


## Getting Started

### Clone the repository

```bash
git clone https://github.com/Zephyrex21/mind-forge.git
cd mind-forge
```

### Install dependencies

```bash
npm install
```

Install server dependencies

```bash
cd server
npm install
```

### Environment Variables

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

The server validates these at startup and refuses to start with a clear error message if any are missing or still contain placeholder text — so a misconfigured `.env` shows up immediately rather than as a mysterious crash later.

### Run the project

From the project root, install both frontend and backend dependencies in one step:

```bash
npm run setup
```

Then start both servers together (color-coded FRONTEND/BACKEND output):

```bash
npm run dev
```

---

## Testing & Code Quality

Both the frontend and backend have real automated test suites (Vitest) and lint configs (ESLint flat config).

```bash
# Frontend (from project root)
npm test        # run tests once
npm run lint     # lint

# Backend
cd server
npm test
npm run lint
```

CI runs both automatically on every push/PR via GitHub Actions (`.github/workflows/ci.yml`) — lint, test, and build for the frontend; lint and test for the backend.

---

## Core Technologies

* React
* Vite
* Tailwind CSS
* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT Authentication
* Google Gemini API

---

## Future Roadmap

* AI-powered personalized wellness recommendations
* Habit tracking and goal management
* Meditation and mindfulness exercises
* Emotion analytics dashboard
* Calendar and reminder integration
* Multi-language support
* Export journal entries
* Progressive Web App (PWA)

---

## License

This project is licensed under the MIT License.

---

## Author

**Saurabh Raj Shekhar**

GitHub: https://github.com/Zephyrex21
