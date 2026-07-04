# 🔁 Patterns & Conventions

## Naming Conventions
- **Frontend Components**: PascalCase with `.jsx` extension (e.g., `TopBar.jsx`, `GeneratePreview.jsx`).
- **Frontend Hooks**: camelCase starting with `use` with `.js` extension (e.g., `useGenerator.js`, `useCredits.js`).
- **Frontend/Backend Utilities & Constants**: camelCase with `.js` extension.
- **Backend Services/Routes/Middleware**: camelCase with `.js` extension (e.g., `geminiProvider.js`, `promptOptimizer.js`).

## Code Patterns
- **React Components**: Function components with hooks, export defaults, styled with Tailwind CSS utility classes.
- **State Management**: Encapsulated state logic inside custom hooks (`useGenerator.js`).
- **Database Operations**: Synchronous/Asynchronous queries using `better-sqlite3` on the backend.
- **API Services**: Separation of concerns inside the `server/services/` layer (e.g. prompt optimization separate from cache or router logic).

## Anti-Patterns (Avoid These)
- Do NOT expose Gemini API keys or sensitive variables on the client side.
- Avoid duplicate simultaneous generation requests by route/IP (always route requests through `requestQueue` on the server).
- Do not bypass the caching mechanism (`cache.js`) for identical payloads.
- Do not bypass the model fallback router chain (`modelRouter.js`).

## Changelog
---
### [2026-06-29 | SESSION-1 | OPERATION: Create]

**File(s) Affected:** `brain/patterns.md`
**Status:** ✅ Done

#### BEFORE
> NEW FILE

#### AFTER
> Naming conventions, code patterns, and anti-patterns defined based on the current codebase layout.

#### REASON
> Initialization of conventions and standards for consistent coding in this workspace.

#### REMAINING
> Keep updating as project adopts new standards or discovers new anti-patterns.
---
