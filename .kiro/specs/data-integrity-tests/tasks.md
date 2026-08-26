# Implementation Plan: Data Integrity Tests

## Overview

Create `src/systems/__tests__/dataIntegrity.test.js` — a comprehensive integration test suite that validates structural integrity and cross-reference consistency across all game data (missions, campaigns, achievements) and the game engine (badges, `CHAPTER_MISSIONS`, `xpForLevel`). The suite is organized into five `describe` blocks mirroring the five requirement areas, using example-based assertions for fixed-count invariants and per-item loops for universal properties.

## Tasks

- [ ] 1. Set up the test file with mock and shared constants
  - [ ] 1.1 Create `src/systems/__tests__/dataIntegrity.test.js` with the `vi.mock` for `hello-soroban.md?raw` and all required imports
    - Register `vi.mock('../../data/missions/hello-soroban.md?raw', ...)` using the same mock content as `missionQuality.test.js` so the import resolves in Vitest
    - Import `missions`, `localizeMission` from `../../data/missions.js`
    - Import `campaigns` from `../../data/campaigns.js`
    - Import `ACHIEVEMENTS`, `ACHIEVEMENT_CATEGORIES` from `../../data/achievements.js`
    - Import `BADGES`, `CHAPTER_MISSIONS`, `xpForLevel`, `GOLD_PER_MISSION_RATIO` from `../gameEngine.js`
    - Define shared constants: `VALID_CHECK_TYPES` (10-element Set), `REQUIRED_MISSION_FIELDS` (9-element array), `REQUIRED_I18N_FIELDS` (4-element array), `VALID_CONDITION_TYPES` (5-element Set)
    - _Requirements: 1.7_

- [ ] 2. Implement Mission Structural Validation tests (`describe("Mission Structural Validation")`)
  - [ ] 2.1 Write example-based tests for fixed mission counts and uniqueness
    - Assert `missions.length === 19`
    - Assert no two missions share the same `id` (Set size check)
    - _Requirements: 1.1, 1.6_

  - [ ]* 2.2 Write property test for Mission required-field completeness (Property 1)
    - **Property 1: Mission required-field completeness**
    - **Validates: Requirements 1.2**
    - Per-mission loop over `REQUIRED_MISSION_FIELDS`; assert each field is present and truthy (strings/arrays) or defined (numbers)

  - [ ]* 2.3 Write property test for Mission i18n completeness (Property 2)
    - **Property 2: Mission i18n completeness**
    - **Validates: Requirements 1.3, 1.4**
    - Per-mission, per-locale (`['en', 'es']`) loop; assert `title`, `story`, `learningGoal` are non-empty strings and `hints` is a non-empty array

  - [ ]* 2.4 Write property test for Mission check type validity (Property 3)
    - **Property 3: Mission check types are valid**
    - **Validates: Requirements 1.5**
    - Per-mission, per-check loop; assert `check.type` is a member of `VALID_CHECK_TYPES` with a descriptive failure message including mission ID and actual type

- [ ] 3. Checkpoint — Ensure Mission Structural Validation tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 4. Implement Campaign Cross-Reference Consistency tests (`describe("Campaign Cross-Reference Consistency")`)
  - [ ] 4.1 Write example-based tests for campaign count, level sequence, and full mission coverage
    - Assert `campaigns.length === 7`
    - Assert `requiredLevel` values of campaigns sorted by `chapterNumber` deeply equal `[1, 3, 5, 7, 9, 12, 14]`
    - Assert every mission ID appears in at least one campaign's `missionIds` (union-set superset check)
    - _Requirements: 2.1, 2.4, 2.7_

  - [ ]* 4.2 Write property test for Campaign missionIds referencing valid missions (Property 4)
    - **Property 4: Campaign missionIds reference valid missions**
    - **Validates: Requirements 2.2**
    - Build a mission ID Set; per-campaign, per-missionId loop; assert each ID exists in the Set

  - [ ]* 4.3 Write property test for every mission chapter having a corresponding campaign (Property 5)
    - **Property 5: Every mission chapter has a corresponding campaign**
    - **Validates: Requirements 2.3**
    - Per-mission loop; assert a campaign with matching `chapterNumber` exists

  - [ ]* 4.4 Write property test for no intra-campaign duplicate missionIds (Property 6)
    - **Property 6: No intra-campaign duplicate missionIds**
    - **Validates: Requirements 2.5**
    - Per-campaign loop; compare `new Set(campaign.missionIds).size === campaign.missionIds.length`

  - [ ]* 4.5 Write property test for campaign i18n completeness (Property 7)
    - **Property 7: Campaign i18n completeness**
    - **Validates: Requirements 2.6**
    - Per-campaign, per-locale (`['en', 'es']`) loop; assert `title` and `description` are non-empty strings

