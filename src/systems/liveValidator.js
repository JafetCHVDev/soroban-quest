// Constants
export const Severity = {
  Error: 8,   // monaco.MarkerSeverity.Error
  Warning: 4, // monaco.MarkerSeverity.Warning
  Info: 2,
  Hint: 1,
};

const LIVE_CHECK_TYPES = new Set([
  "has_function",
  "has_attribute",
  "uses_type",
  "balanced_braces",
  "has_struct",
  "has_import",
]);


// Helpers
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function locateLine(code, searchText) {
  const lines = code.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const col = lines[i].indexOf(searchText);
    if (col !== -1) {
      return {
        lineNumber: i + 1,
        startColumn: col + 1,
        endColumn: col + searchText.length + 1,
      };
    }
  }
  return { lineNumber: 1, startColumn: 1, endColumn: 2 };
}

function checkBraces(code) {
  const lines = code.split("\n");
  let depth = 0;
  for (let i = 0; i < lines.length; i++) {
    for (const ch of lines[i]) {
      if (ch === "{") depth++;
      else if (ch === "}") {
        depth--;
        if (depth < 0) return { ok: false, line: i + 1 };
      }
    }
  }
  return { ok: depth === 0, line: lines.length };
}


function validateCheck(check, code) {
  switch (check.type) {

    // ── has_function 
    case "has_function": {
      const escaped = escapeRegex(check.name);
      const pattern = new RegExp(`(pub\\s+)?fn\\s+${escaped}\\s*\\(`, "gm");
      const match = pattern.exec(code);

      if (!match) {
        return {
          severity: Severity.Warning,
          message: check.message || `Missing function \`${check.name}\``,
          startLineNumber: 1,
          startColumn: 1,
          endLineNumber: 1,
          endColumn: 2,
          source: "SorobanQuest",
          code: check.type,
        };
      }

      // If params specified, validate them too
      if (check.params?.length > 0) {
        const fullPattern = new RegExp(
          `(pub\\s+)?fn\\s+${escaped}\\s*\\(([^)]*)\\)`,
          "gm"
        );
        const fullMatch = fullPattern.exec(code);
        const paramStr = fullMatch?.[2]?.replace(/\s+/g, " ").trim() || "";
        const allPresent = check.params.every((p) =>
          new RegExp(escapeRegex(p).replace(/\s+/g, "\\s*")).test(paramStr)
        );

        if (!allPresent) {
          const loc = locateLine(code, `fn ${check.name}`);
          return {
            severity: Severity.Warning,
            message:
              check.message ||
              `Function \`${check.name}\` has incorrect parameters. Expected: ${check.params.join(", ")}`,
            startLineNumber: loc.lineNumber,
            startColumn: loc.startColumn,
            endLineNumber: loc.lineNumber,
            endColumn: loc.endColumn,
            source: "SorobanQuest",
            code: check.type,
          };
        }
      }

      return null; // pass
    }

    // ── has_attribute 
    case "has_attribute": {
      const escaped = escapeRegex(check.attribute);
      const pattern = new RegExp(`#\\[${escaped}[^\\]]*\\]`, "gm");

      if (pattern.test(code)) return null; // pass

      const loc = locateLine(code, "pub struct");
      return {
        severity: Severity.Error,
        message:
          check.message ||
          `Missing required attribute \`#[${check.attribute}]\``,
        startLineNumber: loc.lineNumber,
        startColumn: loc.startColumn,
        endLineNumber: loc.lineNumber,
        endColumn: loc.endColumn,
        source: "SorobanQuest",
        code: check.type,
      };
    }

    // ── uses_type 
    case "uses_type": {
      const pattern = new RegExp(`\\b${escapeRegex(check.typeName)}\\b`, "gm");
      if (pattern.test(code)) return null; // pass

      return {
        severity: Severity.Warning,
        message: check.message || `Must use type \`${check.typeName}\``,
        startLineNumber: 1,
        startColumn: 1,
        endLineNumber: 1,
        endColumn: 2,
        source: "SorobanQuest",
        code: check.type,
      };
    }

    // ── balanced_braces 
    case "balanced_braces": {
      const { ok, line } = checkBraces(code);
      if (ok) return null; 

      const lines = code.split("\n");
      const endCol = (lines[line - 1]?.length || 0) + 1;
      return {
        severity: Severity.Error,
        message:
          check.message ||
          "Unbalanced braces — check that every `{` has a matching `}`",
        startLineNumber: line,
        startColumn: 1,
        endLineNumber: line,
        endColumn: endCol,
        source: "SorobanQuest",
        code: check.type,
      };
    }

    // ── has_struct 
    case "has_struct": {
      const escaped = escapeRegex(check.name);
      const pattern = new RegExp(`(pub\\s+)?struct\\s+${escaped}`, "gm");
      if (pattern.test(code)) return null; // pass

      return {
        severity: Severity.Warning,
        message: check.message || `Missing struct \`${check.name}\``,
        startLineNumber: 1,
        startColumn: 1,
        endLineNumber: 1,
        endColumn: 2,
        source: "SorobanQuest",
        code: check.type,
      };
    }

    // ── has_import 
    case "has_import": {
      const escaped = escapeRegex(check.module);
      const pattern = new RegExp(`use\\s+${escaped}`, "gm");
      if (pattern.test(code)) return null; // pass

      const loc = locateLine(code, "use ");
      return {
        severity: Severity.Warning,
        message: check.message || `Missing import: \`use ${check.module}\``,
        startLineNumber: loc.lineNumber,
        startColumn: loc.startColumn,
        endLineNumber: loc.lineNumber,
        endColumn: loc.endColumn,
        source: "SorobanQuest",
        code: check.type,
      };
    }

    default:
      return null; // deferred to Run Tests
  }
}


// Public API
export function runLiveValidation(code, mission) {
  if (!mission?.checks) {
    return { markers: [], passCount: 0, totalCount: 0 };
  }

  const liveChecks = mission.checks.filter((c) => LIVE_CHECK_TYPES.has(c.type));
  const markers = [];
  let passCount = 0;

  for (const check of liveChecks) {
    const marker = validateCheck(check, code);
    if (marker === null) {
      passCount++;
    } else {
      markers.push(marker);
    }
  }

  return { markers, passCount, totalCount: liveChecks.length };
}

export function createDebouncedValidator(waitMs = 500, onResult) {
  let timer = null;

  function call(code, mission) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      onResult(runLiveValidation(code, mission));
      timer = null;
    }, waitMs);
  }

  function cancel() {
    if (timer) { clearTimeout(timer); timer = null; }
  }

  return { call, cancel };
}