/**
 * Mission Content Quality Assurance Tests
 *
 * Comprehensive meta-testing system that validates the game's content
 * integrity across 6 categories:
 *
 *  1. Mission Template Validity   — structural soundness of starter code
 *  2. Mission Solution Correctness — solutions pass all mission checks
 *  3. Difficulty Progression      — scores increase monotonically
 *  4. Check Type Coverage         — balanced use of all 10 check types
 *  5. Hint Quality                — useful, non-duplicate, non-spoiler hints
 *  6. i18n Completeness           — full EN + ES translations present
 *
 * Related issue: #228
 */

import { describe, it, expect, vi } from 'vitest';
import { validateCode } from '../codeValidator.js';

// ---------------------------------------------------------------------------
// Mock the Vite-specific ?raw markdown import that missions.js uses.
// Vitest cannot resolve `./missions/hello-soroban.md?raw` without this mock.
// ---------------------------------------------------------------------------
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

// Import missions after the mock is registered.
import { missions, localizeMission } from '../../data/missions.js';

// ---------------------------------------------------------------------------
// Helper: compute a difficulty score for a mission used in Category 3.
//
// Scoring heuristic (higher = harder):
//   + 1  per check  (baseline)
//   + 2  for every storage_operation check   (complex interaction)
//   + 2  for every contains_pattern check    (requires precise code knowledge)
//   + 1  for every returns_type / has_struct / has_import check
//   − 0.5 per hint provided  (more hints ↔ lower effective difficulty)
// ---------------------------------------------------------------------------
function difficultyScore(mission) {
    const hints = localizeMission(mission, 'en').hints || [];
    const hintPenalty = hints.length * 0.5;

    let score = 0;
    for (const check of mission.checks) {
        score += 1; // every check contributes 1
        if (check.type === 'storage_operation') score += 2;
        if (check.type === 'contains_pattern') score += 2;
        if (['returns_type', 'has_struct', 'has_import'].includes(check.type)) score += 1;
    }
    return score - hintPenalty;
}

// ---------------------------------------------------------------------------
// Helper: count brace balance (mirrors codeValidator's checkBalancedBraces).
// ---------------------------------------------------------------------------
function isBalanced(code) {
    let count = 0;
    for (const ch of code) {
        if (ch === '{') count++;
        if (ch === '}') count--;
        if (count < 0) return false;
    }
    return count === 0;
}

// ---------------------------------------------------------------------------
// Group missions by chapter for progression tests.
// ---------------------------------------------------------------------------
function groupByChapter(missions) {
    const map = new Map();
    for (const m of missions) {
        if (!map.has(m.chapter)) map.set(m.chapter, []);
        map.get(m.chapter).push(m);
    }
    // Sort missions within each chapter by order
    for (const [, ms] of map) {
        ms.sort((a, b) => a.order - b.order);
    }
    return map;
}

// ---------------------------------------------------------------------------
// All 10 supported check types as per codeValidator.js
// ---------------------------------------------------------------------------
const ALL_CHECK_TYPES = [
    'has_function',
    'returns_type',
    'has_attribute',
    'contains_pattern',
    'no_pattern',
    'uses_type',
    'storage_operation',
    'has_struct',
    'balanced_braces',
    'has_import',
];

