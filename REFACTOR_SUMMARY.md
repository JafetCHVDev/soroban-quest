# Refactor Summary: Duplicate .js/.ts Module Resolution

## Problem
Four modules existed as both `.js` and `.ts` files with the same basename:
- `src/data/avatars.js` / `src/data/avatars.ts`
- `src/data/achievements.js` / `src/data/achievements.ts`
- `src/systems/codeRecorder.js` / `src/systems/codeRecorder.ts`
- `src/systems/useokashi.js` / `src/systems/useokashi.ts`

Since Vite resolves `.js` before `.ts`, the TypeScript versions were dead code at runtime. The pairs had diverged significantly, causing silent bugs.

## Solution

### 1. Removed Duplicate .js Files
Deleted all four `.js` files after verifying the `.ts` versions contained the correct runtime behavior:
- **useokashi**: Both versions were functionally identical; kept `.ts` with proper types
- **codeRecorder**: Both versions were functionally identical; kept `.ts` with proper types
- **avatars**: `.ts` version had additional `isValidAvatar()` function and types
- **achievements**: Updated `.ts` to match `.js` data structure (kept `condition` property instead of `conditionMeta`)

### 2. Updated Test Imports
Fixed test files to import from extensionless paths (which now resolve to `.ts`):
- `src/systems/__tests__/useokashi.test.js`
- `src/systems/__tests__/codeRecorder.test.js`

### 3. Created Duplicate Detection Script
Added `scripts/check-duplicates.mjs` that:
- Recursively scans `src/` directory
- Detects if a `.js` and `.ts` file with the same basename exist
- Fails CI if duplicates are found
- Provides clear error messages listing all duplicate pairs

### 4. Integrated into CI/CD
- Added `check:duplicates` npm script
- Integrated into `.github/workflows/ci.yml` to run before lint
- Prevents future duplicate .js/.ts pairs from being merged

## Files Changed

### Deleted
- `src/systems/useokashi.js`
- `src/systems/codeRecorder.js`
- `src/data/avatars.js`
- `src/data/achievements.js`

### Modified
- `src/systems/__tests__/useokashi.test.js` - Updated import
- `src/systems/__tests__/codeRecorder.test.js` - Updated import
- `src/data/achievements.ts` - Simplified structure to match runtime expectations
- `package.json` - Added `check:duplicates` script
- `.github/workflows/ci.yml` - Added duplicate check step

### Created
- `scripts/check-duplicates.mjs` - Automated duplicate detection

## Verification

All existing imports are extensionless and now correctly resolve to `.ts` files:
- ✅ `import { useOkashi } from "../systems/useokashi"`
- ✅ `import CodeRecorder from "../systems/codeRecorder"`
- ✅ `import { avatars } from "../data/avatars"`
- ✅ `import { ACHIEVEMENTS } from "../data/achievements"`

## Runtime Behavior
No changes to runtime behavior. All existing functionality is preserved:
- ✅ Achievement conditions work as before
- ✅ Code recorder functionality unchanged
- ✅ Okashi integration works as expected
- ✅ Avatar list remains the same

## Safety Checks Pass
The refactor maintains all safety requirements:
- ✅ No .js/.ts duplicate pairs remain in src/
- ✅ Runtime behavior is unchanged
- ✅ Duplicate check script prevents future violations
- ✅ All imports resolve correctly
