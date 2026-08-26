# Design Document: Data Integrity Tests

## Overview

This document describes the architecture and implementation plan for
`src/systems/__tests__/dataIntegrity.test.js` — a comprehensive integration test suite
that validates structural integrity and cross-reference consistency across all game data
(missions, campaigns, achievements) and the game engine (badges, `CHAPTER_MISSIONS`,
`xpForLevel`). The suite acts as a contract-level regression harness, complementing the
existing `missionQuality.test.js` and `campaigns.test.js` without duplicating their
assertions.

---

## Architecture

### Technology Stack

- **Test runner**: Vitest (already used project-wide, configured in `vite.config.js`)
- **Assertion style**: `expect` from `vitest` — matches the existing test suite style
- **Mocking**: `vi.mock` for the Vite-specific `hello-soroban.md?raw` import
- **No new dependencies** required

### File Location

```
src/systems/__tests__/dataIntegrity.test.js
```

This location is consistent with the existing test files in `src/systems/__tests__/`.

### Imports Required

| Symbol | Source |
|---|---|
| `missions`, `localizeMission` | `../../data/missions.js` |
| `campaigns` | `../../data/campaigns.js` |
| `ACHIEVEMENTS`, `ACHIEVEMENT_CATEGORIES` | `../../data/achievements.js` |
| `BADGES`, `CHAPTER_MISSIONS`, `xpForLevel`, `GOLD_PER_MISSION_RATIO` | `../gameEngine.js` |

The `hello-soroban.md?raw` mock must be registered with `vi.mock` before any of the
above imports resolve, using the exact mock content from `missionQuality.test.js`.

---

## Test Suite Structure

The file is organized into five `describe` blocks, one per requirement area. Each block
is self-contained and imports only what it needs.

```
dataIntegrity.test.js
├── Mock setup  (vi.mock for markdown import)
├── Describe: "Mission Structural Validation"         (Req 1)
├── Describe: "Campaign Cross-Reference Consistency"  (Req 2)
├── Describe: "Achievement Validation"                (Req 3)
├── Describe: "XP Economy Validation"                 (Req 4)
└── Describe: "Badge and CHAPTER_MISSIONS Validation" (Req 5)
```

---

## Component Details

### Mock Setup

```javascript
vi.mock('../../data/missions/hello-soroban.md?raw', () => ({
  default: `---
id: hello-soroban
chapter: 1
order: 1
difficulty: beginner
xp: 100
title: The First Contract
learningGoal: Create your first Soroban smart contract with a hello function
hints:
  - 'Start with pub fn hello(env: Env, to: Symbol) -> Vec<Symbol>'
  - 'Use the vec![] macro with &env as the first argument'
  - 'The full return line: vec![&env, symbol_short!("Hello"), to]'
---
# The Awakening
Complete the code template to pass all checks.`,
}));
```

This is identical to the pattern in `missionQuality.test.js` so both suites share
consistent mock content.

---

### Requirement 1: Mission Structural Validation

**Constants used:**

```javascript
const VALID_CHECK_TYPES = new Set([
  'has_function', 'returns_type', 'has_attribute', 'contains_pattern',
  'no_pattern', 'uses_type', 'storage_operation', 'has_struct',
  'balanced_braces', 'has_import',
]);

const REQUIRED_MISSION_FIELDS = [
  'id', 'chapter', 'order', 'difficulty', 'xpReward',
  'template', 'solution', 'checks', 'conceptsIntroduced',
];

const REQUIRED_I18N_FIELDS = ['title', 'story', 'learningGoal', 'hints'];
```

**Tests:**

| Test | Nature | Assertion |
|---|---|---|
| Exactly 19 missions | EXAMPLE | `missions.length === 19` |
| All required top-level fields present and non-empty | PROPERTY | Per-mission loop |
| `i18n.en` fields complete | PROPERTY | Per-mission loop |
| `i18n.es` fields complete | PROPERTY | Per-mission loop |
| All check `type` values are valid | PROPERTY | Per-check loop |
| No duplicate mission IDs | EXAMPLE | Set size check |

---

### Requirement 2: Campaign Cross-Reference Consistency

**Tests:**

| Test | Nature | Assertion |
|---|---|---|
| Exactly 7 campaigns | EXAMPLE | `campaigns.length === 7` |
| Campaign missionIds reference valid missions | PROPERTY | Per-campaign, per-missionId lookup |
| Every mission chapter has a corresponding campaign | PROPERTY | Per-mission lookup |
| `requiredLevel` sequence equals `[1,3,5,7,9,12,14]` | EXAMPLE | Sort by chapterNumber, deep-equal |
| No duplicate missionIds within a campaign | PROPERTY | Per-campaign Set size check |
| `i18n.en` and `i18n.es` title + description non-empty | PROPERTY | Per-campaign, per-locale loop |
| All mission IDs covered by at least one campaign | EXAMPLE | Union set superset check |

---

### Requirement 3: Achievement Validation

