/* ==========================================
   WasmCompiler — real-compilation front-end for Soroban Quest

   Implements the architecture requested in issue #224:

     • Runs compilation in a Web Worker so the UI never blocks.
     • Enforces a hard compilation timeout (default 10s) and recovers the
       worker if a run hangs.
     • Exposes a single `compileAndRun(code, mission)` API returning a
       structured result (diagnostics + stdout/stderr + return value).
     • Converts diagnostics into Monaco markers (integrates with
       liveValidator's marker pipeline).
     • Degrades gracefully: if Web Workers or a real WASM toolchain are
       unavailable (SSR, tests, old browsers, load failure) it runs the
       same analysis inline on the main thread — the "fallback to pattern
       matching" required by the issue.

   Real-toolchain hook
   -------------------
   Point a real Soroban/rustc-in-WASM artifact at the compiler by setting
   `VITE_SOROBAN_WASM_URL` (module exporting `compileAndRun(code)`). When
   present it is used; otherwise the local analyzer runs. This keeps the
   default bundle small while leaving Option A/B from the issue open.
   ========================================== */

import { analyze, DiagnosticSeverity } from "./sorobanAnalyzer";

export const DEFAULT_TIMEOUT_MS = 10_000;
export const COMPILE_MARKER_OWNER = "soroban-quest-compile";

// monaco.MarkerSeverity numeric values (kept local to avoid importing monaco here).
const MONACO_SEVERITY: Record<string, number> = {
  error: 8,
  warning: 4,
  info: 2,
  hint: 1,
};

function resolveWasmUrl(): string | null {
  try {
    // Vite injects import.meta.env; guard for non-Vite (test) contexts.
    return (import.meta.env as Record<string, unknown>)?.VITE_SOROBAN_WASM_URL || null;
  } catch {
    return null;
  }
}

interface PendingEntry {
  resolve: (result: unknown) => void;
  reject: (error: Error) => void;
  timer: ReturnType<typeof setTimeout>;
}

export interface CompileResult {
  ok: boolean;
  engine: string;
  diagnostics: unknown[];
  stdout: string;
  stderr: string;
  returnValue: string | null;
  checkResults: unknown[];
  summary: string;
  errorCount: number;
  warningCount: number;
  fellBack?: boolean;
  durationMs?: number;
}

export interface MonacoMarker {
  severity: number;
  message: string;
  startLineNumber: number;
  startColumn: number;
  endLineNumber: number;
  endColumn: number;
  source: string;
  code: string;
}

export class WasmCompiler {
  timeoutMs: number;
  wasmUrl: string | null;
  worker: Worker | null;
  readyPromise: Promise<boolean> | null;
  _seq: number;
  _pending: Map<number, PendingEntry>;
  _supportsWorker: boolean;

  constructor(options: {
    timeoutMs?: number;
    wasmUrl?: string | null;
  } = {}) {
    this.timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    this.wasmUrl = options.wasmUrl ?? resolveWasmUrl();
    this.worker = null;
    this.readyPromise = null;
    this._seq = 0;
    this._pending = new Map();
    this._supportsWorker =
      typeof Worker !== "undefined" &&
      typeof URL !== "undefined";
  }

  /** Lazily spin up the worker. Resolves to true if the worker is live. */
  init(): Promise<boolean> {
    if (!this._supportsWorker) return Promise.resolve(false);
    if (this.readyPromise) return this.readyPromise;

    this.readyPromise = new Promise((resolve) => {
      try {
        this.worker = new Worker(
          new URL("./compilerWorker.ts", import.meta.url),
          { type: "module" }
        );
      } catch {
        this.worker = null;
        resolve(false);
        return;
      }

      const onReady = (event: MessageEvent) => {
        if (event.data?.type === "ready") {
          (this.worker as Worker).removeEventListener("message", onReady);
          resolve(true);
        }
      };
      (this.worker as Worker).addEventListener("message", onReady);
      (this.worker as Worker).addEventListener(
        "message",
        (e) => this._onMessage(e)
      );
      (this.worker as Worker).addEventListener("error", () => {
        // A worker-level error rejects everything in flight.
        this._failAll(new Error("compiler worker crashed"));
        resolve(false);
      });
    });

    return this.readyPromise;
  }

