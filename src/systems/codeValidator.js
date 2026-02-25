/* ==========================================
   Code Validator — AST-like pattern matching
   for Soroban/Rust code validation
   ========================================== */

export function validateCode(code, checks) {
  const results = [];

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

function runCheck(code, check) {
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

function checkContainsPattern(code, check) {
  const found = code.includes(check.pattern);
  return {
    passed: found,
    message: found
      ? `✓ Found: ${check.description || check.pattern}`
      : `✗ ${check.message || `Missing pattern: ${check.pattern}`}`,
    check,
  };
}

function checkHasFunction(code, check) {
  // Match fn name with optional pub, parameters
  const escapedName = escapeRegex(check.name);
  const fnPattern = new RegExp(`(pub\\s+)?fn\\s+${escapedName}\\s*\\(([^)]*)\\)`, 'gm');
  const match = fnPattern.exec(code);

  if (!match) {
    return {
      passed: false,
      message: `✗ ${check.message || `Function '${check.name}' not found`}`,
      check,
    };
  }

  // If params are specified, validate them
  if (check.params && check.params.length > 0) {
    const paramStr = match[2].replace(/\s+/g, ' ').trim();
    const allPresent = check.params.every((p) => {
      const cleanP = p.replace(/\s+/g, '\\s*');
      return new RegExp(cleanP).test(paramStr);
    });

    if (!allPresent) {
      return {
        passed: false,
        message: `✗ Function '${check.name}' has incorrect parameters. Expected: ${check.params.join(', ')}`,
        check,
      };
    }
  }

  return {
    passed: true,
    message: `✓ Function '${check.name}' found with correct signature`,
    check,
  };
}

function checkReturnsType(code, check) {
  const escapedName = escapeRegex(check.function);
  const escapedType = escapeRegex(check.returnType).replace(/\s+/g, '\\s*');
  const pattern = new RegExp(`fn\\s+${escapedName}\\s*\\([^)]*\\)\\s*->\\s*${escapedType}`, 'gm');
  const found = pattern.test(code);

  return {
    passed: found,
    message: found
      ? `✓ Function '${check.function}' returns correct type: ${check.returnType}`
      : `✗ ${check.message || `Function '${check.function}' should return ${check.returnType}`}`,
    check,
  };
}

function checkHasAttribute(code, check) {
  const escaped = escapeRegex(check.attribute);
  const pattern = new RegExp(`#\\[${escaped}[^\\]]*\\]`, 'gm');
  const found = pattern.test(code);

  return {
    passed: found,
    message: found
      ? `✓ Attribute #[${check.attribute}] found`
      : `✗ ${check.message || `Missing attribute: #[${check.attribute}]`}`,
    check,
  };
}

function checkUsesType(code, check) {
  const escaped = escapeRegex(check.typeName);
  const pattern = new RegExp(`\\b${escaped}\\b`, 'gm');
  const found = pattern.test(code);

  return {
    passed: found,
    message: found
      ? `✓ Type '${check.typeName}' is used`
      : `✗ ${check.message || `Must use type: ${check.typeName}`}`,
    check,
  };
}

function checkStorageOperation(code, check) {
  const op = check.operation; // 'get', 'set', 'has', 'remove'
  const patterns = {
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

function checkNoPattern(code, check) {
  const found = code.includes(check.pattern);
  return {
    passed: !found,
    message: !found
      ? `✓ Correctly avoided: ${check.description || check.pattern}`
      : `✗ ${check.message || `Should not contain: ${check.pattern}`}`,
    check,
  };
}

function checkHasStruct(code, check) {
  const escaped = escapeRegex(check.name);
  const pattern = new RegExp(`(pub\\s+)?struct\\s+${escaped}`, 'gm');
  const found = pattern.test(code);

  return {
    passed: found,
    message: found
      ? `✓ Struct '${check.name}' defined`
      : `✗ ${check.message || `Missing struct: ${check.name}`}`,
    check,
  };
}

function checkBalancedBraces(code, check) {
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

function checkHasImport(code, check) {
  const escaped = escapeRegex(check.module);
  const pattern = new RegExp(`use\\s+${escaped}`, 'gm');
  const found = pattern.test(code);

  return {
    passed: found,
    message: found
      ? `✓ Import '${check.module}' found`
      : `✗ ${check.message || `Missing import: use ${check.module}`}`,
    check,
  };
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