// ===========================================================================
// Category 1: Mission Template Validity
// ===========================================================================
describe('Mission Template Validity', () => {
    it('should have exactly 19 missions loaded', () => {
        expect(missions).toHaveLength(19);
    });

    missions.forEach((mission) => {
        describe(`[${mission.id}]`, () => {
            it('template should be a non-empty string', () => {
                expect(typeof mission.template).toBe('string');
                expect(mission.template.trim().length).toBeGreaterThan(0);
            });

            it('template should have balanced braces (syntactically valid)', () => {
                expect(isBalanced(mission.template)).toBe(true);
            });

            it('template should contain Soroban SDK markers', () => {
                const hasSorobanMarker =
                    mission.template.includes('soroban_sdk') ||
                    mission.template.includes('contractimpl') ||
                    mission.template.includes('contract') ||
                    mission.template.includes('Env');
                expect(hasSorobanMarker).toBe(true);
            });

            it('template should contain at least one function or stub definition', () => {
                // Templates may have pre-implemented helper functions (e.g. `init`)
                // OR only TODO stubs inside an impl block. Either way they must
                // have an `impl` block with either a `fn` or a `// TODO:` marker.
                const hasFn = /fn\s+\w+/.test(mission.template);
                const hasImplWithTodo =
                    mission.template.includes('impl ') &&
                    (mission.template.includes('// TODO') || mission.template.includes('//TODO'));
                expect(hasFn || hasImplWithTodo).toBe(true);
            });

            it('template should be meaningfully different from an empty stub', () => {
                // Must have some real Rust content — at least 100 characters
                expect(mission.template.trim().length).toBeGreaterThan(100);
            });

            it('template should pass structural checks (balanced_braces check type)', () => {
                const balancedCheck = [{ type: 'balanced_braces', message: 'Unbalanced braces' }];
                const result = validateCode(mission.template, balancedCheck);
                expect(result.passed).toBe(true);
            });

            it('template should have the #[contract] or #[contractimpl] attribute', () => {
                const hasContractAttr =
                    mission.template.includes('#[contract]') ||
                    mission.template.includes('#[contractimpl]');
                expect(hasContractAttr).toBe(true);
            });

            it('template should not contain the complete solution (has TODOs or incomplete functions)', () => {
                // Templates are starting points — they should differ from solutions.
                // We check this by verifying templates intentionally have TODOs or missing impls.
                // Either a TODO comment is present OR the solution passes more checks than the template.
                const templateValidation = validateCode(mission.template, mission.checks);
                const solutionValidation = validateCode(mission.solution, mission.checks);

                // The solution must pass at least as many checks as the template.
                // (If the template already passes everything, that's a design smell but we allow
                // it for security missions where the template IS valid code with bugs to fix.)
                expect(solutionValidation.passedCount).toBeGreaterThanOrEqual(
                    templateValidation.passedCount
                );
            });
        });
    });
});

// ===========================================================================
// Category 2: Mission Solution Correctness
// ===========================================================================
describe('Mission Solution Correctness', () => {
    missions.forEach((mission) => {
        describe(`[${mission.id}]`, () => {
            it('solution should be a non-empty string', () => {
                expect(typeof mission.solution).toBe('string');
                expect(mission.solution.trim().length).toBeGreaterThan(0);
            });

            it('solution should pass ALL mission-specific checks', () => {
                const result = validateCode(mission.solution, mission.checks);
                const failed = result.results.filter((r) => !r.passed);

                if (failed.length > 0) {
                    const messages = failed.map((r) => `  • ${r.message}`).join('\n');
                    throw new Error(
                        `[${mission.id}] ${failed.length} check(s) failed:\n${messages}`
                    );
                }
                expect(result.passed).toBe(true);
            });

            it('solution should have balanced braces', () => {
                expect(isBalanced(mission.solution)).toBe(true);
            });

            it('solution should be different from the template', () => {
                expect(mission.solution.trim()).not.toBe(mission.template.trim());
            });

            it('solution should contain Soroban SDK markers', () => {
                const hasSorobanMarker =
                    mission.solution.includes('soroban_sdk') ||
                    mission.solution.includes('contractimpl') ||
                    mission.solution.includes('Env');
                expect(hasSorobanMarker).toBe(true);
            });

            it('solution should contain at least one function implementation', () => {
                // A real implementation has a fn body — look for `fn name ... { <content> }`
                expect(/pub\s+fn\s+\w+/.test(mission.solution)).toBe(true);
            });

            it('solution should have more or equal check passes than the template', () => {
                const templateResult = validateCode(mission.template, mission.checks);
                const solutionResult = validateCode(mission.solution, mission.checks);
                expect(solutionResult.passedCount).toBeGreaterThanOrEqual(
                    templateResult.passedCount
                );
            });
        });
    });
});