**Constants used:**

```javascript
const VALID_CONDITION_TYPES = new Set([
  'missions_completed', 'total_xp', 'level', 'first_try_missions', 'streak',
]);
```

**Tests:**

| Test | Nature | Assertion |
|---|---|---|
| Exactly 13 achievements | EXAMPLE | `ACHIEVEMENTS.length === 13` |
| All required fields present and non-empty | PROPERTY | Per-achievement loop |
| `condition.type` in ValidConditionTypes | PROPERTY | Per-achievement check |
| `condition.value` is positive int or `"all"` | PROPERTY | Per-achievement check |
| `reward.xp` is positive integer | PROPERTY | Per-achievement check |
| No duplicate achievement IDs | EXAMPLE | Set size check |
| `category` belongs to `ACHIEVEMENT_CATEGORIES` | PROPERTY | Per-achievement lookup |

---

### Requirement 4: XP Economy Validation

**Tests:**

| Test | Nature | Assertion |
|---|---|---|
| Total XP across all missions equals 6250 | EXAMPLE | `reduce` sum check |
| Each mission `xpReward` is a positive integer | PROPERTY | Per-mission type/value check |
| Gold formula consistency | PROPERTY | Per-mission: `Math.floor(xpReward * GOLD_PER_MISSION_RATIO) === Math.floor(xpReward * 0.5)` |
| Cumulative XP is reachable before each campaign unlock | EXAMPLE | Per-campaign ordered check |
| `xpForLevel` formula correctness | PROPERTY | Sampled level range check |

For the `xpForLevel` property, the test samples levels 1 through 20 (a broad range
covering the full set of `requiredLevel` values used by campaigns):

```javascript
for (let n = 1; n <= 20; n++) {
  const expected = n <= 1 ? 0 : Math.floor(500 * Math.pow(n - 1, 1.5));
  expect(xpForLevel(n)).toBe(expected);
}
```

For the campaign unlock reachability check, missions are grouped by chapter and cumulative
XP is computed iteratively. The check uses a conservative model: all XP from chapters
strictly before the campaign's chapter is assumed earnable. The assertion is:

```javascript
xpForLevel(campaign.requiredLevel) <= cumulativeXPBeforeChapter
```

---

### Requirement 5: Badge and CHAPTER_MISSIONS Validation

**Tests:**

| Test | Nature | Assertion |
|---|---|---|
| Exactly 15 badges | EXAMPLE | `BADGES.length === 15` |
| All badge fields present and non-empty | PROPERTY | Per-badge field checks |
| `badge.condition` is a function | PROPERTY | `typeof badge.condition === 'function'` |
| No duplicate badge IDs | EXAMPLE | Set size check |
| Chapter badge mission IDs exist in missions catalog | PROPERTY | Per chapter-badge, per missionId lookup |
| `CHAPTER_MISSIONS` has exactly 7 keys (1–7) | EXAMPLE | `Object.keys` deep-equal |
| Union of `CHAPTER_MISSIONS` values === full missions set | EXAMPLE | Bidirectional Set comparison |

---

## Data Models

The test file itself introduces no new data models. It consumes the following existing
exported types:

### Mission (from `missions.js`)
```
{
  id: string,
  chapter: number,
  order: number,
  difficulty: 'beginner' | 'intermediate' | 'advanced',
  xpReward: number,
  template: string,
  solution: string,
  checks: Array<{ type: string, message?: string, ... }>,
  conceptsIntroduced: string[],
  i18n: {
    en: { title: string, story: string, learningGoal: string, hints: string[] },
    es: { title: string, story: string, learningGoal: string, hints: string[] },
  }
}
```

### Campaign (from `campaigns.js`)
```
{
  id: string,
  chapterNumber: number,
  missionIds: string[],
  requiredLevel: number,
  i18n: {
    en: { title: string, description: string, lore: string },
    es: { title: string, description: string, lore: string },
  }
}
```

### Achievement (from `achievements.js`)
```
{
  id: string,
  name: string,
  description: string,
  icon: string,
  category: string,
  condition: { type: string, value: number | 'all' },
  reward: { xp: number }
}
```

### Badge (from `gameEngine.js`)
```
{
  id: string,
  name: string,
  description: string,
  icon: string,
  condition: (state: object) => boolean
}
```

---

## Error Handling

The test suite is a passive validator — it reads data and asserts properties. There are
no error-prone side effects. All assertions use descriptive messages so failures
immediately identify the offending data item:

```javascript
// Example of a descriptive failure message
expect(
  validConditionTypes.has(achievement.condition.type),
  `Achievement "${achievement.id}" has unknown condition.type: "${achievement.condition.type}"`
).toBe(true);
```

Failing tests produce messages that include:
- The specific data item (mission ID, campaign ID, achievement ID, badge ID)
- The failing field or constraint
- The actual value that violated the constraint

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid
executions of a system — essentially, a formal statement about what the system should do.
Properties serve as the bridge between human-readable specifications and
machine-verifiable correctness guarantees.*

