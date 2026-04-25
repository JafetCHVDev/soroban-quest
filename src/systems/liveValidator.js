
export const Severity = {
  Error: 8,   // monaco.MarkerSeverity.Error
  Warning: 4, // monaco.MarkerSeverity.Warning
  Info: 2,    // monaco.MarkerSeverity.Info
  Hint: 1,    // monaco.MarkerSeverity.Hint
};


const LIVE_CHECK_TYPES = new Set([
  "has_function",
  "has_attribute",
  "uses_type",
  "balanced_braces",
]);

// Internal helpers
function locateText(code, searchText) {
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
  // Default: highlight line 1
  return { lineNumber: 1, startColumn: 1, endColumn: lines[0]?.length + 1 || 2 };
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

// Per-check-type validators
function validateCheck(check, code) {
  switch (check.type) {
    
    case "has_function": {
      const fnName = check.value;
      const pattern = new RegExp(`\\bfn\\s+${fnName}\\b`);
      if (pattern.test(code)) return null; // pass

      const loc = { lineNumber: 1, startColumn: 1, endColumn: 2 };
      return {
        severity: Severity.Warning,
        message: `Missing function \`${fnName}\` — define it with \`fn ${fnName}(...)\``,
        startLineNumber: loc.lineNumber,
        startColumn: loc.startColumn,
        endLineNumber: loc.lineNumber,
        endColumn: loc.endColumn,
        source: "SorobanQuest",
        code: check.id || check.type,
      };
    }
    case "has_attribute": {
      const attr = check.value; 
      if (code.includes(attr)) return null; 

      const loc = locateText(code, "pub struct") || { lineNumber: 1, startColumn: 1, endColumn: 2 };
      return {
        severity: Severity.Error,
        message: `Missing required attribute \`${attr}\`. Add it immediately before the relevant struct or impl block.`,
        startLineNumber: loc.lineNumber,
        startColumn: loc.startColumn,
        endLineNumber: loc.lineNumber,
        endColumn: loc.endColumn,
        source: "SorobanQuest",
        code: check.id || check.type,
      };
    }

    case "uses_type": {
      const typeName = check.value; 
      const pattern = new RegExp(`\\b${typeName}\\b`);
      if (pattern.test(code)) return null; 

      return {
        severity: Severity.Warning,
        message: `Type \`${typeName}\` is not used. The mission expects this type to appear in your code.`,
        startLineNumber: 1,
        startColumn: 1,
        endLineNumber: 1,
        endColumn: 2,
        source: "SorobanQuest",
        code: check.id || check.type,
      };
    }

    
    case "balanced_braces": {
      const { ok, line } = checkBraces(code);
      if (ok) return null; 

      const lines = code.split("\n");
      const endCol = lines[line - 1]?.length + 1 || 2;
      return {
        severity: Severity.Error,
        message: "Unbalanced braces `{}` — check that every `{` has a matching `}`.",
        startLineNumber: line,
        startColumn: 1,
        endLineNumber: line,
        endColumn: endCol,
        source: "SorobanQuest",
        code: check.id || check.type,
      };
    }

   
    default:
      
      return null;
  }
}


// Public API
export function runLiveValidation(code, mission) {
  if (!mission?.checks) {
    return { markers: [], passCount: 0, totalCount: 0, liveCheckIds: [] };
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

  return {
    markers,
    passCount,
    totalCount: liveChecks.length,
    liveCheckIds: liveChecks.map((c) => c.id || c.type),
  };
}

export function createDebouncedValidator(waitMs = 500, onResult) {
  let timer = null;

  function call(code, mission) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      const result = runLiveValidation(code, mission);
      onResult(result);
      timer = null;
    }, waitMs);
  }

  function cancel() {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
  }

  return { call, cancel };
}