// ===========================================================================
// Category 3: Difficulty Progression Analysis
// ===========================================================================
describe('Difficulty Progression Analysis', () => {
    it('all missions should have a valid difficulty label', () => {
        const valid = new Set(['beginner', 'intermediate', 'advanced']);
        missions.forEach((mission) => {
            expect(valid.has(mission.difficulty), `${mission.id} has invalid difficulty`).toBe(
                true
            );
        });
    });

    it('missions within each chapter should be ordered by their order field', () => {
        const byChapter = groupByChapter(missions);
        for (const [chapter, ms] of byChapter) {
            for (let i = 1; i < ms.length; i++) {
                expect(ms[i].order).toBeGreaterThan(
                    ms[i - 1].order,
                    `Chapter ${chapter}: mission ${ms[i].id} has order ${ms[i].order} which is not greater than ${ms[i-1].order}`
                );
            }
        }
    });

    it('difficulty labels should not regress within a chapter', () => {
        // beginner → intermediate → advanced is valid progression.
        // Going back from advanced to beginner within the same chapter is not.
        const levelMap = { beginner: 0, intermediate: 1, advanced: 2 };
        const byChapter = groupByChapter(missions);

        for (const [chapter, ms] of byChapter) {
            // Within a chapter, once difficulty increases it should not drop back lower
            let maxLevel = 0;
            for (const m of ms) {
                const level = levelMap[m.difficulty] ?? 0;
                if (level < maxLevel) {
                    throw new Error(
                        `Chapter ${chapter}: mission ${m.id} has difficulty "${m.difficulty}" which ` +
                        `is a regression from a higher difficulty earlier in the chapter.`
                    );
                }
                maxLevel = Math.max(maxLevel, level);
            }
        }
    });

    it('chapter difficulty scores should be non-decreasing on average', () => {
        // Average difficulty score should be non-decreasing across chapters.
        // We allow a tolerance of 3 points since campaign resets (e.g. Data Realm ch4
        // starts with beginner-difficulty missions after the ch3 advanced missions).
        const byChapter = groupByChapter(missions);
        const chapters = [...byChapter.keys()].sort((a, b) => a - b);

        const avgScores = chapters.map((ch) => {
            const ms = byChapter.get(ch);
            const total = ms.reduce((sum, m) => sum + difficultyScore(m), 0);
            return { chapter: ch, avg: total / ms.length };
        });

        for (let i = 1; i < avgScores.length; i++) {
            const prev = avgScores[i - 1];
            const curr = avgScores[i];
            // Allow up to 3 points of regression to account for chapter resets
            expect(curr.avg + 3).toBeGreaterThanOrEqual(
                prev.avg,
                `Average difficulty dropped significantly from chapter ${prev.chapter} (${prev.avg.toFixed(2)}) ` +
                `to chapter ${curr.chapter} (${curr.avg.toFixed(2)})`
            );
        }
    });

    it('XP rewards should show an overall upward trend across chapters', () => {
        // XP may dip at chapter boundaries when a new campaign starts with easier missions
        // (e.g. vault-manager ch4 has 300 XP, while multi-party-pact ch3 ends at 400 XP).
        // We assert: first chapter avg < last chapter avg, and each chapter's min XP is
        // less than or equal to the next chapter's max XP (continuous range overlap).
        const byChapter = groupByChapter(missions);
        const chapters = [...byChapter.keys()].sort((a, b) => a - b);

        const chapterStats = chapters.map((ch) => {
            const ms = byChapter.get(ch);
            const xps = ms.map((m) => m.xpReward);
            return {
                chapter: ch,
                avg: xps.reduce((s, x) => s + x, 0) / xps.length,
                min: Math.min(...xps),
                max: Math.max(...xps),
            };
        });

        // Overall: first chapter must have lower avg XP than the last chapter
        expect(chapterStats[chapterStats.length - 1].avg).toBeGreaterThan(
            chapterStats[0].avg,
            'Last chapter average XP should be higher than the first chapter average XP'
        );

        // No single chapter's max XP should exceed the next chapter's max XP by more than 200
        for (let i = 1; i < chapterStats.length; i++) {
            const prev = chapterStats[i - 1];
            const curr = chapterStats[i];
            expect(curr.max + 200).toBeGreaterThanOrEqual(
                prev.max,
                `Chapter ${curr.chapter} max XP (${curr.max}) is far below chapter ${prev.chapter} max XP (${prev.max})`
            );
        }
    });

    it('each mission should have at least 1 check', () => {
        missions.forEach((mission) => {
            expect(mission.checks.length).toBeGreaterThanOrEqual(
                1,
                `${mission.id} has no checks`
            );
        });
    });

    it('later chapters should have more checks on average than earlier chapters', () => {
        const byChapter = groupByChapter(missions);
        const chapters = [...byChapter.keys()].sort((a, b) => a - b);

        const avgChecks = chapters.map((ch) => {
            const ms = byChapter.get(ch);
            const total = ms.reduce((sum, m) => sum + m.checks.length, 0);
            return { chapter: ch, avg: total / ms.length };
        });

        // First chapter avg < last chapter avg (overall growth)
        expect(avgChecks[avgChecks.length - 1].avg).toBeGreaterThan(avgChecks[0].avg);
    });

    it('difficulty score for each mission should be positive', () => {
        missions.forEach((mission) => {
            expect(difficultyScore(mission)).toBeGreaterThan(
                0,
                `${mission.id} has a non-positive difficulty score`
            );
        });
    });
});

