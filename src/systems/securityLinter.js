/* ==========================================
   Security Linter — advisory heuristics for
   common Soroban anti-patterns.

   Findings never fail mission checks. They
   are warnings/info notes only.
   ========================================== */

export const RULE_META = {
  'missing-auth': {
    severity: 'warning',
    titleKey: 'missionDetail.securityNotes.rules.missingAuth.title',
    messageKey: 'missionDetail.securityNotes.rules.missingAuth.body',
    fallbackTitle: 'Missing authorization before state change',
    fallbackMessage:
      'Function {{functionName}} writes storage without require_auth() first.',
  },
  'unchecked-arithmetic': {
    severity: 'warning',
    titleKey: 'missionDetail.securityNotes.rules.uncheckedArithmetic.title',
    messageKey: 'missionDetail.securityNotes.rules.uncheckedArithmetic.body',
    fallbackTitle: 'Unchecked arithmetic on token amounts',
    fallbackMessage:
      'Function {{functionName}} uses wrapping or multiplying arithmetic on token amounts without a checked_* call.',
  },
  'reentrancy-ordering': {
    severity: 'warning',
    titleKey: 'missionDetail.securityNotes.rules.reentrancy.title',
    messageKey: 'missionDetail.securityNotes.rules.reentrancy.body',
    fallbackTitle: 'External call before state write',
    fallbackMessage:
      'Function {{functionName}} makes an external call before writing storage. Update state first.',
  },
  'storage-unwrap': {
    severity: 'info',
    titleKey: 'missionDetail.securityNotes.rules.storageUnwrap.title',
    messageKey: 'missionDetail.securityNotes.rules.storageUnwrap.body',
    fallbackTitle: 'Storage read uses unwrap',
    fallbackMessage:
      'Function {{functionName}} unwraps a storage get on a user-supplied key. Missing values will panic.',
  },
};

const SKIP_AUTH_FUNCTIONS = new Set([
  'init',
  '__constructor',
  'collect',
  'flash_loan',
  'repay',
]);

const PRIVILEGED_FUNCTIONS = new Set([
  'set_fee',
  'pause',
  'mint',
  'grant_role',
  'revoke_role',
  'update_price',
  'set_admin',
  'set_owner',
]);

const AUTH_PARAM_NAMES = new Set([
  'admin',
  'from',
  'owner',
  'who',
  'user',
  'spender',
  'buyer',
  'seller',
  'arbiter',
  'creator',
  'signer',
  'caller',
  'account',
]);

const AMOUNT_LIKE = new Set([
  'amount',
  'balance',
  'supply',
  'allowance',
  'value',
  'from_bal',
  'to_bal',
  'owner_bal',
  'pool_bal',
  'current',
  'bal',
  'fee',
]);