- [ ] 5. Checkpoint — Ensure Campaign Cross-Reference Consistency tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 6. Implement Achievement Validation tests (`describe("Achievement Validation")`)
  - [ ] 6.1 Write example-based tests for fixed achievement count and uniqueness
    - Assert `ACHIEVEMENTS.length === 13`
    - Assert no two achievements share the same `id`
    - _Requirements: 3.1, 3.6_

  - [ ]* 6.2 Write property test for Achievement required-field completeness (Property 8)
    - **Property 8: Achievement required-field completeness**
    - **Validates: Requirements 3.2**
    - Per-achievement loop over `['id', 'name', 'description', 'category', 'condition', 'reward']`; assert each field is present and non-empty

  - [ ]* 6.3 Write property test for Achievement condition validity and reward/category validity (Properties 9 and 10)
    - **Property 9: Achievement condition validity**
    - **Property 10: Achievement reward validity and category validity**
    - **Validates: Requirements 3.3, 3.4, 3.5, 3.7**
    - Per-achievement: assert `condition.type` is in `VALID_CONDITION_TYPES`; assert `condition.value` is either `"all"` or a positive integer; assert `reward.xp` is a positive integer; assert `category` is a key in `ACHIEVEMENT_CATEGORIES`

- [ ] 7. Checkpoint — Ensure Achievement Validation tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 8. Implement XP Economy Validation tests (`describe("XP Economy Validation")`)
  - [ ] 8.1 Write example-based tests for total XP sum and campaign unlock reachability
    - Assert `missions.reduce((s, m) => s + m.xpReward, 0) === 6250`
    - Build per-chapter XP sums; for each campaign sorted by `chapterNumber`, assert `xpForLevel(campaign.requiredLevel) <= cumulativeXPFromPrecedingChapters`
    - _Requirements: 4.1, 4.4_

  - [ ]* 8.2 Write property test for Mission xpReward being a positive integer (Property 11)
    - **Property 11: Mission xpReward is a positive integer**
    - **Validates: Requirements 4.2**
    - Per-mission: assert `typeof xpReward === 'number'`, `Number.isInteger(xpReward)`, and `xpReward > 0`

  - [ ]* 8.3 Write property test for gold calculation formula consistency (Property 12)
    - **Property 12: Gold calculation formula consistency**
    - **Validates: Requirements 4.3**
    - Per-mission: assert `Math.floor(mission.xpReward * GOLD_PER_MISSION_RATIO) === Math.floor(mission.xpReward * 0.5)`

  - [ ]* 8.4 Write property test for xpForLevel formula correctness (Property 13)
    - **Property 13: xpForLevel formula correctness**
    - **Validates: Requirements 4.5**
    - Loop `n` from 1 to 20; assert `xpForLevel(n) === (n <= 1 ? 0 : Math.floor(500 * Math.pow(n - 1, 1.5)))`

- [ ] 9. Checkpoint — Ensure XP Economy Validation tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 10. Implement Badge and CHAPTER_MISSIONS Validation tests (`describe("Badge and CHAPTER_MISSIONS Validation")`)
  - [ ] 10.1 Write example-based tests for badge count, uniqueness, and CHAPTER_MISSIONS coverage
    - Assert `BADGES.length === 15`
    - Assert no two badges share the same `id`
    - Assert `Object.keys(CHAPTER_MISSIONS)` mapped to numbers deeply equals `[1,2,3,4,5,6,7]`
    - Assert the union of all `CHAPTER_MISSIONS` mission ID arrays equals the full set of mission IDs from `missions` (bidirectional Set comparison — no missing, no unknown IDs)
    - _Requirements: 5.1, 5.4, 5.6, 5.7_

  - [ ]* 10.2 Write property test for Badge required-field and condition-type completeness (Property 14)
    - **Property 14: Badge required-field and condition-type completeness**
    - **Validates: Requirements 5.2, 5.3**
    - Per-badge: assert `id`, `name`, `description`, `icon` are non-empty strings; assert `typeof badge.condition === 'function'`

  - [ ]* 10.3 Write property test for chapter-badge mission ID validity (Property 15)
    - **Property 15: Chapter-badge mission ID validity**
    - **Validates: Requirements 5.5**
    - Build mission ID Set; for each badge whose `id` starts with `chapter_`, extract chapter number `n` from the ID, look up `CHAPTER_MISSIONS[n]`, and assert every mission ID in that array exists in the mission Set

- [ ] 11. Final checkpoint — Ensure all tests pass
  - Run the full test suite with `npm test` and confirm all assertions pass with no regressions in existing test files.
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- The `vi.mock` in task 1.1 must appear before any data imports — this is a Vitest hoisting requirement
- Checkpoints ensure incremental validation between the five describe blocks
- Property tests validate universal correctness properties; example-based tests handle fixed-count and ordered-sequence invariants
- All tests are synchronous and import real game data; only the Vite-specific `?raw` markdown import is mocked

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["2.1", "2.2", "2.3", "2.4"] },
    { "id": 2, "tasks": ["4.1", "4.2", "4.3", "4.4", "4.5"] },
    { "id": 3, "tasks": ["6.1", "6.2", "6.3"] },
    { "id": 4, "tasks": ["8.1", "8.2", "8.3", "8.4"] },
    { "id": 5, "tasks": ["10.1", "10.2", "10.3"] }
  ]
}
```