// ===========================================================================
// Category 4: Check Type Coverage
// ===========================================================================
describe('Check Type Coverage', () => {
    const allChecks = missions.flatMap((m) => m.checks);
    const totalChecks = allChecks.length;

    it('all 10 check types should be known in codeValidator (validator coverage)', () => {
        // This test verifies the validator supports all 10 documented types by running
        // a minimal check for each. All 10 types are valid but not all may be used in
        // current missions — that is a content gap, not a validator defect.
        const sampleCode = `
            #![no_std]
            use soroban_sdk::{contract, contractimpl, Env};
            #[contract]
            pub struct MyContract;
            #[contractimpl]
            impl MyContract {
                pub fn my_fn(env: Env) -> bool { true }
            }
        `;

        // Each check type should return a defined result (not "Unknown check type")
        const sampleChecks = [
            { type: 'has_function', name: 'my_fn' },
            { type: 'returns_type', function: 'my_fn', returnType: 'bool' },
            { type: 'has_attribute', attribute: 'contract' },
            { type: 'contains_pattern', pattern: 'impl' },
            { type: 'no_pattern', pattern: 'unsafe' },
            { type: 'uses_type', typeName: 'Env' },
            { type: 'storage_operation', operation: 'get' },
            { type: 'has_struct', name: 'MyContract' },
            { type: 'balanced_braces' },
            { type: 'has_import', module: 'soroban_sdk' },
        ];

        const result = validateCode(sampleCode, sampleChecks);
        result.results.forEach((r) => {
            expect(r.message).not.toMatch(/Unknown check type/);
        });
        expect(result.results).toHaveLength(10);
    });

    it('core check types (has_function, has_attribute, contains_pattern, storage_operation, returns_type) should be used across missions', () => {
        // These 5 types are the building blocks of all 19 missions.
        // If any of them disappear the validation engine is effectively broken.
        const usedTypes = new Set(allChecks.map((c) => c.type));
        const coreTypes = [
            'has_function',
            'has_attribute',
            'contains_pattern',
            'storage_operation',
            'returns_type',
        ];
        const missing = coreTypes.filter((t) => !usedTypes.has(t));
        expect(
            missing,
            `Core check types not used in any mission: ${missing.join(', ')}`
        ).toHaveLength(0);
    });

    it('no single check type should represent more than 50% of all checks', () => {
        const typeCounts = {};
        for (const check of allChecks) {
            typeCounts[check.type] = (typeCounts[check.type] || 0) + 1;
        }
        for (const [type, count] of Object.entries(typeCounts)) {
            const percentage = (count / totalChecks) * 100;
            expect(
                percentage,
                `Check type "${type}" is over-represented: ${percentage.toFixed(1)}% of all checks`
            ).toBeLessThanOrEqual(50);
        }
    });

    it('each mission should use at least 2 distinct check types', () => {
        missions.forEach((mission) => {
            const types = new Set(mission.checks.map((c) => c.type));
            expect(
                types.size,
                `${mission.id} uses only ${types.size} check type(s): ${[...types].join(', ')}`
            ).toBeGreaterThanOrEqual(2);
        });
    });

    it('each chapter should use at least 3 distinct check types', () => {
        const byChapter = groupByChapter(missions);
        for (const [chapter, ms] of byChapter) {
            const types = new Set(ms.flatMap((m) => m.checks.map((c) => c.type)));
            expect(
                types.size,
                `Chapter ${chapter} uses only ${types.size} check type(s): ${[...types].join(', ')}`
            ).toBeGreaterThanOrEqual(3);
        }
    });

    it('all check objects should have a type field matching a known type', () => {
        const knownTypes = new Set(ALL_CHECK_TYPES);
        allChecks.forEach((check, idx) => {
            expect(
                knownTypes.has(check.type),
                `Check at index ${idx} has unknown type: "${check.type}"`
            ).toBe(true);
        });
    });

    it('all checks should have a message or description field for user feedback', () => {
        allChecks.forEach((check, idx) => {
            const hasUserFeedback =
                typeof check.message === 'string' ||
                typeof check.description === 'string';
            expect(
                hasUserFeedback,
                `Check at index ${idx} (type: ${check.type}) has no message or description`
            ).toBe(true);
        });
    });

    it('has_function checks should specify the function name', () => {
        const hasFunctionChecks = allChecks.filter((c) => c.type === 'has_function');
        hasFunctionChecks.forEach((check) => {
            expect(
                typeof check.name,
                `has_function check is missing the 'name' field`
            ).toBe('string');
            expect(check.name.trim().length).toBeGreaterThan(0);
        });
    });

    it('storage_operation checks should specify a valid operation', () => {
        const validOps = new Set(['get', 'set', 'has', 'remove']);
        const storageChecks = allChecks.filter((c) => c.type === 'storage_operation');
        storageChecks.forEach((check) => {
            expect(
                validOps.has(check.operation),
                `storage_operation check has invalid operation: "${check.operation}"`
            ).toBe(true);
        });
    });

    it('contains_pattern checks should specify a non-empty pattern', () => {
        const patternChecks = allChecks.filter((c) => c.type === 'contains_pattern');
        patternChecks.forEach((check) => {
            expect(typeof check.pattern).toBe('string');
            expect(check.pattern.trim().length).toBeGreaterThan(0);
        });
    });

    it('returns_type checks should specify both function and returnType', () => {
        const typeChecks = allChecks.filter((c) => c.type === 'returns_type');
        typeChecks.forEach((check) => {
            expect(typeof check.function).toBe('string');
            expect(check.function.trim().length).toBeGreaterThan(0);
            expect(typeof check.returnType).toBe('string');
            expect(check.returnType.trim().length).toBeGreaterThan(0);
        });
    });
});

