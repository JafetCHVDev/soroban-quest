/* ==========================================
   Test Runner — Orchestrates validation
   and formats results
   ========================================== */

import { validateCode } from './codeValidator';

export async function runTests(fileCodes, mission) {
    // Backward compat: accept plain string (single-file missions)
    if (typeof fileCodes === 'string') {
        fileCodes = { 'lib.rs': fileCodes };
    }

    const files = mission.files && mission.files.length > 0
        ? mission.files
        : [{ name: 'lib.rs' }];
    const primaryFileName = files[0].name;
    const primaryCode = fileCodes[primaryFileName] ?? Object.values(fileCodes)[0] ?? '';

    const results = [];

    // Step 1: Syntax basics (primary file)
    results.push({
        phase: 'syntax',
        label: '🔍 Checking syntax...',
        ...checkSyntaxBasics(primaryCode),
    });

    await delay(300);

    // Step 2: Structure validation
    results.push({
        phase: 'structure',
        label: '🏗️ Validating structure...',
        ...checkStructure(primaryCode),
    });

    await delay(300);

    // Step 3: Mission-specific checks — each check routed to its target file
    for (let i = 0; i < mission.checks.length; i++) {
        await delay(200);
        const check = mission.checks[i];
        const targetFile = check.file || primaryFileName;
        const code = fileCodes[targetFile] ?? primaryCode;
        const validation = validateCode(code, [check]);
        results.push({
            phase: 'test',
            label: `🧪 Test ${i + 1}/${mission.checks.length}`,
            ...validation.results[0],
        });
    }

    await delay(300);

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

function checkStructure(code) {
    // Must have at least one fn declaration
    if (!/fn\s+\w+/.test(code)) {
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