### Property 1: Mission required-field completeness

*For any* mission in the missions array, the fields `id`, `chapter`, `order`,
`difficulty`, `xpReward`, `template`, `solution`, `checks`, and `conceptsIntroduced`
must all be present and non-empty (truthy for strings/arrays, defined for numbers).

**Validates: Requirements 1.2**

---

### Property 2: Mission i18n completeness

*For any* mission in the missions array and *for any* locale in `['en', 'es']`, the
fields `title`, `story`, and `learningGoal` are non-empty strings and `hints` is a
non-empty array of strings in `mission.i18n[locale]`.

**Validates: Requirements 1.3, 1.4**

---

### Property 3: Mission check types are valid

*For any* mission and *for any* check object in `mission.checks`, `check.type` belongs
to the 10-element set of ValidCheckTypes recognised by `codeValidator.js`.

**Validates: Requirements 1.5**

---

### Property 4: Campaign missionIds reference valid missions

*For any* campaign and *for any* `missionId` in `campaign.missionIds`, there exists a
mission in the `missions` array whose `id` equals that `missionId`.

**Validates: Requirements 2.2**

---

### Property 5: Every mission chapter has a corresponding campaign

*For any* mission, there exists at least one campaign in the `campaigns` array whose
`chapterNumber` equals `mission.chapter`.

**Validates: Requirements 2.3**

---

### Property 6: No intra-campaign duplicate missionIds

*For any* campaign, the `missionIds` array contains no duplicate values (the size of the
derived Set equals the length of the array).

**Validates: Requirements 2.5**

---

### Property 7: Campaign i18n completeness

*For any* campaign and *for any* locale in `['en', 'es']`, `campaign.i18n[locale].title`
and `campaign.i18n[locale].description` are non-empty strings.

**Validates: Requirements 2.6**

---

### Property 8: Achievement required-field completeness

*For any* achievement in `ACHIEVEMENTS`, the fields `id`, `name`, `description`,
`category`, `condition`, and `reward` are all present and non-empty.

**Validates: Requirements 3.2**

---

### Property 9: Achievement condition validity

*For any* achievement, `achievement.condition.type` belongs to `ValidConditionTypes` and
`achievement.condition.value` is either the string `"all"` or a positive integer.

**Validates: Requirements 3.3, 3.4**

---

### Property 10: Achievement reward validity and category validity

*For any* achievement, `achievement.reward.xp` is a positive integer (type `number`,
`Number.isInteger`, value `> 0`) and `achievement.category` is a key of
`ACHIEVEMENT_CATEGORIES`.

**Validates: Requirements 3.5, 3.7**

---

### Property 11: Mission xpReward is a positive integer

*For any* mission, `mission.xpReward` is of type `number`, passes `Number.isInteger`,
and is greater than `0`.

**Validates: Requirements 4.2**

---

### Property 12: Gold calculation formula consistency

*For any* mission, the value `Math.floor(mission.xpReward * GOLD_PER_MISSION_RATIO)`
equals `Math.floor(mission.xpReward * 0.5)`, confirming `GOLD_PER_MISSION_RATIO` is the
authoritative `0.5` constant.

**Validates: Requirements 4.3**

---

### Property 13: xpForLevel formula correctness

*For any* level `n` in the range `[1, 20]`, `xpForLevel(n)` returns `0` when `n ≤ 1`
and `Math.floor(500 * (n - 1) ** 1.5)` when `n > 1`. This confirms the exported formula
matches the specification and has not been silently replaced with an alternative.

**Validates: Requirements 4.5**

---

### Property 14: Badge required-field and condition-type completeness

*For any* badge in `BADGES`, the fields `id`, `name`, `description`, and `icon` are
non-empty strings, and `badge.condition` is of type `function`.

**Validates: Requirements 5.2, 5.3**

---

### Property 15: Chapter-badge mission ID validity

*For any* badge whose `id` starts with `chapter_`, the corresponding
`CHAPTER_MISSIONS[n]` array contains only mission IDs that exist in the `missions`
catalog.

**Validates: Requirements 5.5**

---

## Testing Strategy

### Unit vs. Integration Scope

All tests in this suite are integration tests in the sense that they import real game data
modules and validate their combined consistency. There is no mocking of data (only the
Vite-specific markdown import is mocked as a test-infrastructure necessity).

### Dual Testing Approach

- **Example-based tests** handle fixed-count assertions, uniqueness invariants, and
  ordered progression checks where the dataset is finite and fully enumerable.
- **Property-based tests** (implemented as `forEach` loops over collections) express
  universal invariants that must hold for every member — structural completeness, valid
  enum membership, type correctness, derived-value consistency.

### Running the Tests

```bash
# Single run (CI)
npm test

# Watch mode (development)
npm run test:watch
```

The test file contains no asynchronous code and no browser APIs, so it runs in the
default Vitest jsdom environment without additional configuration.