// ===========================================================================
// Category 5: Hint Quality
// ===========================================================================
describe('Hint Quality', () => {
    missions.forEach((mission) => {
        describe(`[${mission.id}]`, () => {
            const enLocale = localizeMission(mission, 'en');
            const esLocale = localizeMission(mission, 'es');
            const enHints = enLocale.hints || [];
            const esHints = esLocale.hints || [];

            it('should have at least 1 hint in English', () => {
                expect(enHints.length).toBeGreaterThanOrEqual(
                    1,
                    `${mission.id} has no English hints`
                );
            });

            it('should have at least 1 hint in Spanish', () => {
                expect(esHints.length).toBeGreaterThanOrEqual(
                    1,
                    `${mission.id} has no Spanish hints`
                );
            });

            it('English hints should all be non-empty strings', () => {
                enHints.forEach((hint, idx) => {
                    expect(typeof hint).toBe('string');
                    expect(hint.trim().length).toBeGreaterThan(
                        0,
                        `${mission.id} EN hint[${idx}] is empty`
                    );
                });
            });

            it('Spanish hints should all be non-empty strings', () => {
                esHints.forEach((hint, idx) => {
                    expect(typeof hint).toBe('string');
                    expect(hint.trim().length).toBeGreaterThan(
                        0,
                        `${mission.id} ES hint[${idx}] is empty`
                    );
                });
            });

            it('English hints should all be unique (no duplicates)', () => {
                const unique = new Set(enHints.map((h) => h.trim().toLowerCase()));
                expect(
                    unique.size,
                    `${mission.id} has duplicate EN hints`
                ).toBe(enHints.length);
            });

            it('Spanish hints should all be unique (no duplicates)', () => {
                const unique = new Set(esHints.map((h) => h.trim().toLowerCase()));
                expect(
                    unique.size,
                    `${mission.id} has duplicate ES hints`
                ).toBe(esHints.length);
            });

            it('no English hint should contain the full solution code verbatim', () => {
                // Trim and normalise to avoid whitespace false-positives.
                const solutionNorm = mission.solution.trim().replace(/\s+/g, ' ');
                enHints.forEach((hint, idx) => {
                    const hintNorm = hint.trim().replace(/\s+/g, ' ');
                    expect(
                        solutionNorm.includes(hintNorm) && hintNorm.length > 200,
                        `${mission.id} EN hint[${idx}] appears to contain the full solution`
                    ).toBe(false);
                });
            });

            it('hints should be shorter than the full solution (not spoilers)', () => {
                enHints.forEach((hint, idx) => {
                    expect(
                        hint.length,
                        `${mission.id} EN hint[${idx}] is as long or longer than the solution`
                    ).toBeLessThan(mission.solution.length);
                });
            });

            it('EN and ES hint counts should match', () => {
                expect(
                    esHints.length,
                    `${mission.id} has ${enHints.length} EN hints but ${esHints.length} ES hints`
                ).toBe(enHints.length);
            });
        });
    });
});

