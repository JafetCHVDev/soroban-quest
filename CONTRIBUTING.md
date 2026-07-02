# Contributing to Soroban Quest

Thanks for contributing to Soroban Quest. This guide explains how to set up the project, how missions are structured, and how to submit PRs that match project conventions.

## Getting Started

### Prerequisites

- Node.js 18+
- npm
- Git

### Fork and Clone

1. Fork the repository on GitHub.
2. Clone your fork:

```bash
git clone https://github.com/<your-username>/soroban-quest.git
cd soroban-quest
```

3. Add the upstream remote:

```bash
git remote add upstream https://github.com/JafetCHVDev/soroban-quest.git
```

### Install and Run

```bash
npm install
npm run dev
```

Open `http://localhost:5173/`.

## Project Structure

Top-level app code lives in `src/`.

- `src/pages/`: route-level pages (Home, MissionMap, MissionDetail, Profile, Journal, Campaigns, SkillTree, Leaderboard, Achievements, Shop, NotFound).
- `src/components/`: shared UI components (Navbar, Footer, ErrorBoundary, ConfirmationDialog, etc.).
- `src/systems/`: gameplay logic, validation, persistence, and mission loading.
- `src/data/`: content definitions (all missions and campaigns).
- `src/i18n/`: internationalization (locales and language bridge).

### System Files

- `src/systems/gameEngine.js`: XP, gold, level progression, mission completion, attempt tracking, and badge awards.
- `src/systems/storage.js`: localStorage load/save plus progress export/import/reset.
- `src/systems/codeValidator.js`: check runner and individual validation check implementations.
- `src/systems/testRunner.js`: orchestrates syntax, structure, and mission checks with progressive output.
- `src/systems/missionLoader.js`: mission retrieval, chapter grouping, unlock logic, and next/previous mission helpers.
- `src/systems/activityLogger.js`: persistent activity journal for user history.

## Adding a New Mission

Add new missions in `src/data/missions.js` inside the exported `missions` array.

### Mission Object Schema

Missions use an i18n-aware structure. Language-neutral fields sit at the top level, while localizable fields live under `i18n[locale]`:

```js
{
  id: 'unique-id',                     // URL-safe unique identifier (used in /mission/:missionId)
  chapter: 1,                          // Chapter number used in map grouping (1-6)
  order: 1,                            // Sequential order used for unlock flow
  difficulty: 'beginner',              // beginner | intermediate | advanced
  xpReward: 100,                       // XP awarded on first completion
  i18n: {
    en: {
      title: 'Mission Title',
      story: '# Markdown story content',
      learningGoal: 'One-line outcome',
      hints: ['Hint 1', 'Hint 2'],
    },
    es: {
      title: 'Título de la Misión',
      story: '# Contenido de la historia en markdown',
      learningGoal: 'Resultado de una línea',
      hints: ['Pista 1', 'Pista 2'],
    },
  },
  template: '// Starter code...',      // Initial code loaded into Monaco editor
  solution: '// Reference solution...',// Revealable reference solution
  checks: [                            // Validation checks run by codeValidator
    { type: 'has_function', name: 'hello', params: ['env', 'to'] }
  ],
  conceptsIntroduced: [                // Tags shown on mission cards and skill tree
    'Env',
    'storage'
  ]
}
```

Alternatively, missions can be authored in Markdown format with YAML frontmatter. See `src/data/missions/hello-soroban.md` for an example, and `src/systems/missionParser.js` for the parser.

### Authoring Notes

- Keep `id` stable after merge; it is used in progress state.
- Keep `order` contiguous so unlock logic remains linear.
- Ensure `template` is solvable and `solution` passes all checks.
- Write `story` in Markdown; code blocks should use fenced syntax (for example, `rust`).
- Include both `en` and `es` translations in the `i18n` block.
- Prefer checks that validate learning goals directly (function signatures, types, storage patterns, auth patterns).

## Validation Check Types Reference

Based on `src/systems/codeValidator.js`. Every listed type currently exists in code.

| Type | Required Fields | Example |
|---|---|---|
| `contains_pattern` | `pattern` | `{ type: 'contains_pattern', pattern: 'env.storage()' }` |
| `has_function` | `name` (`params` optional) | `{ type: 'has_function', name: 'transfer', params: ['env', 'from', 'to', 'amount'] }` |
| `returns_type` | `function`, `returnType` | `{ type: 'returns_type', function: 'hello', returnType: 'Vec<Symbol>' }` |
| `has_attribute` | `attribute` | `{ type: 'has_attribute', attribute: 'contractimpl' }` |
| `uses_type` | `typeName` | `{ type: 'uses_type', typeName: 'Address' }` |
| `storage_operation` | `operation` (`get` \| `set` \| `has` \| `remove`) | `{ type: 'storage_operation', operation: 'set' }` |
| `no_pattern` | `pattern` | `{ type: 'no_pattern', pattern: 'unwrap()' }` |
| `has_struct` | `name` | `{ type: 'has_struct', name: 'Guardian' }` |
| `balanced_braces` | _(none)_ | `{ type: 'balanced_braces' }` |
| `has_import` | `module` | `{ type: 'has_import', module: 'soroban_sdk' }` |

Notes:
- `has_attribute` expects the attribute token (for example `contract` or `contractimpl`), not the full `#[...]` wrapper.
- `returns_type` uses the key `function` in this codebase (not `functionName`).
- `has_import` uses the key `module` in this codebase (not `importPath`).

## Development Commands

```bash
npm run dev              # Start local dev server (Vite)
npm run test             # Run unit/system tests (Vitest)
npm run test:e2e         # Run end-to-end tests (Playwright)
npm run test:visual      # Run visual regression tests
npm run lint             # Lint all files (ESLint)
npm run lint:fix         # Auto-fix lint issues
npm run build            # Build for production
npm run preview          # Preview production build locally
```

## Development Workflow

1. Sync your branch with upstream `main`.
2. Create a branch for your change.
3. Implement and test locally.
4. Open a pull request to this repository.

Example sync flow:

```bash
git fetch upstream
git checkout main
git merge upstream/main
git checkout -b feat/my-change
```

## PR Guidelines

- Branch naming:
  - `feat/mission-name`
  - `fix/description`
  - `docs/description`
- Commit messages: use Conventional Commits (for example, `feat: add mission 8 checks`).
- Every PR must pass the CI pipeline before review.
- Every PR must be tested locally before opening:
  - all pages load (`/`, `/missions`, `/mission/:id`, `/profile`, `/campaigns`, `/shop`, etc.)
  - mission validation still works
  - production build succeeds (`npm run build`)

## Pre-Submission Checklist

Before submitting your PR:

1. Read your changes end-to-end for clarity and consistency.
2. If you touched checks, confirm each check type/field matches `src/systems/codeValidator.js`.
3. If you added or edited a mission, compare against existing entries in `src/data/missions.js`.
4. Preview Markdown rendering on GitHub to verify formatting.
5. Confirm your changes are sufficient for a new contributor to follow without extra context.

## Useful Links

- Project overview: `README.md`
- Missions data: `src/data/missions.js`
- Campaigns data: `src/data/campaigns.js`
- Validator: `src/systems/codeValidator.js`
- Test orchestration: `src/systems/testRunner.js`
- Future roadmap: `FUTURE.md`
- Live demo: https://soroban-quest.vercel.app/
