# Soroban Quest — Project Roadmap & TODO

This document tracks the implementation status of the Soroban Quest platform, outlining completed milestones and future enhancements.

---

## 🚀 Core Platform Status: Production Ready

All core features of the client-side RPG gamified Soroban education platform are fully implemented, tested, and verified.

### 1. Gamified Learning & Progression
- [x] **RPG Progression Engine**: Leveling, rank titles (Initiate to Stellar Architect), and XP tracking.
- [x] **Badge/Achievement System**: 15 unlockable badges (8 general + 7 per-chapter) with event listeners checking conditions.
- [x] **Activity Logger & Journal**: Persistent, localized "Quest Log" that records and displays learner history.
- [x] **Skill Tree**: Interactive visual tree of unlocked smart contract programming concepts.
- [x] **Dual-Currency System**: Gold earned alongside XP (50% ratio), spendable in the Shop.

### 2. IDE & Smart Validation Engine
- [x] **Monaco Code Editor**: Web-based IDE with Rust syntax highlighting.
- [x] **Client-Side AST Validation**: Regex/pattern-matching validation for 19 missions (no compilation server needed).
- [x] **Solution Revealer & Hint System**: Multi-stage hints per mission with solution diff templates.

### 3. Campaign System (Chapter Groups)
- [x] **Campaign Chapters Map**: Grouping missions into narrative-driven chapters (Chapter 1 through 7).
- [x] **Lore Modal & Dialogs**: Narrative lore screens for immersive introduction with keyboard accessibility and focus trapping.
- [x] **Progression Level Gates**: Chapters unlocked upon reaching specific character levels (Level 1, 3, 5, 7, 9, 12, 14).
- [x] **Navbar & Route Integration**: Desktop/mobile navbar links, active page highlighting, and React Router support.

### 4. Economy & Shop
- [x] **Gold Currency**: Earn gold by completing missions (50% of XP reward).
- [x] **Shop Page**: Functional store with avatars, boosts, and badges.
- [x] **Purchase Logic**: Gold-based purchases with ownership tracking.

---

## 🛠️ Build & Verification Quality Assurance

- [x] **PWA Support**: Offline caching and asset configuration.
- [x] **Unit & Integration Tests**: 133 automated tests verified with Vitest (`npm run test`). New missions are validated through the existing test infrastructure.
- [x] **Production Bundle**: Successful builds and code generation with Vite (`npm run build`).
- [x] **E2E Tests**: Playwright-based end-to-end and visual regression tests (`npm run test:e2e`).
- [x] **Lint Clean**: ESLint v9 with Prettier — zero errors, zero warnings.

---

### 5. Code Quality & Optimizations (Recent)
- [x] **Per-Chapter Achievement Badges**: 7 badges (one per chapter) rewarding chapter completion. Added to game engine, locales (en/es), and badge UI.
- [x] **Security / CTF Missions**: Two advanced security missions (Chapter 7): reentrancy guard and access control fix, teaching vulnerability identification and mitigation.
- [x] **Code Splitting**: Split react-markdown and its dependency tree into a separate vendor chunk, reducing main bundle from 602 kB → 475 kB.

---

## 🔮 Future Backlog & Suggested Improvements

See [FUTURE.md](./FUTURE.md) for a detailed catalog of planned features, technical debt, and enhancement ideas.
