/* ==========================================
   Test Runner — Orchestrates validation
   and formats results
   ========================================== */

import { validateCode } from './codeValidator';

export async function runTests(code, mission) {
    const results = [];

    // Step 1: Syntax basics
    const syntaxResult = checkSyntaxBasics(code);
    results.push({
        phase: 'syntax',
        label: '🔍 Checking syntax...',
        ...syntaxResult,
    });

    if (!syntaxResult.passed) {
        return {
            results,
            allPassed: false,
            passedCount: 0,
            totalCount: results.length,
            summary: `❌ 0/${results.length} checks passed. Keep trying!`,
        };
    }

    await delay(300);

    // Step 2: Structure validation
    results.push({
        phase: 'structure',
        label: '🏗️ Validating structure...',
        ...checkStructure(code, mission),
    });

    await delay(300);

    // Step 3: Mission-specific checks
    const checks = mission && Array.isArray(mission.checks) ? mission.checks : [];
    const validation = validateCode(code, checks);

    for (let i = 0; i < validation.results.length; i++) {
        await delay(200);
        results.push({
            phase: 'test',
            label: `🧪 Test ${i + 1}/${validation.totalCount}`,
            ...validation.results[i],
        });
    }

    await delay(300);

    // Final summary
    const allPassed = results.every(r => r.passed);
    const passedCount = results.filter(r => r.passed).length;

    return {
        results,
        allPassed,
        passedCount,
        totalCount: results.length,
        summary: allPassed
            ? `🎉 All ${results.length} checks passed! Mission complete!`
            : `❌ ${passedCount}/${results.length} checks passed. Keep trying!`,
    };
}

function checkSyntaxBasics(code) {
    const trimmed = code.trim();

    if (trimmed.length === 0) {
        return { passed: false, message: '✗ Code is empty — write your contract!' };
    }

    // Check balanced braces
    let braceCount = 0;
    for (const ch of trimmed) {
        if (ch === '{') braceCount++;
        if (ch === '}') braceCount--;
        if (braceCount < 0) {
            return { passed: false, message: '✗ Unexpected closing brace }' };
        }
    }
    if (braceCount !== 0) {
        return { passed: false, message: `✗ Unbalanced braces: ${braceCount > 0 ? 'missing }' : 'extra }'}` };
    }

    // Check balanced parentheses
    let parenCount = 0;
    for (const ch of trimmed) {
        if (ch === '(') parenCount++;
        if (ch === ')') parenCount--;
        if (parenCount < 0) {
            return { passed: false, message: '✗ Unexpected closing parenthesis )' };
        }
    }
    if (parenCount !== 0) {
        return { passed: false, message: `✗ Unbalanced parentheses` };
    }

    return { passed: true, message: '✓ Basic syntax looks good' };
}

function checkStructure(code, _mission) {
    // Strip comments before checking structure
    const codeNoComments = code.replace(/\/\/.*/g, '').replace(/\/\*[\s\S]*?\*\//g, '');

    // Must have at least one fn declaration
    if (!/\bfn[ \t]+[a-zA-Z_]\w*/.test(codeNoComments)) {
        return { passed: false, message: '✗ No function definitions found' };
    }

    // Should have Soroban-related content
    const hasSorobanMarkers =
        code.includes('soroban_sdk') ||
        code.includes('contractimpl') ||
        code.includes('contract') ||
        code.includes('Env');

    if (!hasSorobanMarkers) {
        return { passed: false, message: '✗ No Soroban SDK usage detected — this should be a Soroban contract' };
    }

    return { passed: true, message: '✓ Contract structure validated' };
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
