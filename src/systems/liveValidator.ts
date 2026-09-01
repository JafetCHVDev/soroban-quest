import type { Check } from "./codeValidator";

// Constants
export const Severity = {
  Error: 8, // monaco.MarkerSeverity.Error
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

export interface ValidationMarker {
  severity: number;
  message: string;
  startLineNumber: number;
  startColumn: number;
  endLineNumber: number;
  endColumn: number;
  source: string;
  code: string;
}

export interface ValidationResultLive {
  markers: ValidationMarker[];
  passCount: number;
  totalCount: number;
}

// Helpers
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

interface LineLocation {
  lineNumber: number;
  startColumn: number;
  endColumn: number;
}

function locateLine(code: string, searchText: string): LineLocation {
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

interface BraceCheckResult {
  ok: boolean;
  line: number;
}

function checkBraces(code: string): BraceCheckResult {
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

function validateCheck(
  check: Check,
  code: string
): ValidationMarker | null {
  switch (check.type) {
    // ── has_function
    case "has_function": {
      const escaped = escapeRegex(check.name ?? "");
      const pattern = new RegExp(
        `(pub\\s+)?fn\\s+${escaped}\\s*\\(`,
        "gm"
      );
      const match = pattern.exec(code);

      if (!match) {
        return {
          severity: Severity.Warning,
          message:
            check.message || `Missing function \`${check.name}\``,
          startLineNumber: 1,
          startColumn: 1,
          endLineNumber: 1,
          endColumn: 2,
          source: "SorobanQuest",
          code: check.type,
        };
      }

      // If params specified, validate them too
      if (check.params?.length ?? 0 > 0) {
        const fullPattern = new RegExp(
          `(pub\\s+)?fn\\s+${escaped}\\s*\\(([^)]*)\\)`,
          "gm"
        );
        const fullMatch = fullPattern.exec(code);
        const paramStr =
          fullMatch?.[2]?.replace(/\s+/g, " ").trim() || "";
        const allPresent = (check.params ?? []).every((p) =>
          new RegExp(
            escapeRegex(p).replace(/\s+/g, "\\s*")
          ).test(paramStr)
        );

        if (!allPresent) {
          const loc = locateLine(code, `fn ${check.name}`);
          return {
            severity: Severity.Warning,
            message:
              check.message ||
              `Function \`${check.name}\` has incorrect parameters. Expected: ${(check.params ?? []).join(", ")}`,
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
      const escaped = escapeRegex(check.attribute ?? "");
      const pattern = new RegExp(
        `#\\[${escaped}[^\\]]*\\]`,
        "gm"
      );

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
      const pattern = new RegExp(
        `\\b${escapeRegex(check.typeName ?? "")}\\b`,
        "gm"
      );
      if (pattern.test(code)) return null; // pass

      return {
        severity: Severity.Warning,
        message:
          check.message ||
          `Must use type \`${check.typeName}\``,
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
      const endCol = (lines[line - 1]?.length ?? 0) + 1;
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
      const escaped = escapeRegex(check.name ?? "");
      const pattern = new RegExp(
        `(pub\\s+)?struct\\s+${escaped}`,
        "gm"
      );
      if (pattern.test(code)) return null; // pass

      return {
        severity: Severity.Warning,
        message:
          check.message ||
          `Missing struct \`${check.name}\``,
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
      const escaped = escapeRegex(check.module ?? "");
      const pattern = new RegExp(`use\\s+${escaped}`, "gm");
      if (pattern.test(code)) return null; // pass

      const loc = locateLine(code, "use ");
      return {
        severity: Severity.Warning,
        message:
          check.message ||
          `Missing import: \`use ${check.module}\``,
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
export function runLiveValidation(
  code: string,
  mission: unknown
): ValidationResultLive {
  const missionObj = mission as Record<string, unknown>;
  if (!missionObj?.checks) {
    return { markers: [], passCount: 0, totalCount: 0 };
  }

  const liveChecks = (missionObj.checks as Check[]).filter((c: Check) =>
    LIVE_CHECK_TYPES.has(c.type)
  );
  const markers: ValidationMarker[] = [];
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

interface DebouncedValidator {
  call: (code: string, mission: unknown) => void;
  cancel: () => void;
}

export function createDebouncedValidator(
  waitMs = 500,
  onResult: (result: ValidationResultLive) => void
): DebouncedValidator {
  let timer: ReturnType<typeof setTimeout> | null = null;

  function call(code: string, mission: unknown): void {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      onResult(runLiveValidation(code, mission));
      timer = null;
    }, waitMs);
  }

  function cancel(): void {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
  }

  return { call, cancel };
}
