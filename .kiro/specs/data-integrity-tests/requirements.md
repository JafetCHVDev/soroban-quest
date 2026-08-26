# Requirements Document

## Introduction

This feature adds a comprehensive integration test suite (`src/systems/__tests__/dataIntegrity.test.js`) for the **soroban-quest** project. The suite validates the structural integrity of all game data and cross-reference consistency between missions, campaigns, achievements, and the game engine. It acts as a contract-level regression harness that catches breakage introduced by new content or refactoring, complementing the already-existing unit tests (missionQuality.test.js and campaigns.test.js) without duplicating their assertions.

## Glossary

- **DataIntegrityTest**: The new Vitest test file at `src/systems/__tests__/dataIntegrity.test.js`.
- **Mission**: An entry in the `missions` array exported from `src/data/missions.js`. Contains 19 entries across 7 chapters.
- **Campaign**: An entry in the `campaigns` array exported from `src/data/campaigns.js`. Contains 7 entries.
- **Achievement**: An entry in the `ACHIEVEMENTS` array exported from `src/data/achievements.js`. Contains 13 entries.
- **Badge**: An entry in the `BADGES` array exported from `src/systems/gameEngine.js`. Contains 15 entries.
- **CHAPTER_MISSIONS**: The mapping object exported from `src/systems/gameEngine.js` that maps chapter numbers (1–7) to arrays of mission IDs.
- **ValidConditionTypes**: The 5 condition type strings recognised by `achievementEngine.js`: `missions_completed`, `total_xp`, `level`, `first_try_missions`, `streak`.
- **ValidCheckTypes**: The 10 check type strings supported by `codeValidator.js`: `has_function`, `returns_type`, `has_attribute`, `contains_pattern`, `no_pattern`, `uses_type`, `storage_operation`, `has_struct`, `balanced_braces`, `has_import`.
- **GOLD_PER_MISSION_RATIO**: The constant `0.5` exported from `src/systems/gameEngine.js`. Gold earned per mission equals `Math.floor(xpReward * 0.5)`.
- **xpForLevel(n)**: The authoritative level formula exported from `src/systems/gameEngine.js`: `Math.floor(500 * (n-1)^1.5)` for `n > 1`; returns `0` for `n ≤ 1`.
- **CampaignUnlockLevels**: The required levels for the 7 campaigns in ascending order: `[1, 3, 5, 7, 9, 12, 14]`.
- **TotalExpectedXP**: The sum of all 19 mission `xpReward` values, equal to `6250`.

---

## Requirements

### Requirement 1: Mission Structural Validation

**User Story:** As a content author, I want automated validation of every mission's required fields, so that incomplete or malformed missions are caught before they reach players.

#### Acceptance Criteria

1. THE DataIntegrityTest SHALL verify that exactly 19 Missions are present in the `missions` array.
2. WHEN a Mission is examined, THE DataIntegrityTest SHALL verify that the fields `id`, `chapter`, `order`, `difficulty`, `xpReward`, `template`, `solution`, `checks`, and `conceptsIntroduced` are present and non-empty on every Mission.
3. WHEN a Mission is examined, THE DataIntegrityTest SHALL verify that `mission.i18n.en` contains non-empty `title`, `story`, `learningGoal`, and `hints` fields.
4. WHEN a Mission is examined, THE DataIntegrityTest SHALL verify that `mission.i18n.es` contains non-empty `title`, `story`, `learningGoal`, and `hints` fields.
5. WHEN a Mission check object is examined, THE DataIntegrityTest SHALL verify that the `type` field of every check object belongs to ValidCheckTypes.
6. THE DataIntegrityTest SHALL verify that no two Missions share the same `id` value.
7. WHEN the `hello-soroban.md?raw` raw-markdown import is used, THE DataIntegrityTest SHALL mock it with the same pattern used in `missionQuality.test.js` so that the import resolves without error.

---

### Requirement 2: Campaign Cross-Reference Consistency

**User Story:** As a content author, I want automated cross-reference checks between campaigns and missions, so that broken mission references or missing chapter coverage are caught immediately.

#### Acceptance Criteria

