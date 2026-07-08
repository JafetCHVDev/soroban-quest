<div align="center">

<img src="docs/logo.svg" alt="Soroban Quest" width="120" height="120" />

# Soroban Quest

**A gamified, backendless learning platform for Soroban smart contracts on Stellar.**

Learn to build smart contracts through epic quests — no wallet, no installation, no backend.

[![MIT License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Vite](https://img.shields.io/badge/Vite-6.x-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-18.x-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![Stellar](https://img.shields.io/badge/Stellar-Soroban-7C3AED?logo=stellar&logoColor=white)](https://soroban.stellar.org/)
[![PWA](https://img.shields.io/badge/PWA-Ready-5A0FC8?logo=pwa&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
[![i18n](https://img.shields.io/badge/i18n-EN%20%7C%20ES-4FC3F7)](src/i18n)
[![CI](https://github.com/JafetCHVDev/soroban-quest/actions/workflows/ci.yml/badge.svg)](https://github.com/JafetCHVDev/soroban-quest/actions/workflows/ci.yml)

[**🚀 Live Demo**](https://soroban-quest.vercel.app/) · [**📖 Documentation**](#features) · [**🐛 Report Bug](../../issues) · [**✨ Request Feature**](../../issues)

</div>

---

## ✨ Overview

**Soroban Quest** is an open-source, fully client-side educational platform that teaches developers how to write [Soroban](https://soroban.stellar.org/) smart contracts on the Stellar network through a gamified RPG-style quest system.

Inspired by [Node Guardians](https://nodeguardians.io/), the platform provides:

- 🎮 **RPG quest narrative** — immersive story-driven missions in English & Spanish
- ⌨️ **In-browser code editor** — Monaco Editor with Rust syntax highlighting & 5 themes
- 🧪 **Instant validation** — AST-based pattern matching + live Monaco markers
- 🏆 **XP, levels & badges** — full progression system with 14 badges, 11 ranks & 13 achievements
- 🗺️ **Visual learning path** — SVG mission map with 19 missions across 7 campaigns
- 🏪 **Gold Economy & Shop** — earn gold, buy avatar packs, XP boosts, streak freezes & cosmetics
- 🌓 **Dark/Light mode** — system-aware theme with manual toggle
- 📱 **PWA** — installable, works offline, periodic updates
- 🤝 **Collaboration** — real-time Yjs + y-webrtc rooms
- 📹 **Code Replay** — record and replay your coding sessions
- 🧠 **Skill Tree** — 58 concepts across 7 categories with progress tracking
- 📖 **Adventure Journal** — virtualized activity log with filters & search
- 🏆 **Leaderboard** — global player rankings sorted by XP
- 💎 **Achievements** — 13 milestone-based achievements with progress tracking
- 🚀 **Okashi Bridge** — one-click compile & deploy to Soroban Testnet
- 🗺️ **Onboarding** — guided tour for new players
- 💾 **Offline-first** — all progress saved in `localStorage`

> **Zero backend. Zero cost. Open → Code → Learn → Win.**

---

## 🎯 Features

### 🕹️ Gamified Learning

| Feature | Description |
| ------- | ----------- |
| **19 Progressive Missions** | From "Hello Soroban" to security audits, across 7 chapters |
| **7 Story Campaigns** | Narrative-driven chapters with lore, gated by level |
| **XP System** | Earn 100–400 XP per mission with exponential leveling |
| **11 Rank Titles** | Progress from _Initiate_ to _Stellar Sovereign_ |
| **14 Badges + 13 Achievements** | Unlock milestones like _First Contract_ and _Completionist_ |
| **Gold Economy** | Earn gold per mission, spend in the Shop on boosts & cosmetics |
| **Daily Streaks** | Consecutive login tracking |
| **Hint System** | Progressive hints when you're stuck |

### ⌨️ In-Browser IDE

- **Monaco Editor** — the same editor that powers VS Code
- **Rust syntax highlighting** with Soroban SDK awareness
- Pre-loaded **code templates** for every mission
- **Solution reveal** for learning by example
- **Live validation** — instant inline markers as you type
- **5 editor themes**: Dark, Light, High Contrast, Soroban Night, Stellar Dawn

### 🧪 Smart Validation Engine

Since compiling Rust in the browser is not feasible without a backend, Soroban Quest uses an innovative **AST-based pattern matching** engine that validates:

- ✅ Function signatures (`fn name`, parameters, return types)
- ✅ Soroban attributes (`#[contract]`, `#[contractimpl]`)
- ✅ Storage operations (`env.storage().instance().get/set`)
- ✅ Type usage (`Address`, `Symbol`, `Vec`, `Map`)
- ✅ Access control patterns (`require_auth()`)
- ✅ Syntax correctness (balanced braces/parentheses)
- ✅ **Live validation** — debounced markers update as you code

### 🌐 Internationalization

- **English** (full) & **Spanish** (full)
- Language toggle in the navbar
- Missions, campaigns, UI, badges, lore — all localized
- Extensible i18n architecture for additional languages

### 📊 Progress Management

- **localStorage persistence** — progress survives browser restarts
- **JSON export/import** — back up and restore your journey
- **Full reset** — start fresh anytime
- **Adventure Journal** — virtualized activity log with search, type & date filters
- **Code Replay** — record, store & replay your coding sessions

### 👥 Collaboration

- **Yjs + y-webrtc** — real-time collaborative editing
- Room-based invites — share a URL with peers
- Peer avatars showing who's in your session
- Local storage snapshots for offline recovery

### 🚀 Okashi Bridge

- One-click **compile & deploy** to Soroban Testnet
- Copies your code to clipboard and opens okashi.dev
- No account or setup required

### 🏪 Shop & Gold Economy

- **Gold** earned per mission completion scales with difficulty (50–200 gold)
- **6 purchasable items**: Avatar Packs, XP Boost, Streak Freeze, Hint Tokens, Premium Badge
- Category filters (Avatars / Boosts / Badges)
- One-time purchases tracked per profile
- Toast notifications for purchases, insufficient funds, and already-owned items

### 🏆 Leaderboard

- Global player rankings sorted by XP (descending)
- Champion card for #1 ranked player
- Sortable table with columns: rank, avatar, name, XP, level, missions completed, badges, status
- Current profile highlighted with switch-to button

### 💎 Achievements & Badges

- **14 badges** from game progression (First Contract, Completionist, chapter badges, etc.)
- **13 achievements** from milestone conditions (XP thresholds, streaks, first-try missions)
- Dedicated Achievements page with progress bar and grid display
- Unlocked badges show their icon; locked ones show a "?"

### 🗺️ Onboarding

- Guided tour for new players on first visit
- Step-by-step walkthrough of key UI areas
- Dismissible overlay with skip option

---

## 🗺️ Mission Roadmap

```
Campaign 1: The Awakening (Level 1+)
  ├── 🟢 Mission 1  — The First Contract      (100 XP)
  └── 🟢 Mission 2  — Greetings Protocol      (150 XP)

Campaign 2: Vault of Memory (Level 3+)
  ├── 🟡 Mission 3  — The Counter Vault       (200 XP)
  └── 🟡 Mission 4  — Guardian Ledger         (250 XP)

Campaign 3: Token Forge (Level 5+)
  ├── 🔴 Mission 5  — Token Forge             (300 XP)
  ├── 🔴 Mission 6  — The Time Lock           (350 XP)
  └── 🔴 Mission 7  — Multi-Party Pact        (400 XP)

Campaign 4: Data Realm (Level 7+)
  ├── 🔵 Mission 8  — Vault Manager           (400 XP)
  ├── 🔵 Mission 9  — Event Emitter           (450 XP)
  └── 🔵 Mission 10 — Approval Manager        (450 XP)

Campaign 5: Protocols (Level 9+)
  ├── 🟠 Mission 11 — Crowdfund               (500 XP)
  ├── 🟠 Mission 12 — Escrow Agent            (500 XP)
  └── 🟠 Mission 13 — Subscription            (550 XP)

Campaign 6: Production (Level 12+)
  ├── 💜 Mission 14 — Flash Loan              (600 XP)
  ├── 💜 Mission 15 — Permissions RBAC        (600 XP)
  ├── 💜 Mission 16 — Oracle Feed             (650 XP)
  └── 💜 Mission 17 — Governor (Simple)       (650 XP)

Campaign 7: Security (Level 14+)
  ├── ⚫ Mission 18 — Reentrancy Guard        (700 XP)
  └── ⚫ Mission 19 — Access Control Fix      (750 XP)
```

**Total: 8,550 XP available** · Campaigns unlock at level thresholds

---

## 🧠 Skill Tree

58 concepts across 7 categories track what you've learned:

| Category | Concepts |
| -------- | -------- |
| **Core** | contract, contractimpl, Env, Symbol |
| **Storage** | storage, instance, persistent storage, Map\<Address, i128\>, set, get, remove, unwrap_or, compound storage keys, pool management |
| **Types** | Address, Vec, Map, String, i128, u32, bool, allowance pattern |
| **Auth** | require_auth, init pattern, admin pattern, multi-party init, RBAC, role membership |
| **Events** | events, publish, event-driven design, Vec tracking |
| **Protocols** | token, mint, transfer, ledger sequence, time-lock, multi-sig, crowdfunding, deadline pattern, goal tracking, escrow pattern, dispute resolution, state machine, recurring billing, subscription state, cancel pattern |
| **DeFi** | flash loan, loan lifecycle, fee mechanism, oracle pattern, price feed, asset tracking, off-chain bridge, governance, proposal lifecycle, vote tallying, quorum logic |

---

## 🚀 Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- npm (included with Node.js)

### Installation

```bash
# Clone the repository
git clone https://github.com/JafetCHVDev/soroban-quest.git
cd soroban-quest

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open **http://localhost:5173/** in your browser and begin your quest! ⚔️

### Development Commands

```bash
# Start local dev server
npm run dev

# Run unit tests (Vitest)
npm run test

# Run end-to-end tests (Playwright)
npm run test:e2e

# Build for production
npm run build

# Preview production build locally
npm run preview
```

### Production Build

```bash
# Generate static files
npm run build

# Preview the build
npm run preview
```

The `dist/` folder contains a fully static site — deploy it anywhere (Vercel, Netlify, GitHub Pages, Cloudflare Pages, etc.).

---

## 🏗️ Architecture

```
soroban-quest/
├── index.html                      # Entry point
├── vite.config.js                  # Vite + PWA config
├── package.json
├── playwright.config.js            # E2E test config
├── public/
│   └── manifest.json               # PWA manifest
├── src/
│   ├── main.jsx                    # React bootstrap + i18n + PWA prompt
│   ├── App.jsx                     # Routes, providers, error boundary
│   ├── index.css                   # Design system (~1100 lines)
│   ├── pages/
│   │   ├── Home.jsx                # Landing page with starfield animation
│   │   ├── Home.css                # Home page styles
│   │   ├── Campaigns.jsx           # Campaign cards with lore modals
│   │   ├── Campaigns.css           # Campaign page styles
│   │   ├── MissionMap.jsx          # SVG learning path + search/filter
│   │   ├── MissionMap.css          # Mission map styles
│   │   ├── MissionDetail.jsx       # Editor + story + tests + replay
│   │   ├── MissionDetail.css       # Mission detail styles (desktop grid + mobile tabs)
│   │   ├── Profile.jsx             # Stats, badges, avatar, import/export
│   │   ├── Profile.css             # Profile page styles
│   │   ├── Journal.jsx             # Virtualized activity log
│   │   ├── Journal.css             # Journal page styles
│   │   ├── SkillTree.jsx           # Concept-skill visualization
│   │   ├── SkillTree.css           # Skill tree styles
│   │   ├── Leaderboard.jsx         # Global player rankings by XP
│   │   ├── Leaderboard.css         # Leaderboard styles
│   │   ├── Achievements.jsx        # Badge/achievement showcase
│   │   ├── Achievements.css        # Achievements page styles
│   │   ├── Shop.jsx                # Gold-based item shop
│   │   ├── Shop.css                # Shop page styles
│   │   └── NotFound.jsx            # 404 page
│   ├── components/
│   │   ├── Navbar.jsx              # Navigation + theme/language toggles
│   │   ├── Footer.jsx              # Footer with links
│   │   ├── ScrollToTop.jsx         # Smooth scroll on route change
│   │   ├── LoadingScreen.jsx       # Quest-themed loading overlay
│   │   ├── HomeSkeleton.jsx        # Skeleton loader for home page
│   │   ├── MissionDetailSkeleton.jsx  # Skeleton loader for missions
│   │   ├── ErrorBoundary.jsx       # React error boundary
│   │   ├── ErrorBoundary.css       # Error boundary styles
│   │   ├── ErrorFallback.jsx       # Error fallback UI
│   │   ├── ConfirmationDialog.jsx  # Modal confirmation dialog
│   │   ├── ConfirmationDialog.css  # Dialog styles
│   │   ├── CollaborationBar.jsx    # Yjs room UI
│   │   ├── CollaborationAvatar.jsx # Peer avatars
│   │   ├── CodeReplayPlayer.jsx    # Recorded session playback
│   │   ├── Confetti.jsx            # Confetti animation effect
│   │   ├── Confetti.css            # Confetti animation styles
│   │   ├── Onboarding.jsx          # Guided tour for new players
│   │   ├── Onboarding.css          # Onboarding overlay styles
│   │   └── LanguageSelector.jsx    # Dropdown language switcher
│   ├── systems/
│   │   ├── gameEngine.js           # XP, levels, ranks, badges, streaks, gold
│   │   ├── storage.js              # localStorage CRUD + export/import
│   │   ├── codeValidator.js        # Pattern-matching engine (10 check types)
│   │   ├── liveValidator.js        # Debounced Monaco marker setter
│   │   ├── testRunner.js           # 3-phase async test orchestrator
│   │   ├── missionLoader.js        # Mission queries, unlock logic, i18n
│   │   ├── missionParser.js        # Markdown mission parser
│   │   ├── activityLogger.js       # 200-entry ring-buffer activity log
│   │   ├── codeRecorder.js         # Session recording/playback
│   │   ├── collaboration.js        # Yjs + y-webrtc integration
│   │   ├── editorThemes.js         # 5 editor theme definitions
│   │   ├── achievementEngine.js    # Achievement condition evaluation
│   │   ├── GameStateContext.jsx    # React context (progress + profile)
│   │   ├── ToastContext.jsx        # Toast notification system
│   │   ├── Toast.css               # Toast notification styles
│   │   ├── useokashi.js            # Okashi.dev bridge hook
│   │   └── useDocumentTitle.js     # Dynamic document title hook
│   ├── data/
│   │   ├── missions.js             # 19 mission definitions (i18n)
│   │   ├── missions/               # Per-mission markdown assets
│   │   │   └── hello-soroban.md
│   │   ├── campaigns.js            # 7 campaign definitions
│   │   ├── achievements.js         # 13 achievement definitions
│   │   └── avatars.js              # 12 emoji avatars
│   └── i18n/
│       ├── index.jsx               # Language context provider
│       ├── useTranslation.js       # Translation hook
│       ├── languageBridge.js        # Non-React translation bridge
│       └── locales/
│           ├── en.json             # English (~425 keys)
│           └── es.json             # Spanish (~425 keys)
├── e2e/
│   ├── navigation.spec.ts          # Nav smoke tests
│   ├── mission.spec.ts             # Mission page + persistence
│   ├── profile.spec.ts             # Profile editing
│   ├── campaigns.spec.ts           # Campaign cards + lore modals
│   ├── skilltree.spec.ts           # Concept nodes + categories
│   ├── streak.spec.ts              # Streak display
│   ├── visual-regression.spec.ts   # Visual snapshot tests
│   └── utils.ts                    # E2E test utilities
├── docs/
│   ├── logo.svg                    # Project logo
│   └── mejoras-sugeridas.md        # Improvement suggestions
├── .github/
│   ├── workflows/
│   │   ├── ci.yml                  # CI (build every push/PR)
│   │   └── e2e.yml                 # E2E (Playwright on push/PR)
│   ├── PULL_REQUEST_TEMPLATE.md
│   └── ISSUE_TEMPLATE/
│       ├── bug_report.md
│       ├── feature_request.md
│       └── new_mission.md
└── TODO.md                         # Implementation progress
```

### Tech Stack

| Layer | Technology |
| ----- | ---------- |
| Framework | React 18.3 |
| Build Tool | Vite 6 |
| Code Editor | Monaco Editor (via `@monaco-editor/react` 4.6) |
| Routing | React Router DOM 6 (HashRouter) |
| Markdown | react-markdown 9 |
| Collaboration | Yjs 13 + y-webrtc 10 |
| Virtualization | @tanstack/react-virtual 3 |
| Icons | lucide-react 1.8 |
| PWA | vite-plugin-pwa 0.21 |
| Testing (Unit) | Vitest 4 |
| Testing (E2E) | Playwright 1.44 |
| Persistence | localStorage |
| Styling | Vanilla CSS with custom properties |
| i18n | Custom context-based (EN/ES) |

---

## 🎨 Design

- **Dark/Light mode** with system-aware default and manual toggle
- **Dark space RPG theme** with deep blues and neon accents
- **Light mode** with clean white backgrounds and subtle shadows
- **Glassmorphism** cards with backdrop blur
- **Glow effects** on interactive elements
- **Animated starfield** on the landing page
- **Terminal-style output** with typewriter animation
- **5 Monaco editor themes**: Dark, Light, High Contrast, Soroban Night, Stellar Dawn
- **Responsive** down to mobile viewports (collapsible nav, stacked layouts)
- **Typography**: Orbitron (display), Inter (body), JetBrains Mono (code)

---

## 🔗 Useful Links

- Live demo: https://soroban-quest.vercel.app/
- Contributing guide: [CONTRIBUTING.md](CONTRIBUTING.md)
- CI workflow: [.github/workflows/ci.yml](.github/workflows/ci.yml)
- E2E workflow: [.github/workflows/e2e.yml](.github/workflows/e2e.yml)
- Soroban docs: https://soroban.stellar.org/docs
- Okashi compiler: https://okashi.dev/

---

## 🤝 Contributing

Contributions are welcome! Here are some ways you can help:

### Adding New Missions

Missions are defined in `src/data/missions.js`. Each mission object supports i18n for English and Spanish:

```javascript
{
  id: 'unique-id',
  chapter: 1,
  order: 1,
  difficulty: 'beginner', // beginner | intermediate | advanced
  xpReward: 100,
  i18n: {
    en: {
      title: 'Mission Title',
      story: '# Markdown...',
      learningGoal: 'Goal description',
      hints: ['Hint 1', 'Hint 2'],
    },
    es: {
      title: 'Título de la Misión',
      story: '# Markdown...',
      learningGoal: 'Descripción del objetivo',
      hints: ['Pista 1', 'Pista 2'],
    },
  },
  template: '// Starter code...',
  solution: '// Reference solution...',
  checks: [
    { type: 'has_function', name: 'my_fn', params: ['env'], message: 'Error message' },
  ],
  conceptsIntroduced: ['concept1', 'concept2'],
}
```

### Validation Check Types

| Type | Description |
| ---- | ----------- |
| `has_function` | Checks for function with specific name/params |
| `returns_type` | Validates function return type |
| `has_attribute` | Checks for Rust attributes |
| `contains_pattern` | Pattern exists in code |
| `no_pattern` | Pattern must NOT exist |
| `uses_type` | Checks for type usage |
| `storage_operation` | Validates storage get/set/has/remove |
| `has_struct` | Checks for struct definition |
| `has_import` | Validates use/import statements |
| `balanced_braces` | Syntax validation |

### Adding Campaigns

Add campaign definitions in `src/data/campaigns.js`:

```javascript
{
  id: 'chapter-n-name',
  i18n: {
    en: { title: '...', description: '...', lore: '...' },
    es: { title: '...', description: '...', lore: '...' },
  },
  chapterNumber: 4,
  missionIds: ['mission-8', 'mission-9'],
  requiredLevel: 7,
  color: 'blue', // theme color
}
```

### Development Workflow

```bash
# Fork & clone
git clone https://github.com/JafetCHVDev/soroban-quest.git

# Create a feature branch
git checkout -b feat/new-mission

# Make your changes and test
npm run dev

# Run tests
npm run test
npm run test:e2e

# Build and verify
npm run build

# Submit a pull request
```

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [Stellar Development Foundation](https://stellar.org/) — for the Soroban platform
- [Node Guardians](https://nodeguardians.io/) — for the gamified learning inspiration
- [Monaco Editor](https://microsoft.github.io/monaco-editor/) — for the powerful in-browser editor
- [Yjs](https://yjs.dev/) — for the CRDT collaboration framework
- [Vite](https://vitejs.dev/) — for the blazing-fast build tooling
- [Okashi](https://okashi.dev/) — for the in-browser Soroban compiler

---

<div align="center">

**Built with ⚡ for the Stellar ecosystem**

[⬆ Back to top](#soroban-quest)

</div>
