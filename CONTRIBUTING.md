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

- `src/pages/`: route-level pages (`Home`, `MissionMap`, `MissionDetail`, `Profile`).
- `src/components/`: shared UI components (currently `Navbar`).
- `src/systems/`: gameplay logic, validation, persistence, and mission loading.
- `src/data/`: content definitions (all missions).

### System Files

- `src/systems/gameEngine.js`: XP, level progression, mission completion, attempt tracking, and badge awards.
- `src/systems/storage.js`: localStorage load/save plus progress export/import/reset.
- `src/systems/codeValidator.js`: check runner and individual validation check implementations.
- `src/systems/testRunner.js`: orchestrates syntax, structure, and mission checks with progressive output.
- `src/systems/missionLoader.js`: mission retrieval, chapter grouping, unlock logic, and next/previous mission helpers.

## Adding a New Mission

Add new missions in `src/data/missions.js` inside the exported `missions` array.

### Mission Object Schema

Use this schema for each mission object:

```js
{
  id: 'unique-id',                     // URL-safe unique identifier (used in /mission/:missionId)
  title: 'Mission Title',              // Display title
  chapter: 1,                          // Chapter number used in map grouping
  order: 1,                            // Sequential order used for unlock flow
  difficulty: 'beginner',              // beginner | intermediate | advanced
  xpReward: 100,                       // XP awarded on first completion
  story: '# Markdown story content',   // Markdown shown in the mission story panel
  learningGoal: 'One-line outcome',    // Short summary used in mission cards
  template: '// Starter code...',      // Initial code loaded into Monaco editor
  solution: '// Reference solution...',// Revealable reference solution
  checks: [                            // Validation checks run by codeValidator/testRunner
    { type: 'has_function', name: 'hello', params: ['env', 'to'] }
  ],
  hints: [                             // Progressive hints shown in order
    'Hint 1',
    'Hint 2'
  ],
  conceptsIntroduced: [                // Tags shown on mission cards
    'Env',
    'storage'
  ]
}
```

### Authoring Notes

- Keep `id` stable after merge; it is used in progress state.
- Keep `order` contiguous so unlock logic remains linear.
- Ensure `template` is solvable and `solution` passes all checks.
- Write `story` in Markdown; code blocks should use fenced syntax (for example, `rust`).
- Prefer checks that validate learning goals directly (function signatures, types, storage patterns, auth patterns).

## Validation Check Types Reference

The table below is based on `src/systems/codeValidator.js`. Every listed type currently exists in code.

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
  - all pages load (`/`, `/missions`, `/mission/:id`, `/profile`)
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
- Validator: `src/systems/codeValidator.js`
- Test orchestration: `src/systems/testRunner.js`
