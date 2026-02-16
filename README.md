<div align="center">

<img src="docs/logo.svg" alt="Soroban Quest" width="120" height="120" />

# Soroban Quest

**A gamified, backendless learning platform for Soroban smart contracts on Stellar.**

Learn to build smart contracts through epic quests — no wallet, no installation, no backend.

[![MIT License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Vite](https://img.shields.io/badge/Vite-6.x-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-18.x-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![Stellar](https://img.shields.io/badge/Stellar-Soroban-7C3AED?logo=stellar&logoColor=white)](https://soroban.stellar.org/)

[**🚀 Live Demo**](#) · [**📖 Documentation**](#features) · [**🐛 Report Bug**](../../issues) · [**✨ Request Feature**](../../issues)

</div>

---

## ✨ Overview

**Soroban Quest** is an open-source, fully client-side educational platform that teaches developers how to write [Soroban](https://soroban.stellar.org/) smart contracts on the Stellar network through a gamified RPG-style quest system.

Inspired by [Node Guardians](https://nodeguardians.io/), the platform provides:

- 🎮 **RPG quest narrative** — immersive story-driven missions
- ⌨️ **In-browser code editor** — Monaco Editor with Rust syntax highlighting
- 🧪 **Instant validation** — AST-based pattern matching (no compilation server needed)
- 🏆 **XP, levels & badges** — full progression system
- 🗺️ **Visual learning path** — SVG mission map with progress tracking
- 💾 **Offline-first** — all progress saved in `localStorage`

> **Zero backend. Zero cost. Open → Code → Learn → Win.**

---

## 🎯 Features

### 🕹️ Gamified Learning

| Feature | Description |
|---------|-------------|
| **7 Progressive Missions** | From "Hello Soroban" to multi-signature contracts |
| **XP System** | Earn 100–400 XP per mission with exponential leveling |
| **10 Rank Titles** | Progress from *Initiate* to *Stellar Sovereign* |
| **8 Achievement Badges** | Unlock milestones like *First Contract* and *Completionist* |
| **Hint System** | Progressive hints when you're stuck |

### ⌨️ In-Browser IDE

- **Monaco Editor** — the same editor that powers VS Code
- **Rust syntax highlighting** with Soroban SDK awareness
- Pre-loaded **code templates** for every mission
- **Solution reveal** for learning by example

### 🧪 Smart Validation Engine

Since compiling Rust in the browser is not feasible without a backend, Soroban Quest uses an innovative **AST-based pattern matching** engine that validates:

- ✅ Function signatures (`fn name`, parameters, return types)
- ✅ Soroban attributes (`#[contract]`, `#[contractimpl]`)
- ✅ Storage operations (`env.storage().instance().get/set`)
- ✅ Type usage (`Address`, `Symbol`, `Vec`, `Map`)
- ✅ Access control patterns (`require_auth()`)
- ✅ Syntax correctness (balanced braces/parentheses)

### 📊 Progress Management

- **localStorage persistence** — progress survives browser restarts
- **JSON export/import** — back up and restore your journey
- **Full reset** — start fresh anytime

---

## 🗺️ Mission Roadmap

```
Chapter 1: The Foundations
  ├── 🟢 Mission 1 — The First Contract      (100 XP)
  └── 🟢 Mission 2 — Greetings Protocol      (150 XP)

Chapter 2: The Vault
  ├── 🟡 Mission 3 — The Counter Vault       (200 XP)
  └── 🟡 Mission 4 — Guardian Ledger         (250 XP)

Chapter 3: Advanced Protocols
  ├── 🔴 Mission 5 — Token Forge             (300 XP)
  ├── 🔴 Mission 6 — The Time Lock           (350 XP)
  └── 🔴 Mission 7 — Multi-Party Pact        (400 XP)
```

**Total: 1,750 XP available**

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
├── index.html                  # Entry point
├── vite.config.js              # Vite configuration
├── package.json
├── src/
│   ├── main.jsx                # React bootstrap
│   ├── App.jsx                 # Router setup
│   ├── index.css               # Design system (~800 lines)
│   ├── pages/
│   │   ├── Home.jsx            # Landing page with starfield animation
│   │   ├── MissionMap.jsx      # SVG learning path + mission cards
│   │   ├── MissionDetail.jsx   # Editor + story + terminal
│   │   └── Profile.jsx         # Stats, badges, export/import
│   ├── components/
│   │   └── Navbar.jsx          # Navigation with live XP display
│   ├── systems/
│   │   ├── gameEngine.js       # XP, levels, badges logic
│   │   ├── storage.js          # localStorage + export/import
│   │   ├── codeValidator.js    # Pattern matching engine
│   │   ├── testRunner.js       # Test orchestration
│   │   └── missionLoader.js    # Mission data access
│   └── data/
│       └── missions.js         # 7 mission definitions
└── docs/
    └── logo.svg                # Project logo
```

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 |
| Build Tool | Vite 6 |
| Code Editor | Monaco Editor |
| Routing | React Router DOM (HashRouter) |
| Markdown | react-markdown |
| Persistence | localStorage |
| Styling | Vanilla CSS with custom properties |

---

## 🎨 Design

- **Dark space RPG theme** with deep blues and neon accents
- **Glassmorphism** cards with backdrop blur
- **Glow effects** on interactive elements
- **Animated starfield** on the landing page
- **Terminal-style output** with typewriter animation
- **Responsive** down to mobile viewports
- **Typography**: Orbitron (display), Inter (body), JetBrains Mono (code)

---

## 🤝 Contributing

Contributions are welcome! Here are some ways you can help:

### Adding New Missions

Missions are defined in `src/data/missions.js`. Each mission object includes:

```javascript
{
  id: 'unique-id',
  title: 'Mission Title',
  chapter: 1,
  order: 1,
  difficulty: 'beginner', // beginner | intermediate | advanced
  xpReward: 100,
  story: '# Markdown story content...',
  learningGoal: 'One-line description',
  template: '// Starter code...',
  solution: '// Reference solution...',
  checks: [
    { type: 'has_function', name: 'my_fn', params: ['env'], message: 'Error message' },
    // ... more validation checks
  ],
  hints: ['Hint 1', 'Hint 2'],
  conceptsIntroduced: ['concept1', 'concept2'],
}
```

### Validation Check Types

| Type | Description |
|------|-------------|
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

### Development Workflow

```bash
# Fork & clone
git clone https://github.com/JafetCHVDev/soroban-quest.git

# Create a feature branch
git checkout -b feat/new-mission

# Make your changes and test
npm run dev

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
- [Vite](https://vitejs.dev/) — for the blazing-fast build tooling

---

<div align="center">

**Built with ⚡ for the Stellar ecosystem**

[⬆ Back to top](#soroban-quest)

</div>
