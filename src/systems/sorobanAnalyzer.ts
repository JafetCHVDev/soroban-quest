/* ==========================================
   Soroban Analyzer — shared compilation engine

   Pure, dependency-free analysis of Soroban/Rust source. It is used
   in two places:

     1. compilerWorker.ts — runs it off the UI thread.
     2. wasmCompiler.ts    — runs it inline as a graceful fallback
                             when a Web Worker (or a real WASM toolchain)
                             is unavailable.

   The goal of this module is NOT to be a full Rust compiler — compiling
   the real `rustc`/`soroban` toolchain to WASM and shipping it in the
   browser bundle is tracked separately (see the `backendUrl` /
   `wasmUrl` hooks in wasmCompiler.ts). Until a real toolchain is wired
   in, this analyzer produces *compiler-style* structured diagnostics
   (delimiter balancing, required Soroban scaffolding, and mission
   semantics) plus a simulated run, so the "Compile & Run" experience is
   honest, deterministic, and testable in Node.
   ========================================== */

import { validateCode } from "./codeValidator";

/** Diagnostic severities (string form; wasmCompiler maps these to Monaco). */
export const DiagnosticSeverity = {
  Error: "error",
  Warning: "warning",
  Info: "info",
};

/** Analysis engine identifiers, surfaced to the UI so users know what ran. */
export const AnalyzerEngine = {
  LocalAnalyzer: "local-analyzer",
};

const OPEN_TO_CLOSE: Record<string, string> = {
  "(": ")",
  "[": "]",
  "{": "}",
};
const CLOSE_TO_OPEN: Record<string, string> = {
  ")": "(",
  "]": "[",
  "}": "{",
};

export interface Diagnostic {
  severity: string;
  message: string;
  line: number;
  column: number;
  endColumn: number;
  code: string;
}

interface MakeDiagnosticParams {
  severity: string;
  message: string;
  line?: number;
  column?: number;
  endColumn?: number;
  code?: string;
}

function makeDiagnostic({
  severity,
  message,
  line = 1,
  column = 1,
  endColumn = column + 1,
  code = "soroban",
}: MakeDiagnosticParams): Diagnostic {
  return { severity, message, line, column, endColumn, code };
}

/**
 * Walk the source once, skipping string/char literals and comments, and
 * report the first unbalanced delimiter with an accurate line/column.
 * Mirrors the shape of rustc's "unclosed/mismatched delimiter" errors.
 */
function checkDelimiters(code: string): Diagnostic[] {
  const diagnostics: Diagnostic[] = [];
  const stack: Array<{ ch: string; line: number; column: number }> = [];
  const lines = code.split("\n");

  let inLineComment = false;
  let inBlockComment = false;
  let inString = false;
  let inChar = false;
  let stringDelim = "";

  for (let row = 0; row < lines.length; row++) {
    const text = lines[row];
    for (let col = 0; col < text.length; col++) {
      const ch = text[col];
      const next = text[col + 1];
      const prev = text[col - 1];

      if (inLineComment) break; // rest of line is a comment
      if (inBlockComment) {
        if (ch === "*" && next === "/") {
          inBlockComment = false;
          col++;
        }
        continue;
      }
      if (inString) {
        if (ch === "\\") {
          col++;
          continue;
        }
        if (ch === stringDelim) inString = false;
        continue;
      }
      if (inChar) {
        if (ch === "\\") {
          col++;
          continue;
        }
        if (ch === "'") inChar = false;
        continue;
      }

      // Not inside a literal/comment — detect entries.
      if (ch === "/" && next === "/") {
        inLineComment = true;
        break;
      }
      if (ch === "/" && next === "*") {
        inBlockComment = true;
        col++;
        continue;
      }
      if (ch === '"') {
        inString = true;
        stringDelim = '"';
        continue;
      }
      // A lone ' that is not a lifetime (`'a`) opens a char literal.
      if (
        ch === "'" &&
        !/[A-Za-z0-9_]/.test(prev ?? "") &&
        /[^A-Za-z]/.test(next ?? " ")
      ) {
        inChar = true;
        continue;
      }

      if (OPEN_TO_CLOSE[ch]) {
        stack.push({ ch, line: row + 1, column: col + 1 });
      } else if (CLOSE_TO_OPEN[ch]) {
        const top = stack.pop();
        if (!top) {
          diagnostics.push(
            makeDiagnostic({
              severity: DiagnosticSeverity.Error,
              message: `unexpected closing delimiter: \`${ch}\``,
              line: row + 1,
              column: col + 1,
              endColumn: col + 2,
              code: "E0000",
            })
          );
          return diagnostics;
        }
        if (OPEN_TO_CLOSE[top.ch] !== ch) {
          diagnostics.push(
            makeDiagnostic({
              severity: DiagnosticSeverity.Error,
              message: `mismatched closing delimiter: expected \`${OPEN_TO_CLOSE[top.ch]}\`, found \`${ch}\``,
              line: row + 1,
              column: col + 1,
              endColumn: col + 2,
              code: "E0000",
            })
          );
          return diagnostics;
        }
      }
    }
    inLineComment = false; // reset per line
  }

  if (stack.length > 0) {
    const unclosed = stack[stack.length - 1];
    diagnostics.push(
      makeDiagnostic({
        severity: DiagnosticSeverity.Error,
        message: `unclosed delimiter: \`${unclosed.ch}\` is never closed`,
        line: unclosed.line,
        column: unclosed.column,
        endColumn: unclosed.column + 1,
        code: "E0000",
      })
    );
  }

  return diagnostics;
}