1. THE DataIntegrityTest SHALL verify that exactly 7 Campaigns are present in the `campaigns` array.
2. WHEN a Campaign is examined, THE DataIntegrityTest SHALL verify that every mission ID in `campaign.missionIds` corresponds to a Mission that exists in the `missions` array.
3. WHEN a Mission is examined, THE DataIntegrityTest SHALL verify that a Campaign whose `chapterNumber` matches `mission.chapter` exists in the `campaigns` array (i.e., every chapter used by a Mission has a corresponding Campaign).
4. THE DataIntegrityTest SHALL verify that the `requiredLevel` values of the 7 Campaigns, when sorted by `chapterNumber`, exactly equal `[1, 3, 5, 7, 9, 12, 14]`.
5. WHEN a Campaign is examined, THE DataIntegrityTest SHALL verify that no mission ID appears more than once within a single Campaign's `missionIds` array.
6. WHEN a Campaign is examined, THE DataIntegrityTest SHALL verify that `campaign.i18n.en` and `campaign.i18n.es` each contain non-empty `title` and `description` fields.
7. THE DataIntegrityTest SHALL verify that the union of all `missionIds` across all Campaigns covers every Mission ID in the `missions` array (no mission is orphaned from all campaigns).

---

### Requirement 3: Achievement Validation

**User Story:** As a content author, I want automated validation of every achievement's required fields and condition types, so that achievements with unsupported logic do not appear silently broken at runtime.

#### Acceptance Criteria

1. THE DataIntegrityTest SHALL verify that exactly 13 Achievements are present in the `ACHIEVEMENTS` array.
2. WHEN an Achievement is examined, THE DataIntegrityTest SHALL verify that the fields `id`, `name`, `description`, `category`, `condition`, and `reward` are present and non-empty.
3. WHEN an Achievement's condition is examined, THE DataIntegrityTest SHALL verify that `condition.type` belongs to ValidConditionTypes.
4. WHEN an Achievement's condition is examined, THE DataIntegrityTest SHALL verify that `condition.value` is defined and is either a positive integer or the string `"all"`.
5. WHEN an Achievement's reward is examined, THE DataIntegrityTest SHALL verify that `reward.xp` is a positive integer.
6. THE DataIntegrityTest SHALL verify that no two Achievements share the same `id` value.
7. THE DataIntegrityTest SHALL verify that each Achievement's `category` belongs to the set of valid categories defined in `ACHIEVEMENT_CATEGORIES` from `achievements.js`.

---

### Requirement 4: XP Economy Validation

**User Story:** As a game designer, I want automated XP economy checks so that cumulative reward totals and gold calculations remain consistent with the authoritative game engine formula.

#### Acceptance Criteria

1. THE DataIntegrityTest SHALL verify that the sum of all 19 Mission `xpReward` values equals `TotalExpectedXP` (6250).
2. WHEN a Mission is examined, THE DataIntegrityTest SHALL verify that `xpReward` is a positive integer (greater than 0, of type number, with no fractional part).
3. WHEN a Mission is examined, THE DataIntegrityTest SHALL verify that the gold reward for that Mission, calculated as `Math.floor(mission.xpReward * GOLD_PER_MISSION_RATIO)`, equals `Math.floor(mission.xpReward * 0.5)`.
4. WHEN a CampaignUnlockLevel is examined, THE DataIntegrityTest SHALL verify that the cumulative XP obtainable from all missions up to and including the chapter immediately preceding that campaign is sufficient to reach the required level according to `xpForLevel(n)`.
5. THE DataIntegrityTest SHALL verify that `xpForLevel` is the authoritative formula (i.e., it returns `0` for `n ≤ 1` and `Math.floor(500 * (n-1)^1.5)` for `n > 1`), confirming alignment with the engine, not any alternative formula such as `xp/300 + 1`.

---

### Requirement 5: Badge and CHAPTER_MISSIONS Validation

**User Story:** As a game designer, I want automated validation of badge definitions and the CHAPTER_MISSIONS mapping, so that badge condition functions and chapter mission lists stay in sync with the mission catalog.

#### Acceptance Criteria

1. THE DataIntegrityTest SHALL verify that exactly 15 Badges are present in the `BADGES` array.
2. WHEN a Badge is examined, THE DataIntegrityTest SHALL verify that the fields `id`, `name`, `description`, `icon`, and `condition` are all present and non-empty.
3. WHEN a Badge is examined, THE DataIntegrityTest SHALL verify that `badge.condition` is a JavaScript function.
4. THE DataIntegrityTest SHALL verify that no two Badges share the same `id` value.
5. WHEN a chapter-specific Badge (one whose `id` starts with `chapter_`) is examined, THE DataIntegrityTest SHALL verify that every mission ID in the corresponding `CHAPTER_MISSIONS[n]` entry exists in the `missions` array.
6. THE DataIntegrityTest SHALL verify that `CHAPTER_MISSIONS` contains exactly 7 chapter entries, keyed `1` through `7`.
7. WHEN `CHAPTER_MISSIONS` is examined, THE DataIntegrityTest SHALL verify that the union of all its mission ID arrays equals the full set of Mission IDs from the `missions` array (no mission is missing from the engine's chapter map, and no unknown mission ID appears).