  _onMessage(event: MessageEvent): void {
    const data = event.data || {};
    if (data.type !== "result" && data.type !== "error") return;
    const entry = this._pending.get(data.id);
    if (!entry) return;
    clearTimeout(entry.timer);
    this._pending.delete(data.id);
    if (data.type === "result") entry.resolve(data.result);
    else
      entry.reject(
        new Error(data.message || "compilation error")
      );
  }

  _failAll(err: Error): void {
    for (const [, entry] of this._pending) {
      clearTimeout(entry.timer);
      entry.reject(err);
    }
    this._pending.clear();
  }

  /**
   * Compile (and simulate a run of) the given code.
   *
   * @param code
   * @param mission optional mission object
   * @returns structured compile result (never rejects on a
   *   normal timeout/worker failure — it falls back and always resolves).
   */
  async compileAndRun(code: string, mission?: unknown): Promise<CompileResult> {
    const started = nowMs();
    let result: CompileResult;

    const live = await this.init();
    if (live && this.worker) {
      try {
        result = await this._compileInWorker(code, mission);
      } catch {
        // Worker hung/crashed — fall back inline so the user still gets output.
        result = { ...analyze(code, mission), fellBack: true };
      }
    } else {
      result = analyze(code, mission);
    }

    return {
      ...result,
      durationMs: Math.max(0, Math.round(nowMs() - started)),
    };
  }

  _compileInWorker(code: string, mission?: unknown): Promise<CompileResult> {
    const id = ++this._seq;
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this._pending.delete(id);
        this._recycleWorker();
        reject(
          new Error(
            `compilation timed out after ${this.timeoutMs}ms`
          )
        );
      }, this.timeoutMs);

      this._pending.set(id, { resolve, reject, timer });
      (this.worker as Worker).postMessage({
        type: "compile",
        id,
        code,
        mission: serializableMission(mission),
        wasmUrl: this.wasmUrl,
      });
    });
  }

  /** Terminate and forget the worker so the next compile starts fresh. */
  _recycleWorker(): void {
    if (this.worker) {
      try {
        this.worker.terminate();
      } catch {
        /* ignore */
      }
    }
    this.worker = null;
    this.readyPromise = null;
    this._failAll(new Error("worker recycled after timeout"));
  }

  /** Tear everything down (call on unmount). */
  dispose(): void {
    if (this.worker) {
      try {
        this.worker.terminate();
      } catch {
        /* ignore */
      }
    }
    this.worker = null;
    this.readyPromise = null;
    this._failAll(new Error("compiler disposed"));
  }

  /**
   * Convert analyzer diagnostics into Monaco markers.
   * @param diagnostics
   * @returns monaco marker objects
   */
  static toMonacoMarkers(
    diagnostics: unknown[] = []
  ): MonacoMarker[] {
    return (diagnostics as Array<Record<string, unknown>>).map((d) => ({
      severity: MONACO_SEVERITY[d.severity] ?? MONACO_SEVERITY.info,
      message: d.message,
      startLineNumber: d.line || 1,
      startColumn: d.column || 1,
      endLineNumber: d.line || 1,
      endColumn: d.endColumn || (d.column || 1) + 1,
      source: "soroban-compiler",
      code: d.code,
    }));
  }
}

/** Strip a mission down to the fields the analyzer needs (structured-clone safe). */
function serializableMission(mission: unknown): unknown {
  if (!mission) return null;
  const missionObj = mission as Record<string, unknown>;
  return {
    id: missionObj.id,
    checks: missionObj.checks,
    expectedOutput: missionObj.expectedOutput,
  };
}

function nowMs(): number {
  try {
    if (
      typeof performance !== "undefined" &&
      performance.now
    ) {
      return performance.now();
    }
  } catch {
    /* ignore */
  }
  return 0;
}

// Re-export for convenience so callers can filter by severity without a second import.
export { DiagnosticSeverity };

// Shared singleton — most callers just want one compiler for the app.
let singleton: WasmCompiler | null = null;
export function getWasmCompiler(options?: {
  timeoutMs?: number;
  wasmUrl?: string | null;
}): WasmCompiler {
  if (!singleton) singleton = new WasmCompiler(options);
  return singleton;
}