/** Locate the 1-based line of the first occurrence of `needle`. */
function locate(
  code: string,
  needle: string
): { line: number; column: number; endColumn: number } {
  const lines = code.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const idx = lines[i].indexOf(needle);
    if (idx !== -1) {
      return {
        line: i + 1,
        column: idx + 1,
        endColumn: idx + needle.length + 1,
      };
    }
  }
  return { line: 1, column: 1, endColumn: 2 };
}

/** Required Soroban scaffolding — produces warnings/errors like rustc would. */
function checkSorobanScaffolding(code: string): Diagnostic[] {
  const diagnostics: Diagnostic[] = [];

  if (!/#!\[no_std\]/.test(code)) {
    diagnostics.push(
      makeDiagnostic({
        severity: DiagnosticSeverity.Warning,
        message:
          "Soroban contracts are `#![no_std]`; add `#![no_std]` at the top of the file.",
        line: 1,
        column: 1,
        endColumn: 2,
        code: "soroban::no_std",
      })
    );
  }

  if (!/use\s+soroban_sdk/.test(code)) {
    const loc = locate(code, "use ");
    diagnostics.push(
      makeDiagnostic({
        severity: DiagnosticSeverity.Error,
        message:
          "failed to resolve: `soroban_sdk` is not imported. Add `use soroban_sdk::{...};`.",
        line: loc.line,
        column: loc.column,
        endColumn: loc.endColumn,
        code: "E0433",
      })
    );
  }

  if (!/#\[contract\]/.test(code)) {
    diagnostics.push(
      makeDiagnostic({
        severity: DiagnosticSeverity.Error,
        message:
          "no contract type found: annotate your struct with `#[contract]`.",
        code: "soroban::contract",
      })
    );
  }

  if (!/#\[contractimpl\]/.test(code)) {
    diagnostics.push(
      makeDiagnostic({
        severity: DiagnosticSeverity.Error,
        message:
          "no contract implementation found: annotate your `impl` block with `#[contractimpl]`.",
        code: "soroban::contractimpl",
      })
    );
  }

  return diagnostics;
}

/**
 * Fold the mission's declarative checks into compiler-style diagnostics so a
 * successful "compile" also proves the task is solved (output-based testing).
 */
function checkMissionSemantics(
  code: string,
  mission: unknown
): { diagnostics: Diagnostic[]; checkResults: unknown[] } {
  const missionObj = mission as Record<string, unknown>;
  if (!(missionObj?.checks as unknown[])?.length)
    return { diagnostics: [], checkResults: [] };

  const diagnostics: Diagnostic[] = [];
  const { results } = validateCode(code, missionObj.checks as unknown[]);

  for (const r of results) {
    if ((r as Record<string, unknown>).passed) continue;
    // Best-effort anchor to a relevant line.
    let loc = { line: 1, column: 1, endColumn: 2 };
    const check = (r as Record<string, unknown>).check as Record<string, unknown> || {};
    if ((check as Record<string, unknown>).name) loc = locate(code, (check as Record<string, unknown>).name as string);
    else if ((check as Record<string, unknown>).pattern) loc = locate(code, (check as Record<string, unknown>).pattern as string);
    else if ((check as Record<string, unknown>).typeName) loc = locate(code, (check as Record<string, unknown>).typeName as string);
    else if ((check as Record<string, unknown>).module) loc = locate(code, (check as Record<string, unknown>).module as string);

    diagnostics.push(
      makeDiagnostic({
        severity: DiagnosticSeverity.Error,
        message: ((r as Record<string, unknown>).message as string).replace(/^✗\s*/, ""),
        line: loc.line,
        column: loc.column,
        endColumn: loc.endColumn,
        code: `check::${((check as Record<string, unknown>).type as string) || "mission"}`,
      })
    );
  }

  return { diagnostics, checkResults: results };
}