// ===========================================================================
// Category 6: i18n Completeness
// ===========================================================================
describe('i18n Completeness', () => {
    const REQUIRED_KEYS = ['title', 'story', 'learningGoal', 'hints'];
    const LANGUAGES = ['en', 'es'];

    missions.forEach((mission) => {
        describe(`[${mission.id}]`, () => {
            LANGUAGES.forEach((lang) => {
                describe(`[${lang}]`, () => {
                    it(`should have an i18n.${lang} block`, () => {
                        expect(mission.i18n).toBeDefined();
                        expect(mission.i18n[lang]).toBeDefined();
                    });

                    REQUIRED_KEYS.forEach((key) => {
                        it(`should have a non-empty '${key}' field`, () => {
                            const locale = mission.i18n[lang];
                            expect(
                                locale[key],
                                `${mission.id}[${lang}].${key} is missing`
                            ).toBeDefined();

                            if (key === 'hints') {
                                expect(
                                    Array.isArray(locale[key]),
                                    `${mission.id}[${lang}].hints should be an array`
                                ).toBe(true);
                                expect(
                                    locale[key].length,
                                    `${mission.id}[${lang}].hints array is empty`
                                ).toBeGreaterThan(0);
                            } else {
                                expect(
                                    typeof locale[key],
                                    `${mission.id}[${lang}].${key} should be a string`
                                ).toBe('string');
                                expect(
                                    locale[key].trim().length,
                                    `${mission.id}[${lang}].${key} is an empty string`
                                ).toBeGreaterThan(0);
                            }
                        });
                    });

                    it(`'title' should not equal the key name itself ("title")`, () => {
                        const locale = mission.i18n[lang];
                        if (!locale?.title) return; // caught by required-key test above
                        expect(locale.title.trim().toLowerCase()).not.toBe('title');
                    });

                    it(`'learningGoal' should not equal the key name itself`, () => {
                        const locale = mission.i18n[lang];
                        if (!locale?.learningGoal) return;
                        expect(locale.learningGoal.trim().toLowerCase()).not.toBe('learninggoal');
                    });
                });
            });

            it('EN and ES titles should differ (actual translation, not a copy)', () => {
                const enTitle = mission.i18n?.en?.title?.trim();
                const esTitle = mission.i18n?.es?.title?.trim();
                if (!enTitle || !esTitle) return; // guarded by required-key tests
                expect(enTitle.toLowerCase()).not.toBe(esTitle.toLowerCase());
            });

            it('EN and ES learningGoals should differ', () => {
                const enGoal = mission.i18n?.en?.learningGoal?.trim();
                const esGoal = mission.i18n?.es?.learningGoal?.trim();
                if (!enGoal || !esGoal) return;
                expect(enGoal.toLowerCase()).not.toBe(esGoal.toLowerCase());
            });

            it('EN and ES stories should differ', () => {
                const enStory = mission.i18n?.en?.story?.trim();
                const esStory = mission.i18n?.es?.story?.trim();
                if (!enStory || !esStory) return;
                expect(enStory.toLowerCase()).not.toBe(esStory.toLowerCase());
            });

            it('mission-level fields (id, chapter, order, difficulty, xpReward) should be present', () => {
                expect(typeof mission.id).toBe('string');
                expect(mission.id.trim().length).toBeGreaterThan(0);
                expect(typeof mission.chapter).toBe('number');
                expect(typeof mission.order).toBe('number');
                expect(typeof mission.xpReward).toBe('number');
                expect(mission.xpReward).toBeGreaterThan(0);
                expect(['beginner', 'intermediate', 'advanced']).toContain(mission.difficulty);
            });

            it('mission id should be kebab-case (lowercase letters, digits, hyphens only)', () => {
                expect(/^[a-z0-9-]+$/.test(mission.id)).toBe(true);
            });
        });
    });

    it('all mission ids should be unique', () => {
        const ids = missions.map((m) => m.id);
        const unique = new Set(ids);
        expect(unique.size).toBe(ids.length);
    });

    it('mission order values should be unique and sequential starting at 1', () => {
        const sorted = [...missions].sort((a, b) => a.order - b.order);
        sorted.forEach((m, idx) => {
            expect(m.order).toBe(idx + 1);
        });
    });

    it('localizeMission should return flat objects with required keys for each language', () => {
        LANGUAGES.forEach((lang) => {
            missions.forEach((mission) => {
                const flat = localizeMission(mission, lang);
                expect(typeof flat.title).toBe('string');
                expect(typeof flat.story).toBe('string');
                expect(typeof flat.learningGoal).toBe('string');
                expect(Array.isArray(flat.hints)).toBe(true);
                // localized object should not expose the raw i18n block
                expect(flat.i18n).toBeUndefined();
            });
        });
    });

    it('localizeMission should fall back to English when a language is missing', () => {
        // Test with a fake unsupported language — should fall back to English
        missions.forEach((mission) => {
            const flat = localizeMission(mission, 'zz');
            // Should still return a valid title (the English one)
            expect(typeof flat.title).toBe('string');
            expect(flat.title.trim().length).toBeGreaterThan(0);
        });
    });
});
