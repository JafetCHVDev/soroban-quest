/* ==========================================
   Code Validator — AST-like pattern matching
   for Soroban/Rust code validation
   ========================================== */

import { MissionCheck } from '../types';

export interface CheckRunResult {
  passed: boolean;
  message: string;
  check: MissionCheck;
}

export interface ValidationSummary {
  passed: boolean;
  results: CheckRunResult[];
  passedCount: number;
  totalCount: number;
}

export function validateCode(code: string, checks: any[]): ValidationSummary {
  const results: CheckRunResult[] = [];

  for (const check of checks) {
    const result = runCheck(code, check);
    results.push(result);
  }

  return {
    passed: results.every((r) => r.passed),
    results,
    passedCount: results.filter((r) => r.passed).length,
    totalCount: results.length,
  };
}

function runCheck(code: string, check: MissionCheck): CheckRunResult {
  switch (check.type) {
    case 'contains_pattern':
      return checkContainsPattern(code, check);
    case 'has_function':
      return checkHasFunction(code, check);
    case 'returns_type':
      return checkReturnsType(code, check);
    case 'has_attribute':
      return checkHasAttribute(code, check);
    case 'uses_type':
      return checkUsesType(code, check);
    case 'storage_operation':
      return checkStorageOperation(code, check);
    case 'no_pattern':
      return checkNoPattern(code, check);
    case 'has_struct':
      return checkHasStruct(code, check);
    case 'balanced_braces':
      return checkBalancedBraces(code, check);
    case 'has_import':
      return checkHasImport(code, check);
    default:
      return { passed: false, message: `Unknown check type: ${check.type}`, check };
  }
}

function checkContainsPattern(code: string, check: MissionCheck): CheckRunResult {
  const pattern = check.pattern || '';
  const found = code.includes(pattern);
  return {
    passed: found,
    message: found
      ? `✓ Found: ${check.description || pattern}`
      : `✗ ${check.message || `Missing pattern: ${pattern}`}`,
    check,
  };
}

function checkHasFunction(code: string, check: MissionCheck): CheckRunResult {
  const name = check.name || '';
  const escapedName = escapeRegex(name);
  const fnPattern = new RegExp(`(pub\\s+)?fn\\s+${escapedName}\\s*\\(([^)]*)\\)`, 'gm');
  const match = fnPattern.exec(code);

  if (!match) {
    return {
      passed: false,
      message: `✗ ${check.message || `Function '${name}' not found`}`,
      check,
    };
  }

  if (check.params && check.params.length > 0) {
    const paramStr = match[2].replace(/\s+/g, ' ').trim();
    const allPresent = check.params.every((p) => {
      const cleanP = p.replace(/\s+/g, '\\s*');
      return new RegExp(cleanP).test(paramStr);
    });

    if (!allPresent) {
      return {
        passed: false,
        message: `✗ Function '${name}' has incorrect parameters. Expected: ${check.params.join(', ')}`,
        check,
      };
    }
  }

  return {
    passed: true,
    message: `✓ Function '${name}' found with correct signature`,
    check,
  };
}

function checkReturnsType(code: string, check: MissionCheck): CheckRunResult {
  const fnName = check.function || '';
  const returnType = check.returnType || '';
  const escapedName = escapeRegex(fnName);
  const escapedType = escapeRegex(returnType).replace(/\s+/g, '\\s*');
  const pattern = new RegExp(`fn\\s+${escapedName}\\s*\\([^)]*\\)\\s*->\\s*${escapedType}`, 'gm');
  const found = pattern.test(code);

  return {
    passed: found,
    message: found
      ? `✓ Function '${fnName}' returns correct type: ${returnType}`
      : `✗ ${check.message || `Function '${fnName}' should return ${returnType}`}`,
    check,
  };
}

function checkHasAttribute(code: string, check: MissionCheck): CheckRunResult {
  const attr = check.attribute || '';
  const escaped = escapeRegex(attr);
  const pattern = new RegExp(`#\\[${escaped}[^\\]]*\\]`, 'gm');
  const found = pattern.test(code);

  return {
    passed: found,
    message: found
      ? `✓ Attribute #[${attr}] found`
      : `✗ ${check.message || `Missing attribute: #[${attr}]`}`,
    check,
  };
}

function checkUsesType(code: string, check: MissionCheck): CheckRunResult {
  const typeName = check.typeName || '';
  const escaped = escapeRegex(typeName);
  const pattern = new RegExp(`\\b${escaped}\\b`, 'gm');
  const found = pattern.test(code);

  return {
    passed: found,
    message: found
      ? `✓ Type '${typeName}' is used`
      : `✗ ${check.message || `Must use type: ${typeName}`}`,
    check,
  };
}

function checkStorageOperation(code: string, check: MissionCheck): CheckRunResult {
  const op = check.operation as 'get' | 'set' | 'has' | 'remove';
  const patterns: Record<string, RegExp> = {
    get: /env\s*\.\s*storage\(\)\s*\.\s*(persistent|temporary|instance)\(\)\s*\.\s*get/,
    set: /env\s*\.\s*storage\(\)\s*\.\s*(persistent|temporary|instance)\(\)\s*\.\s*set/,
    has: /env\s*\.\s*storage\(\)\s*\.\s*(persistent|temporary|instance)\(\)\s*\.\s*has/,
    remove: /env\s*\.\s*storage\(\)\s*\.\s*(persistent|temporary|instance)\(\)\s*\.\s*remove/,
  };

  const found = patterns[op]?.test(code) || false;

  return {
    passed: found,
    message: found
      ? `✓ Storage ${op} operation found`
      : `✗ ${check.message || `Missing storage ${op} operation`}`,
    check,
  };
}

function checkNoPattern(code: string, check: MissionCheck): CheckRunResult {
  const pattern = check.pattern || '';
  const found = code.includes(pattern);
  return {
    passed: !found,
    message: !found
      ? `✓ Correctly avoided: ${check.description || pattern}`
      : `✗ ${check.message || `Should not contain: ${pattern}`}`,
    check,
  };
}

function checkHasStruct(code: string, check: MissionCheck): CheckRunResult {
  const name = check.name || '';
  const escaped = escapeRegex(name);
  const pattern = new RegExp(`(pub\\s+)?struct\\s+${escaped}`, 'gm');
  const found = pattern.test(code);

  return {
    passed: found,
    message: found
      ? `✓ Struct '${name}' defined`
      : `✗ ${check.message || `Missing struct: ${name}`}`,
    check,
  };
}

function checkBalancedBraces(code: string, check: MissionCheck): CheckRunResult {
  let count = 0;
  for (const ch of code) {
    if (ch === '{') count++;
    if (ch === '}') count--;
    if (count < 0) break;
  }
  const balanced = count === 0;

  return {
    passed: balanced,
    message: balanced
      ? '✓ All braces are balanced'
      : `✗ ${check.message || 'Unbalanced braces detected — check for missing { or }'}`,
    check,
  };
}

function checkHasImport(code: string, check: MissionCheck): CheckRunResult {
  const mod = (check as any).module || '';
  const escaped = escapeRegex(mod);
  const pattern = new RegExp(`use\\s+${escaped}`, 'gm');
  const found = pattern.test(code);

  return {
    passed: found,
    message: found
      ? `✓ Import '${mod}' found`
      : `✗ ${check.message || `Missing import: use ${mod}`}`,
    check,
  };
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
