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

Create a `.env` file inside the server directory and configure the following:

```env
PORT=
MONGODB_URI=
JWT_SECRET=
GEMINI_API_KEY=
CLIENT_URL=
```

### Run the project

Frontend

```bash
npm run dev
```

Backend

```bash
cd server
npm run dev
```

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