const STORAGE_WRITE_RE = /\.(?:set|remove)\s*\(/;
const REQUIRE_AUTH_RE = /\.require_auth\s*\(/;
const WRAPPING_ARITH_RE = /\.(?:wrapping_add|wrapping_sub|wrapping_mul)\s*\(/;
const CHECKED_ARITH_RE = /\.(?:checked_add|checked_sub|checked_mul|saturating_add|saturating_sub|saturating_mul|overflowing_add|overflowing_sub|overflowing_mul)\s*\(/;
const AMOUNT_MUL_RE = /\b([A-Za-z_][A-Za-z0-9_]*)\s*\*\s*([A-Za-z_][A-Za-z0-9_]*)\b/;
const EXTERNAL_CALL_RE =
  /(?:invoke_contract|try_invoke_contract)\s*\(|\.try_invoke\s*\(|\.\s*try_transfer\s*\(|\.\s*transfer\s*\(/;
const USER_KEY_UNWRAP_RE =
  /\.get\s*\(\s*&([a-z_][A-Za-z0-9_]*)\s*\)\s*\.unwrap\s*\(\s*\)/;
const IDENT_RE = /[A-Za-z_][A-Za-z0-9_]*/;

function isIdentChar(ch) {
  return /[A-Za-z0-9_]/.test(ch);
}

function interpolate(template, vars) {
  if (typeof template !== 'string' || !vars) return template;
  return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, name) =>
    vars[name] != null ? String(vars[name]) : `{{${name}}}`,
  );
}

function indexToLineColumn(code, index) {
  let line = 1;
  let column = 1;
  const limit = Math.max(0, Math.min(index, code.length));
  for (let i = 0; i < limit; i++) {
    if (code[i] === '\n') {
      line += 1;
      column = 1;
    } else {
      column += 1;
    }
  }
  return { line, column };
}

function skipStringLike(code, start, quote) {
  let i = start + 1;
  while (i < code.length) {
    const ch = code[i];
    if (ch === '\\') {
      i += 2;
      continue;
    }
    if (ch === quote) return i + 1;
    if (quote === "'" && ch === '\n') return i;
    i += 1;
  }
  return code.length;
}

function skipBlockComment(code, start) {
  const end = code.indexOf('*/', start + 2);
  return end === -1 ? code.length : end + 2;
}

/**
 * Walk source while skipping comments and string/char literals.
 * Mirrors the delimiter walker in sorobanAnalyzer without importing it.
 */
function visitCode(code, onIndex) {
  let i = 0;
  while (i < code.length) {
    const ch = code[i];
    const next = code[i + 1];
    const prev = i > 0 ? code[i - 1] : '';

    if (ch === '/' && next === '/') {
      const nl = code.indexOf('\n', i);
      i = nl === -1 ? code.length : nl;
      continue;
    }
    if (ch === '/' && next === '*') {
      i = skipBlockComment(code, i);
      continue;
    }
    if (ch === '"') {
      i = skipStringLike(code, i, '"');
      continue;
    }
    if (ch === "'" && !/[A-Za-z0-9_]/.test(prev) && /[^A-Za-z]/.test(next ?? ' ')) {
      i = skipStringLike(code, i, "'");
      continue;
    }

    const consumed = onIndex(i, ch);
    i += consumed != null ? consumed : 1;
  }
}

function matchParen(code, openIndex) {
  const open = code[openIndex];
  const close = open === '(' ? ')' : open === '{' ? '}' : open === '[' ? ']' : null;
  if (!close) return -1;
  let depth = 0;
  let end = -1;
  visitCode(code.slice(openIndex), (rel) => {
    if (end !== -1) return 1;
    const ch = code[openIndex + rel];
    if (ch === open) depth += 1;
    else if (ch === close) {
      depth -= 1;
      if (depth === 0) {
        end = openIndex + rel;
        return 1;
      }
    }
    return 1;
  });
  return end;
}

function hasPubBefore(code, fnIndex) {
  let i = fnIndex - 1;
  while (i >= 0 && /\s/.test(code[i])) i -= 1;
  return i >= 2 && code.slice(i - 2, i + 1) === 'pub';
}

function skipWs(code, i) {
  while (i < code.length && /\s/.test(code[i])) i += 1;
  return i;
}

export function extractFunctions(code) {
  if (typeof code !== 'string' || !code) return [];
  const functions = [];

  visitCode(code, (i) => {
    if (i > 0 && isIdentChar(code[i - 1])) return 1;
    if (!(code[i] === 'f' && code[i + 1] === 'n' && !isIdentChar(code[i + 2] || ''))) {
      return 1;
    }

    const isPub = hasPubBefore(code, i);
    let cursor = skipWs(code, i + 2);
    const nameMatch = code.slice(cursor).match(IDENT_RE);
    if (!nameMatch) return 2;
    const name = nameMatch[0];
    cursor = skipWs(code, cursor + name.length);

    if (code[cursor] === '<') {
      const genericEnd = matchParen(code, cursor);
      if (genericEnd === -1) return 2;
      cursor = skipWs(code, genericEnd + 1);
    }

    if (code[cursor] !== '(') return 2;
    const paramsEnd = matchParen(code, cursor);
    if (paramsEnd === -1) return 2;
    const params = code.slice(cursor + 1, paramsEnd);
    cursor = skipWs(code, paramsEnd + 1);

    if (code[cursor] === '-') {
      const brace = code.indexOf('{', cursor);
      if (brace === -1) return 2;
      cursor = brace;
    } else {
      cursor = skipWs(code, cursor);
    }

    if (code[cursor] !== '{') return 2;
    const bodyEnd = matchParen(code, cursor);
    if (bodyEnd === -1) return 2;

    const body = code.slice(cursor + 1, bodyEnd);
    const loc = indexToLineColumn(code, cursor + 1);
    functions.push({
      name,
      isPub,
      params,
      body,
      bodyStartIndex: cursor + 1,
      bodyStartLine: loc.line,
      bodyStartColumn: loc.column,
    });

    return bodyEnd - i + 1;
  });

  return functions;
}

function locateInBody(fn, relativeIndex, length) {
  const { line, column } = indexToLineColumn(fn.body, relativeIndex);
  const absLine = fn.bodyStartLine + line - 1;
  const absColumn = line === 1 ? fn.bodyStartColumn + column - 1 : column;
  return {
    line: absLine,
    column: absColumn,
    endColumn: absColumn + Math.max(1, length),
  };
}

function firstMatch(body, regex) {
  const flags = regex.flags.includes('g') ? regex.flags : `${regex.flags}g`;
  const re = new RegExp(regex.source, flags);
  return re.exec(body);
}

function lastMatch(body, regex) {
  const flags = regex.flags.includes('g') ? regex.flags : `${regex.flags}g`;
  const re = new RegExp(regex.source, flags);
  let last = null;
  let m;
  while ((m = re.exec(body)) !== null) {
    last = m;
    if (m.index === re.lastIndex) re.lastIndex += 1;
  }
  return last;
}

function hasAuthActorParam(params) {
  const re = /\b([A-Za-z_][A-Za-z0-9_]*)\s*:\s*Address\b/g;
  let m;
  while ((m = re.exec(params)) !== null) {
    if (AUTH_PARAM_NAMES.has(m[1])) return true;
  }
  return false;
}

function makeNote(rule, fn, loc) {
  const meta = RULE_META[rule];
  const vars = { functionName: fn.name };
  return {
    id: `${rule}:${fn.name}:${loc.line}`,
    rule,
    severity: meta.severity,
    functionName: fn.name,
    titleKey: meta.titleKey,
    messageKey: meta.messageKey,
    title: meta.fallbackTitle,
    message: interpolate(meta.fallbackMessage, vars),
    line: loc.line,
    column: loc.column,
    endColumn: loc.endColumn,
  };
}

function lintMissingAuth(fn, notes) {
  if (!fn.isPub) return;
  if (SKIP_AUTH_FUNCTIONS.has(fn.name)) return;
  const write = firstMatch(fn.body, STORAGE_WRITE_RE);
  if (!write) return;
  // Mutex-then-auth (reentrancy guards) writes storage before require_auth.
  // Treat any require_auth in the body as sufficient for this heuristic.
  if (firstMatch(fn.body, REQUIRE_AUTH_RE)) return;

  const needsAuth =
    hasAuthActorParam(fn.params) || PRIVILEGED_FUNCTIONS.has(fn.name);
  if (!needsAuth) return;

  const loc = locateInBody(fn, write.index, write[0].length);
  notes.push(makeNote('missing-auth', fn, loc));
}

function lintUncheckedArithmetic(fn, notes) {
  if (CHECKED_ARITH_RE.test(fn.body)) return;

  const wrapping = firstMatch(fn.body, WRAPPING_ARITH_RE);
  if (wrapping) {
    const loc = locateInBody(fn, wrapping.index, wrapping[0].length);
    notes.push(makeNote('unchecked-arithmetic', fn, loc));
    return;
  }

  const mul = firstMatch(fn.body, AMOUNT_MUL_RE);
  if (mul && AMOUNT_LIKE.has(mul[1]) && AMOUNT_LIKE.has(mul[2])) {
    const loc = locateInBody(fn, mul.index, mul[0].length);
    notes.push(makeNote('unchecked-arithmetic', fn, loc));
  }
}

function lintReentrancy(fn, notes) {
  const call = firstMatch(fn.body, EXTERNAL_CALL_RE);
  if (!call) return;
  const write = lastMatch(fn.body, STORAGE_WRITE_RE);
  if (!write) return;
  if (call.index < write.index) {
    const loc = locateInBody(fn, call.index, call[0].length);
    notes.push(makeNote('reentrancy-ordering', fn, loc));
  }
}

function lintStorageUnwrap(fn, notes) {
  const match = firstMatch(fn.body, USER_KEY_UNWRAP_RE);
  if (!match) return;
  const loc = locateInBody(fn, match.index, match[0].length);
  notes.push(makeNote('storage-unwrap', fn, loc));
}

export function lintSecurity(code) {
  if (typeof code !== 'string' || !code.trim()) return [];

  const notes = [];
  const seen = new Set();
  for (const fn of extractFunctions(code)) {
    lintMissingAuth(fn, notes);
    lintUncheckedArithmetic(fn, notes);
    lintReentrancy(fn, notes);
    lintStorageUnwrap(fn, notes);
  }

  return notes.filter((note) => {
    if (seen.has(note.id)) return false;
    seen.add(note.id);
    return true;
  });
}

export function formatNoteMessage(note, vars = {}) {
  return interpolate(note.message, { functionName: note.functionName, ...vars });
}
