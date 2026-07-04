# 🧠 Project Memory

## Last Updated: 2026-06-30

---

## ✅ COMPLETED
- AI-Powered Layout Wizard UI (Frontend) — 2026-06-29
- Server-Side AI Gateway with Prompt Optimization, Fallback Chain, SHA-256 caching, Request Queueing (Backend) — 2026-06-29
- SQLite Database schema for sessions, usage tracking, and token logs — 2026-06-29
- Project-Scoped Rules (`.agents/AGENTS.md`) and `/brain` structure initialization — 2026-06-29
- Lazy routes mapping for Homepage Portal, Profile Builder, Project Builder, Settings Diagnostics, and NotFound views — 2026-06-29
- Repository scanner service & project README generator backend endpoint — 2026-06-29
- Enhanced ThemeProvider supporting system preference theme resolving, localStorage, and document body class list sync — 2026-06-29
- Conversational Builder style interface with session recovery, progressive wizard question engine, and repository scanner logs — 2026-06-29
- Configured light mode warm cream background (#E2DFD2) and glassmorphic translucent navigation bar on homepage portal — 2026-06-29
- Authentication System + GitHub OAuth + User Dashboard + Secure Generation Flow — 2026-06-29

---

## 🔄 IN PROGRESS
- None

---

## ⏳ PENDING / TODO
- [ ] Implement additional README customization options — Priority: MED
- [ ] Add more analytics dashboards for usage tracking — Priority: LOW
- [ ] Connect production deployment to actual host servers — Priority: HIGH

---

## ❌ BLOCKERS
- None

---

## 📋 SESSION LOG

### Session 1 — 2026-06-29
- Did: Initialized Workspace Rules (`.agents/AGENTS.md`) using the Master Prompt of the Brain System and set up the `/brain` directory.
- Changed:
  - [.agents/AGENTS.md](file:///D:/CODE/github_readme_builder/.agents/AGENTS.md)
  - [brain/architecture.md](file:///D:/CODE/github_readme_builder/brain/architecture.md)
  - [brain/patterns.md](file:///D:/CODE/github_readme_builder/brain/patterns.md)
  - [brain/decisions.md](file:///D:/CODE/github_readme_builder/brain/decisions.md)
  - [brain/memory.md](file:///D:/CODE/github_readme_builder/brain/memory.md)
- Next: Await user request for coding tasks, features, or fixes on the README Forge application.

### Session 2 — 2026-06-29
- Did: Replied to user's request for showing the project structure.
- Changed:
  - [brain/memory.md](file:///D:/CODE/github_readme_builder/brain/memory.md)
- Next: Await coding or configuration requests from the user.

### Session 3 — 2026-06-29
- Did: Started the backend development server and frontend Vite development server.
- Changed:
  - [brain/memory.md](file:///D:/CODE/github_readme_builder/brain/memory.md)
- Next: Await user's testing of the running servers or feature requests.

### Session 4 — 2026-06-29
- Did: Restructured App route layout to introduce HomePortal, ProfileBuilder (wizard), ProjectBuilder, Settings, and NotFound views. Installed `framer-motion` for transitions. Created backend GitHub repo scanner service and integrated it into the generate routing stack. Enhanced ThemeProvider for Tailwind dark class synchronization and system defaults.
- Changed:
  - [package.json](file:///D:/CODE/github_readme_builder/package.json)
  - [src/app/App.jsx](file:///D:/CODE/github_readme_builder/src/app/App.jsx)
  - [src/app/providers/ThemeProvider.jsx](file:///D:/CODE/github_readme_builder/src/app/providers/ThemeProvider.jsx)
  - [src/app/routes/pages/HomePortal.jsx](file:///D:/CODE/github_readme_builder/src/app/routes/pages/HomePortal.jsx)
  - [src/app/routes/pages/ProfileBuilder.jsx](file:///D:/CODE/github_readme_builder/src/app/routes/pages/ProfileBuilder.jsx)
  - [src/app/routes/pages/ProjectBuilder.jsx](file:///D:/CODE/github_readme_builder/src/app/routes/pages/ProjectBuilder.jsx)
  - [src/app/routes/pages/Settings.jsx](file:///D:/CODE/github_readme_builder/src/app/routes/pages/Settings.jsx)
  - [src/app/routes/pages/NotFound.jsx](file:///D:/CODE/github_readme_builder/src/app/routes/pages/NotFound.jsx)
  - [server/routes/generate.js](file:///D:/CODE/github_readme_builder/server/routes/generate.js)
  - [server/services/ai/repositoryScanner.js](file:///D:/CODE/github_readme_builder/server/services/ai/repositoryScanner.js)
  - [brain/architecture.md](file:///D:/CODE/github_readme_builder/brain/architecture.md)
  - [brain/memory.md](file:///D:/CODE/github_readme_builder/brain/memory.md)
- Next: Await user reviews, visual checks on localhost, or further instructions.

### Session 5 — 2026-06-29
- Did: Fixed the theme toggle support on the Homepage Portal by replacing hardcoded background and text classes with dynamic, theme-responsive variants. Removed the "AI-POWERED DOCUMENTATION SUITE" tag banner as requested.
- Changed:
  - [src/app/routes/pages/HomePortal.jsx](file:///D:/CODE/github_readme_builder/src/app/routes/pages/HomePortal.jsx)
  - [brain/memory.md](file:///D:/CODE/github_readme_builder/brain/memory.md)
- Next: Await user request for theme updates or other fixes.

### Session 6 — 2026-06-29
- Did: Changed the white theme colors to Blue Green `#0096c7` and the dark theme colors to French Blue `#023e8a` across the Theme Provider vibes (making the wizard editor, settings panels, inputs, and card selections inherit these styles) and on the Homepage Portal pages.
- Changed:
  - [src/app/providers/ThemeProvider.jsx](file:///D:/CODE/github_readme_builder/src/app/providers/ThemeProvider.jsx)
  - [src/app/routes/pages/HomePortal.jsx](file:///D:/CODE/github_readme_builder/src/app/routes/pages/HomePortal.jsx)
  - [brain/memory.md](file:///D:/CODE/github_readme_builder/brain/memory.md)
- Next: Await user request for theme tweaks.

### Session 7 — 2026-06-29
- Did: Re-aligned the color palette mapping according to user preferences: the light (white) theme is now mapped to French Blue `#023e8a` (with matching deep blue `#03045e` surfaces), and the dark theme is restored to the dark gray developer theme `#0D1117` (with matching `#161B22` surfaces).
- Changed:
  - [src/app/providers/ThemeProvider.jsx](file:///D:/CODE/github_readme_builder/src/app/providers/ThemeProvider.jsx)
  - [src/app/routes/pages/HomePortal.jsx](file:///D:/CODE/github_readme_builder/src/app/routes/pages/HomePortal.jsx)
  - [brain/memory.md](file:///D:/CODE/github_readme_builder/brain/memory.md)
- Next: Await user request for visual styling tweaks.

### Session 8 — 2026-06-29
- Did: Fine-tuned theme-specific colors for icons, text, headers, mockups, and layout accents across the homepage portal to ensure optimal contrast and visual excellence. Icons in dark mode render as electric blue (#5B8CFF) while light mode icons render as soft cyan-blue.
- Changed:
  - [src/app/routes/pages/HomePortal.jsx](file:///D:/CODE/github_readme_builder/src/app/routes/pages/HomePortal.jsx)
  - [brain/memory.md](file:///D:/CODE/github_readme_builder/brain/memory.md)
- Next: Await user request for theme specifications checklist.

### Session 9 — 2026-06-29
- Did: Implemented the exact hex code mappings for both themes: Light (French Blue #023e8a background, #0077b6 surface, #00b4d8 accents, #90e0ef nav/subtitles, #caf0f8 descriptions, #e0f8ff icons/step numbers, white/blue CTA buttons) and Dark (Developer Gray #111827 background, #1F2937 surface, #374151 borders, gray/blue text, gradients).
- Changed:
  - [src/app/providers/ThemeProvider.jsx](file:///D:/CODE/github_readme_builder/src/app/providers/ThemeProvider.jsx)
  - [src/app/routes/pages/HomePortal.jsx](file:///D:/CODE/github_readme_builder/src/app/routes/pages/HomePortal.jsx)
  - [brain/memory.md](file:///D:/CODE/github_readme_builder/brain/memory.md)
- Next: Await user request for theme tweaks.

### Session 10 — 2026-06-29
- Did: Reverted theme color changes and restored the original theme layouts across the Theme Provider and homepage portal pages (Light: gray-50 background/white surface/indigo accents; Dark: gray-950 background/gray-900 surface/indigo accents) as requested.
- Changed:
  - [src/app/providers/ThemeProvider.jsx](file:///D:/CODE/github_readme_builder/src/app/providers/ThemeProvider.jsx)
  - [src/app/routes/pages/HomePortal.jsx](file:///D:/CODE/github_readme_builder/src/app/routes/pages/HomePortal.jsx)
  - [brain/memory.md](file:///D:/CODE/github_readme_builder/brain/memory.md)
- Next: Await user request for theme specifications checklist.

### Session 11 — 2026-06-29
- Did: Changed the page background color for the Light theme to a warm cream (#E2DFD2) in both ThemeProvider.jsx and HomePortal.jsx, keeping all other default surfaces and layout structures clean.
- Changed:
  - [src/app/providers/ThemeProvider.jsx](file:///D:/CODE/github_readme_builder/src/app/providers/ThemeProvider.jsx)
  - [src/app/routes/pages/HomePortal.jsx](file:///D:/CODE/github_readme_builder/src/app/routes/pages/HomePortal.jsx)
  - [brain/memory.md](file:///D:/CODE/github_readme_builder/brain/memory.md)
- Next: Await user request for navbar style change.

### Session 12 — 2026-06-29
- Did: Made the main landing page header translucent using a glassmorphic background style, with lower background/border opacity levels and an increased backdrop filter blur.
- Changed:
  - [src/app/routes/pages/HomePortal.jsx](file:///D:/CODE/github_readme_builder/src/app/routes/pages/HomePortal.jsx)
  - [brain/memory.md](file:///D:/CODE/github_readme_builder/brain/memory.md)
- Next: Await user request for Repository Intelligence Engine.

### Session 13 — 2026-06-29
- Did: Built a production-grade Repository Intelligence Engine under `server/services/github/` utilizing 15 helper sub-modules for URL validations, metadata lookups, lockfile parsing, frameworks, stack detection, feature mapping, command extraction, ASCII tree rendering, queueing, and memory caching. Created SQLite database caching model `repositoryCache.js` for persistent storage, registered new route handler `generateProject.js` under `/api/generate/project`, and refactored the frontend `ProjectBuilder.jsx` to render step-by-step progress loaders side-by-side with log messages.
- Changed:
  - [server/services/github/constants.js](file:///D:/CODE/github_readme_builder/server/services/github/constants.js)
  - [server/services/github/validators.js](file:///D:/CODE/github_readme_builder/server/services/github/validators.js)
  - [server/services/github/requestQueue.js](file:///D:/CODE/github_readme_builder/server/services/github/requestQueue.js)
  - [server/services/github/cache.js](file:///D:/CODE/github_readme_builder/server/services/github/cache.js)
  - [server/services/github/githubClient.js](file:///D:/CODE/github_readme_builder/server/services/github/githubClient.js)
  - [server/services/github/treeScanner.js](file:///D:/CODE/github_readme_builder/server/services/github/treeScanner.js)
  - [server/services/github/dependencyParser.js](file:///D:/CODE/github_readme_builder/server/services/github/dependencyParser.js)
  - [server/services/github/languageDetector.js](file:///D:/CODE/github_readme_builder/server/services/github/languageDetector.js)
  - [server/services/github/frameworkDetector.js](file:///D:/CODE/github_readme_builder/server/services/github/frameworkDetector.js)
  - [server/services/github/stackDetector.js](file:///D:/CODE/github_readme_builder/server/services/github/stackDetector.js)
  - [server/services/github/featureDetector.js](file:///D:/CODE/github_readme_builder/server/services/github/featureDetector.js)
  - [server/services/github/commandExtractor.js](file:///D:/CODE/github_readme_builder/server/services/github/commandExtractor.js)
  - [server/services/github/architectureDetector.js](file:///D:/CODE/github_readme_builder/server/services/github/architectureDetector.js)
  - [server/services/github/summaryBuilder.js](file:///D:/CODE/github_readme_builder/server/services/github/summaryBuilder.js)
  - [server/services/github/githubAnalyzer.js](file:///D:/CODE/github_readme_builder/server/services/github/githubAnalyzer.js)
  - [server/services/github/repositoryScanner.js](file:///D:/CODE/github_readme_builder/server/services/github/repositoryScanner.js)
  - [server/routes/generateProject.js](file:///D:/CODE/github_readme_builder/server/routes/generateProject.js)
  - [server/routes/generate.js](file:///D:/CODE/github_readme_builder/server/routes/generate.js)
  - [server/index.js](file:///D:/CODE/github_readme_builder/server/index.js)
  - [server/models/repositoryCache.js](file:///D:/CODE/github_readme_builder/server/models/repositoryCache.js)
  - [server/utils/hash.js](file:///D:/CODE/github_readme_builder/server/utils/hash.js)
  - [src/app/routes/pages/ProjectBuilder.jsx](file:///D:/CODE/github_readme_builder/src/app/routes/pages/ProjectBuilder.jsx)
  - [brain/memory.md](file:///D:/CODE/github_readme_builder/brain/memory.md)
- Next: Await user request for UI adjustment.

### Session 14 — 2026-06-29
- Did: Implemented a robust custom regex-based `MarkdownRenderer` component in `src/components/common/` that handles headers, lists, code fences, inline code, bold, italic, links, images, tables, and blockquotes. Cleaned up HTML dangerouslySetInnerHTML rendering inside `ProjectBuilder.jsx` and `GeneratePreview.jsx` using the new component. Reverted `ProfileBuilder.jsx` back to its original step-wizard layout, removing the conversational chat UI per user request.
- Changed:
  - [src/components/common/MarkdownRenderer.jsx](file:///D:/CODE/github_readme_builder/src/components/common/MarkdownRenderer.jsx)
  - [src/app/routes/pages/ProjectBuilder.jsx](file:///D:/CODE/github_readme_builder/src/app/routes/pages/ProjectBuilder.jsx)
  - [src/features/generator/GeneratePreview.jsx](file:///D:/CODE/github_readme_builder/src/features/generator/GeneratePreview.jsx)
  - [src/app/routes/pages/ProfileBuilder.jsx](file:///D:/CODE/github_readme_builder/src/app/routes/pages/ProfileBuilder.jsx)
  - [brain/memory.md](file:///D:/CODE/github_readme_builder/brain/memory.md)
- Next: Await user feedback.

### Session 15 — 2026-06-29
- Did: Modified the Gemini project README system prompt in `server/routes/generateProject.js` to strictly enforce badge generation rules. Added validations to prevent generating License badges when none exists, Build Status badges when no actions are found, and Code Style badges when formatting packages are not present in dependencies.
- Changed:
  - [server/routes/generateProject.js](file:///D:/CODE/github_readme_builder/server/routes/generateProject.js)
  - [brain/memory.md](file:///D:/CODE/github_readme_builder/brain/memory.md)
- Next: Await server shutdown request.

### Session 16 — 2026-06-29
- Did: Terminated running background development server tasks `task-48` (Vite backend proxy on port 3001) and `task-50` (Vite frontend server on port 5173).
- Changed:
  - [brain/memory.md](file:///D:/CODE/github_readme_builder/brain/memory.md)
- Next: Completed task.

### Session 17 — 2026-06-29
- Did: Introduced the new "Conversation" builder style, implementing a complete custom guided guided wizard engine and offline components in `src/components/conversation/`. Supported session recovery, resume/discard dialogs, custom inline widgets, repository crawler terminal logs within chat bubble, and settings toggles for interface styles. Wired path configurations and automatic switches to render conversational builder.
- Changed:
  - [src/components/conversation/validators.js](file:///D:/CODE/github_readme_builder/src/components/conversation/validators.js)
  - [src/components/conversation/questionRegistry.js](file:///D:/CODE/github_readme_builder/src/components/conversation/questionRegistry.js)
  - [src/components/conversation/conversationCache.js](file:///D:/CODE/github_readme_builder/src/components/conversation/conversationCache.js)
  - [src/components/conversation/conversationEngine.js](file:///D:/CODE/github_readme_builder/src/components/conversation/conversationEngine.js)
  - [src/components/conversation/conversationStore.js](file:///D:/CODE/github_readme_builder/src/components/conversation/conversationStore.js)
  - [src/components/conversation/TypingIndicator.jsx](file:///D:/CODE/github_readme_builder/src/components/conversation/TypingIndicator.jsx)
  - [src/components/conversation/ProgressBar.jsx](file:///D:/CODE/github_readme_builder/src/components/conversation/ProgressBar.jsx)
  - [src/components/conversation/SuggestionCards.jsx](file:///D:/CODE/github_readme_builder/src/components/conversation/SuggestionCards.jsx)
  - [src/components/conversation/ResumeDialog.jsx](file:///D:/CODE/github_readme_builder/src/components/conversation/ResumeDialog.jsx)
  - [src/components/conversation/ConversationBubble.jsx](file:///D:/CODE/github_readme_builder/src/components/conversation/ConversationBubble.jsx)
  - [src/components/conversation/ConversationInput.jsx](file:///D:/CODE/github_readme_builder/src/components/conversation/ConversationInput.jsx)
  - [src/components/conversation/QuestionRenderer.jsx](file:///D:/CODE/github_readme_builder/src/components/conversation/QuestionRenderer.jsx)
  - [src/components/conversation/ReviewScreen.jsx](file:///D:/CODE/github_readme_builder/src/components/conversation/ReviewScreen.jsx)
  - [src/components/conversation/ConversationHeader.jsx](file:///D:/CODE/github_readme_builder/src/components/conversation/ConversationHeader.jsx)
  - [src/components/conversation/ConversationSidebar.jsx](file:///D:/CODE/github_readme_builder/src/components/conversation/ConversationSidebar.jsx)
  - [src/components/conversation/ConversationMessages.jsx](file:///D:/CODE/github_readme_builder/src/components/conversation/ConversationMessages.jsx)
  - [src/components/conversation/ConversationLayout.jsx](file:///D:/CODE/github_readme_builder/src/components/conversation/ConversationLayout.jsx)
  - [src/app/providers/ThemeProvider.jsx](file:///D:/CODE/github_readme_builder/src/app/providers/ThemeProvider.jsx)
  - [src/app/routes/pages/Settings.jsx](file:///D:/CODE/github_readme_builder/src/app/routes/pages/Settings.jsx)
  - [src/app/App.jsx](file:///D:/CODE/github_readme_builder/src/app/App.jsx)
  - [src/app/routes/pages/ProfileBuilder.jsx](file:///D:/CODE/github_readme_builder/src/app/routes/pages/ProfileBuilder.jsx)
  - [src/app/routes/pages/ProjectBuilder.jsx](file:///D:/CODE/github_readme_builder/src/app/routes/pages/ProjectBuilder.jsx)
  - [brain/memory.md](file:///D:/CODE/github_readme_builder/brain/memory.md)
  - [brain/architecture.md](file:///D:/CODE/github_readme_builder/brain/architecture.md)
- Next: Await user testing.

### Session 18 — 2026-06-29
- Did: Implemented the GitHub OAuth authentication system, secure HTTP-only cookies session manager, user dashboard and saved projects listing routes, and automated action resumption listeners. Integrated SQLite tables for users and sessions, secure cookies refresh cycles, and offline development mock bypass.
- Changed:
  - [server/db/schema.sql](file:///D:/CODE/github_readme_builder/server/db/schema.sql)
  - [server/sessionManager.js](file:///D:/CODE/github_readme_builder/server/sessionManager.js)
  - [server/auth/githubOAuth.js](file:///D:/CODE/github_readme_builder/server/auth/githubOAuth.js)
  - [server/routes/auth.js](file:///D:/CODE/github_readme_builder/server/routes/auth.js)
  - [server/routes/projects.js](file:///D:/CODE/github_readme_builder/server/routes/projects.js)
  - [server/middleware/auth.js](file:///D:/CODE/github_readme_builder/server/middleware/auth.js)
  - [server/routes/generate.js](file:///D:/CODE/github_readme_builder/server/routes/generate.js)
  - [server/routes/generateProject.js](file:///D:/CODE/github_readme_builder/server/routes/generateProject.js)
  - [server/routes/user.js](file:///D:/CODE/github_readme_builder/server/routes/user.js)
  - [src/services/authApi.js](file:///D:/CODE/github_readme_builder/src/services/authApi.js)
  - [src/features/auth/AuthContext.jsx](file:///D:/CODE/github_readme_builder/src/features/auth/AuthContext.jsx)
  - [src/features/auth/AuthProvider.jsx](file:///D:/CODE/github_readme_builder/src/features/auth/AuthProvider.jsx)
  - [src/features/auth/LoginModal.jsx](file:///D:/CODE/github_readme_builder/src/features/auth/LoginModal.jsx)
  - [src/features/auth/GitHubButton.jsx](file:///D:/CODE/github_readme_builder/src/features/auth/GitHubButton.jsx)
  - [src/features/auth/ProtectedRoute.jsx](file:///D:/CODE/github_readme_builder/src/features/auth/ProtectedRoute.jsx)
  - [src/hooks/useAuth.js](file:///D:/CODE/github_readme_builder/src/hooks/useAuth.js)
  - [src/hooks/useProjects.js](file:///D:/CODE/github_readme_builder/src/hooks/useProjects.js)
  - [src/app/routes/pages/Dashboard.jsx](file:///D:/CODE/github_readme_builder/src/app/routes/pages/Dashboard.jsx)
  - [src/app/routes/pages/Projects.jsx](file:///D:/CODE/github_readme_builder/src/app/routes/pages/Projects.jsx)
  - [src/app/App.jsx](file:///D:/CODE/github_readme_builder/src/app/App.jsx)
  - [src/app/routes/pages/HomePortal.jsx](file:///D:/CODE/github_readme_builder/src/app/routes/pages/HomePortal.jsx)
  - [src/features/generator/GeneratePreview.jsx](file:///D:/CODE/github_readme_builder/src/features/generator/GeneratePreview.jsx)
  - [src/components/conversation/ReviewScreen.jsx](file:///D:/CODE/github_readme_builder/src/components/conversation/ReviewScreen.jsx)
  - [src/components/editor/SettingsDrawer.jsx](file:///D:/CODE/github_readme_builder/src/components/editor/SettingsDrawer.jsx)
  - [brain/memory.md](file:///D:/CODE/github_readme_builder/brain/memory.md)
  - [brain/decisions.md](file:///D:/CODE/github_readme_builder/brain/decisions.md)
- Next: Fully operational, await user verification.

### Session 19 — 2026-06-29
- Did: Removed the settings drawer gear toggle from the wizard header. Updated default state fallbacks for builder vibe (github) and font size (lg) in the theme provider. Stripped the settings diagnostics page of API cache statistics cards, model list sections, guides, and header emojis, and reformatted it into a centered layout.
- Changed:
  - [src/app/providers/ThemeProvider.jsx](file:///D:/CODE/github_readme_builder/src/app/providers/ThemeProvider.jsx)
  - [src/components/editor/TopBar.jsx](file:///D:/CODE/github_readme_builder/src/components/editor/TopBar.jsx)
  - [src/app/routes/pages/Settings.jsx](file:///D:/CODE/github_readme_builder/src/app/routes/pages/Settings.jsx)
  - [brain/memory.md](file:///D:/CODE/github_readme_builder/brain/memory.md)
- Next: Completed tasks.

### Session 20 — 2026-06-29
- Did: Terminated both background development tasks (Vite frontend dev server and Express backend server).
- Changed:
  - [brain/memory.md](file:///D:/CODE/github_readme_builder/brain/memory.md)
- Next: Done.
---

### Session 21 — 2026-06-30
- Did: Answered user's query about OAuth redirect URI and production setup vs. West/Render environment deployment.
- Changed:
  - [brain/memory.md](file:///D:/CODE/github_readme_builder/brain/memory.md)
- Next: Await user's confirmation or next steps.
---

### Session 22 — 2026-06-30
- Did: Clarified the requirement of having two separate GitHub OAuth app configurations for local and production setups.
- Changed:
  - [brain/memory.md](file:///D:/CODE/github_readme_builder/brain/memory.md)
- Next: Await user's confirmation or next steps.
---

### Session 23 — 2026-06-30
- Did: Provided the exact inputs for registering both Local and Production GitHub OAuth applications.
- Changed:
  - [brain/memory.md](file:///D:/CODE/github_readme_builder/brain/memory.md)
- Next: Await user's confirmation or next steps.
---

### Session 24 — 2026-06-30
- Did: Started frontend and backend development servers as background tasks in local environment.
- Changed:
  - [brain/memory.md](file:///D:/CODE/github_readme_builder/brain/memory.md)
- Next: Done.
---
