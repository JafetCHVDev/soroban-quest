# Soroban Quest — Future Improvements

This document catalogs potential improvements, organized by priority and impact.

---

## ✅ Completed

### SkillTree — Add chapter 4-6 concepts

Done: Added 3 new categories (Events, Protocols, DeFi) and all concepts from chapters 4-6.

### Shop disconnected from game logic

Done: Implemented gold currency (`awardGold`, `spendGold`), gold balance display in Navbar, shop wired to spend gold, purchase ownership tracking.

### Dual-Currency System

Done: Gold earned at 50% of XP per mission completion. Shop purchases spend gold.

### CTF & Security Quests

Done: Added 2 security missions (Chapter 7): reentrancy guard and access control fix. Both use template/vulnerability/solution pattern with `contains_pattern` checks.

### Per-Chapter Badges

Done: 7 badges (chapters 1–7) with themed names/icons, locale entries (en/es), and conditions checking all missions in each chapter.

### Update CONTRIBUTING.md

Done: Updated with 19 missions, complete component list, i18n mission format, full check type reference, dev commands, PR guidelines.

### Update TODO.md

Done: Updated mission count (19), test count (133), chapter gates (1–14), added completed items (Shop, Achievements, Leaderboard).

### Bundle size optimization

Done: Split react-markdown + 16 sub-dependencies into `vendor-markdown` chunk. Main bundle: 602 kB → 475 kB. Chunk size warning resolved.

### Victory animations

Done: CSS confetti particle effect on mission completion modal. Shows XP + Gold earned with glow effects.

### Onboarding tutorial

Done: 5-step first-visit overlay with step indicators, navigation buttons, skip option. Persists dismissal to localStorage.

### Home dashboard improvements

Done: Added stats section (missions completed, XP, Gold, badges), quick stats card, recent activity feed, next mission suggestion card.

---

## 🎯 High Impact

### Leaderboard is local-only

The Leaderboard page compares profiles stored in localStorage. A global leaderboard would require a backend, but local improvements could include:
- Per-category rankings (XP, missions completed, speed)
- Achievement showcase per profile
- Exportable leaderboard snapshot

### Quest browsing like NodeGuardians

Add a dedicated `/quests` route with a filterable grid/table:
- Filter by difficulty, chapter, completion status, search by name
- Show XP + Gold rewards on each card
- "Standalone" quest type vs campaign quests
- Quick-start button directly from quest card

### Sound effects

Subtle audio feedback for key actions (toggleable):
- Mission complete fanfare
- Level up chime
- Badge earned sound
- Button clicks

---

## 🧱 Technical Debt

### Test noise in stderr

Tests for `achievementEngine` and `codeRecorder` print `stderr` messages from mock storage errors. These don't affect pass/fail but create noise in CI output.

### Missing integration tests

No tests verify:
- All 19 missions have valid structure (required fields, valid checks)
- Campaign missionIds reference real mission IDs
- Chapter unlock levels are consistent
- XP rewards sum to expected total

---

## 🚀 New Features

### Inventory & Items

- Unlockable digital equipment affecting player stats
- XP boost multipliers
- Streak freeze protection
- Cosmetic items (avatar frames, themes)

### Theory Quests

Non-coding quests that test blockchain knowledge through multiple-choice or fill-in-the-blank questions (like NodeGuardians theory quests).

### Gas Optimization Challenges

Present code with inefficient patterns; students must optimize for gas without changing behavior.

### Real Soroban Compilation (WASM)

Integrate the Soroban Rust compiler via WebAssembly for real compilation verification instead of the AST pattern matcher.

---

## 🎨 UX/UI

- **Keyboard shortcuts cheat sheet** — Accessible overlay showing all shortcuts
- **Mobile optimization** — Test and refine layout on small viewports
- **More themes** — Additional Monaco editor themes beyond the default

---

## 🌐 Internationalization

- French (fr)
- Japanese (ja)
- Korean (ko)
- Portuguese (pt)
- Chinese Simplified (zh-CN)

Each requires translating mission stories (19 missions × 7 chapters of lore), UI strings, and achievement descriptions.

---

## 🧪 Testing

- Add Vitest tests for `missionLoader.js`
- Add Vitest tests for `campaigns.js` (getCampaignProgress, localizeCampaign)
- Add Vitest tests for new missions structure/validity
- Add E2E tests for the full mission flow (Playwright)
- Visual regression tests for all pages at common viewports

---

## 📚 Documentation

- Record video walkthrough showing platform features
- Create in-app documentation panel for Soroban concepts
- Document the validation check API for mission authors
- Add JSDoc comments to all public systems APIs
