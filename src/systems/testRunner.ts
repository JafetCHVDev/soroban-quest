/* ==========================================
   Test Runner — Orchestrates validation
   and formats results
   ========================================== */

import { validateCode } from './codeValidator';
import { Mission } from '../types';

export interface TestRunResultItem {
  phase: string;
  label: string;
  passed: boolean;
  message: string;
  check?: any;
}

export type TestResult = TestRunResultItem;

export interface TestRunSummary {
  results: TestRunResultItem[];
  allPassed: boolean;
  passedCount: number;
  totalCount: number;
  summary: string;
}

export async function runTests(
  code: string,
  checksOrMission: any[] | Mission | any,
  onResultCallback?: (result: TestRunResultItem) => void,
): Promise<TestRunSummary> {
    const checks = Array.isArray(checksOrMission) ? checksOrMission : checksOrMission?.checks || [];
    const missionObj = Array.isArray(checksOrMission) ? { checks: checksOrMission } : checksOrMission;

    const results: TestRunResultItem[] = [];

    const add = (item: TestRunResultItem) => {
        results.push(item);
        onResultCallback?.(item);
    };

    // Step 1: Syntax basics
    add({
        phase: 'syntax',
        label: '🔍 Checking syntax...',
        ...checkSyntaxBasics(code),
    });

    await delay(300);

    // Step 2: Structure validation
    add({
        phase: 'structure',
        label: '🏗️ Validating structure...',
        ...checkStructure(code, missionObj),
    });

    await delay(300);

    // Step 3: Mission-specific checks
    const validation = validateCode(code, checks);

    for (let i = 0; i < validation.results.length; i++) {
        await delay(200);
        add({
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

function checkSyntaxBasics(code: string): { passed: boolean; message: string } {
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

function checkStructure(code: string, _mission: any): { passed: boolean; message: string } {
    if (!/fn\s+\w+/.test(code)) {
        return { passed: false, message: '✗ No function definitions found' };
    }

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

function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}