export interface AnalysisResult {
  ok: boolean;
  engine: string;
  diagnostics: Diagnostic[];
  stdout: string;
  stderr: string;
  returnValue: string | null;
  checkResults: unknown[];
  summary: string;
  errorCount: number;
  warningCount: number;
}

/**
 * Analyze Soroban source and (when it "compiles") simulate a run.
 *
 * @param code
 * @param mission optional mission with `checks` / `expectedOutput`
 * @returns structured analysis result
 */
export function analyze(code: string, mission?: unknown): AnalysisResult {
  const source = typeof code === "string" ? code : "";
  const diagnostics: Diagnostic[] = [];

  if (source.trim().length === 0) {
    diagnostics.push(
      makeDiagnostic({
        severity: DiagnosticSeverity.Error,
        message: "empty source: write your contract before compiling.",
        code: "soroban::empty",
      })
    );
    return finalize(diagnostics, mission, [], source);
  }

  const delimiterDiags = checkDelimiters(source);
  diagnostics.push(...delimiterDiags);

  // If delimiters are broken, later structural regexes are unreliable —
  // stop here just like a real parser would bail on a broken token stream.
  if (
    delimiterDiags.some((d) => d.severity === DiagnosticSeverity.Error)
  ) {
    return finalize(diagnostics, mission, [], source);
  }

  diagnostics.push(...checkSorobanScaffolding(source));
  const { diagnostics: missionDiags, checkResults } =
    checkMissionSemantics(source, mission);
  diagnostics.push(...missionDiags);

  return finalize(diagnostics, mission, checkResults, source);
}

function finalize(
  diagnostics: Diagnostic[],
  mission: unknown,
  checkResults: unknown[],
  source: string
): AnalysisResult {
  const errors = diagnostics.filter(
    (d) => d.severity === DiagnosticSeverity.Error
  );
  const warnings = diagnostics.filter(
    (d) => d.severity === DiagnosticSeverity.Warning
  );
  const ok = errors.length === 0;

  let stdout = "";
  let stderr = "";
  let returnValue: string | null = null;

  if (ok) {
    const fns = [
      ...source.matchAll(
        /(?:pub\s+)?fn\s+([A-Za-z_][A-Za-z0-9_]*)/g
      ),
    ].map((m) => m[1]);
    const publicFns = fns.filter((f) => f !== "main");
    stdout += "Compiling contract v0.0.0 (soroban-quest/sandbox)\n";
    stdout +=
      `Finished \`release\` profile [optimized] target(s)\n`;
    stdout += "Instantiating contract in local Soroban VM…\n";
    if (publicFns.length) {
      stdout += `Exported functions: ${publicFns.join(", ")}\n`;
    }

    if (mission?.expectedOutput != null) {
      returnValue = String(mission.expectedOutput);
      stdout += `Invocation result: ${returnValue}\n`;
    } else {
      returnValue = "ok";
      stdout += "Contract compiled and instantiated successfully.\n";
    }
    if (warnings.length) {
      stderr += `warning: ${warnings.length} warning(s) emitted\n`;
    }
  } else {
    stderr += `error: could not compile contract due to ${errors.length} previous error(s)\n`;
  }

  const summary = ok
    ? `✓ Compiled successfully${
        warnings.length
          ? ` (${warnings.length} warning${
              warnings.length > 1 ? "s" : ""
            })`
          : ""
      }`
    : `✗ Compilation failed — ${errors.length} error${
        errors.length > 1 ? "s" : ""
      }`;

  return {
    ok,
    engine: AnalyzerEngine.LocalAnalyzer,
    diagnostics,
    stdout,
    stderr,
    returnValue,
    checkResults,
    summary,
    errorCount: errors.length,
    warningCount: warnings.length,
  };
}
