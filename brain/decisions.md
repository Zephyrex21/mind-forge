# 🧭 Architecture Decision Records (ADR)

## ADR-001 — Server-Side AI Gateway for Gemini API
- **Date:** 2026-06-29
- **Status:** Accepted
- **Context:** Delivering a SaaS for GitHub profile README builders requires calling the Gemini API. Exposing the Google Gemini API keys directly on the frontend React client makes them vulnerable to public inspection and misuse. Additionally, client-side requests cannot easily deduplicate requests, handle model fallbacks, or cache identical configurations globally.
- **Decision:** Implement a Node.js + Express API Gateway (`server/`) that runs separately. All Gemini API calls are securely configured on the server. The server acts as a gateway implementing caching, prompt optimization, request deduplication, and a model fallback chain.
- **Rejected Alternatives:**
  - *Direct client-side calls*: Rejected because it exposes the API key to the user's browser.
  - *Vercel Serverless Functions only*: Rejected because we need stateful tracking, rate limit queues, and an SQLite database that is more reliable with a persistent Express server.
- **Consequences:** 
  - Increases operational complexity (requires deploying and managing a backend service).
  - Enhances security and reduces costs via request caching and prompt optimization.
  - Provides a centralized SQLite database for usage statistics.

---
## ADR-002 — Secure Cookie Session Auth with GitHub OAuth and Offline Mock Mode
- **Date:** 2026-06-29
- **Status:** Accepted
- **Context:** The application needs a production-ready authentication system for saving projects and tracking generations. We want to avoid user friction by allowing building before logging in. The system must use secure HTTP-only cookies to avoid security vulnerabilities linked to local/sessionStorage, and must be easy to test without forcing developers to create a real GitHub OAuth application immediately.
- **Decision:** Implement a secure cookie session manager using UUID-based sessions stored in SQLite. Create a hybrid GitHub OAuth client that falls back to a simulated mock profile flow in development if client credentials are not defined in `.env`. Integrate an event-driven `executeWithAuth` handler to pause builders, authenticate, and automatically resume tasks without progress loss.
- **Rejected Alternatives:**
  - *JWT Bearer Tokens in LocalStorage*: Rejected due to susceptibility to XSS attacks and lack of server-side session control.
  - *Enforcing Auth upfront*: Rejected to minimize onboarding friction and align with premium SaaS trials.
- **Consequences:**
  - Improves developer onboarding speed via offline sandbox mode.
  - Mitigates CSRF via secure state cookie verification.
  - Secures user data through HTTP-only, SameSite=Lax cookies.

---
## Changelog
---
### [2026-06-29 | SESSION-1 | OPERATION: Create]

**File(s) Affected:** `brain/decisions.md`
**Status:** ✅ Done

#### BEFORE
> NEW FILE

#### AFTER
> Initialized ADR-001 documentation for the Server-side AI Gateway design choice.

#### REASON
> Documentation of the core architectural decision of the application.

#### REMAINING
> Add additional ADRs as more design decisions are made (e.g. SQLite database choice, theme system).
---
### [2026-06-29 | SESSION-18 | OPERATION: Create]

**File(s) Affected:** `brain/decisions.md`
**Status:** ✅ Done

#### BEFORE
> Only ADR-001 was documented.

#### AFTER
> Added ADR-002 detailing the database-backed secure session cookie implementation and offline Mock OAuth mode.

#### REASON
> Log architecture patterns for the security and authentication system.

#### REMAINING
> None.
---
