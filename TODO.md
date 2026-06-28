# Soroban Quest — Project Roadmap & TODO

This document tracks the implementation status of the Soroban Quest platform, outlining completed milestones and future enhancements.

---

## 🚀 Core Platform Status: Production Ready

All core features of the client-side RPG gamified Soroban education platform are fully implemented, tested, and verified.

### 1. Gamified Learning & Progression
- [x] **RPG Progression Engine**: Leveling, rank titles (Initiate to Stellar Sovereign), and XP tracking.
- [x] **Badge/Achievement System**: 8 unlockable badges with event listeners checking conditions.
- [x] **Activity Logger & Journal**: Persistent, localized "Quest Log" that records and displays learner history.
- [x] **Skill Tree**: Interactive visual tree of unlocked smart contract programming concepts.

### 2. IDE & Smart Validation Engine
- [x] **Monaco Code Editor**: Web-based IDE with Rust syntax highlighting.
- [x] **Client-Side AST Validation**: Regex/pattern-matching validation for 7 starter missions (no compilation server needed).
- [x] **Solution Revealer & Hint System**: Multi-stage hints per mission with solution diff templates.

### 3. Campaign System (Chapter Groups)
- [x] **Campaign Chapters Map**: Grouping missions into narrative-driven chapters (Chapter 1, 2, and 3).
- [x] **Lore Modal & Dialogs**: Narrative lore screens for immersive introduction with keyboard accessibility and focus trapping.
- [x] **Progression Level Gates**: Chapters unlocked only upon reaching specific character levels (Level 1, 3, 5).
- [x] **Navbar & Route Integration**: Desktop/mobile navbar links, active page highlighting, and React Router support.

---

## 🛠️ Build & Verification Quality Assurance

- [x] **PWA Support**: Offline caching and asset configuration.
- [x] **Unit & Integration Tests**: 71 automated tests verified with Vitest (`npm run test`).
- [x] **Production Bundle**: Successful builds and code generation with Vite (`npm run build`).

---

## 🔮 Future Backlog & Suggested Improvements

Planned features and enhancements to enrich the RPG learning experience (based on comparative analysis):

### Gameplay Features
- [ ] **Dual-Currency System**: Gold rewards alongside XP for completing missions.
- [ ] **Hint Purchase System**: Players spend Gold to unlock progressive hints.
- [ ] **Inventory & Items**: Unlockable digital equipment affecting player stats.
- [ ] **Global Leaderboard**: Competitive Hall of Fame to foster community learning.

### Educational Features
- [ ] **More Missions**: Add new contract missions (e.g., flash loans, custom token protocols).
- [ ] **CTF & Security Quests**: Standalone missions focused on finding and patching security vulnerabilities.
- [ ] **Real Compilation**: Integrating a client-side Soroban compilation engine (using WebAssembly/Soroban CLI).
