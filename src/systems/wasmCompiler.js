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

import { analyze, DiagnosticSeverity } from './sorobanAnalyzer.js';

export const DEFAULT_TIMEOUT_MS = 10_000;
export const COMPILE_MARKER_OWNER = 'soroban-quest-compile';

// monaco.MarkerSeverity numeric values (kept local to avoid importing monaco here).
const MONACO_SEVERITY = { error: 8, warning: 4, info: 2, hint: 1 };

function resolveWasmUrl() {
  try {
    // Vite injects import.meta.env; guard for non-Vite (test) contexts.
    return import.meta.env?.VITE_SOROBAN_WASM_URL || null;
  } catch {
    return null;
  }
}

export class WasmCompiler {
  constructor({ timeoutMs = DEFAULT_TIMEOUT_MS, wasmUrl = resolveWasmUrl() } = {}) {
    this.timeoutMs = timeoutMs;
    this.wasmUrl = wasmUrl;
    this.worker = null;
    this.readyPromise = null;
    this._seq = 0;
    this._pending = new Map(); // id -> { resolve, reject, timer }
    this._supportsWorker =
      typeof Worker !== 'undefined' && typeof URL !== 'undefined';
  }

  /** Lazily spin up the worker. Resolves to true if the worker is live. */
  init() {
    if (!this._supportsWorker) return Promise.resolve(false);
    if (this.readyPromise) return this.readyPromise;

    this.readyPromise = new Promise((resolve) => {
      try {
        this.worker = new Worker(
          new URL('./compilerWorker.js', import.meta.url),
          { type: 'module' },
        );
      } catch {
        this.worker = null;
        resolve(false);
        return;
      }

      const onReady = (event) => {
        if (event.data?.type === 'ready') {
          this.worker.removeEventListener('message', onReady);
          resolve(true);
        }
      };
      this.worker.addEventListener('message', onReady);
      this.worker.addEventListener('message', (e) => this._onMessage(e));
      this.worker.addEventListener('error', () => {
        // A worker-level error rejects everything in flight.
        this._failAll(new Error('compiler worker crashed'));
        resolve(false);
      });
    });

    return this.readyPromise;
  }

  _onMessage(event) {
    const data = event.data || {};
    if (data.type !== 'result' && data.type !== 'error') return;
    const entry = this._pending.get(data.id);
    if (!entry) return;
    clearTimeout(entry.timer);
    this._pending.delete(data.id);
    if (data.type === 'result') entry.resolve(data.result);
    else entry.reject(new Error(data.message || 'compilation error'));
  }

  _failAll(err) {
    for (const [, entry] of this._pending) {
      clearTimeout(entry.timer);
      entry.reject(err);
    }
    this._pending.clear();
  }

  /**
   * Compile (and simulate a run of) the given code.
   *
   * @param {string} code
   * @param {object} [mission]
   * @returns {Promise<object>} structured compile result (never rejects on a
   *   normal timeout/worker failure — it falls back and always resolves).
   */
  async compileAndRun(code, mission) {
    const started = nowMs();
    let result;

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

    return { ...result, durationMs: Math.max(0, Math.round(nowMs() - started)) };
  }

  _compileInWorker(code, mission) {
    const id = ++this._seq;
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this._pending.delete(id);
        this._recycleWorker();
        reject(new Error(`compilation timed out after ${this.timeoutMs}ms`));
      }, this.timeoutMs);

      this._pending.set(id, { resolve, reject, timer });
      this.worker.postMessage({
        type: 'compile',
        id,
        code,
        mission: serializableMission(mission),
        wasmUrl: this.wasmUrl,
      });
    });
  }

  /** Terminate and forget the worker so the next compile starts fresh. */
  _recycleWorker() {
    if (this.worker) {
      try { this.worker.terminate(); } catch { /* ignore */ }
    }
    this.worker = null;
    this.readyPromise = null;
    this._failAll(new Error('worker recycled after timeout'));
  }

  /** Tear everything down (call on unmount). */
  dispose() {
    if (this.worker) {
      try { this.worker.terminate(); } catch { /* ignore */ }
    }
    this.worker = null;
    this.readyPromise = null;
    this._failAll(new Error('compiler disposed'));
  }

  /**
   * Convert analyzer diagnostics into Monaco markers.
   * @param {Array} diagnostics
   * @returns {Array} monaco marker objects
   */
  static toMonacoMarkers(diagnostics = []) {
    return diagnostics.map((d) => ({
      severity: MONACO_SEVERITY[d.severity] ?? MONACO_SEVERITY.info,
      message: d.message,
      startLineNumber: d.line || 1,
      startColumn: d.column || 1,
      endLineNumber: d.line || 1,
      endColumn: d.endColumn || (d.column || 1) + 1,
      source: 'soroban-compiler',
      code: d.code,
    }));
  }
}

/** Strip a mission down to the fields the analyzer needs (structured-clone safe). */
function serializableMission(mission) {
  if (!mission) return null;
  return {
    id: mission.id,
    checks: mission.checks,
    expectedOutput: mission.expectedOutput,
  };
}

function nowMs() {
  try {
    if (typeof performance !== 'undefined' && performance.now) return performance.now();
  } catch { /* ignore */ }
  return 0;
}

// Re-export for convenience so callers can filter by severity without a second import.
export { DiagnosticSeverity };

// Shared singleton — most callers just want one compiler for the app.
let singleton = null;
export function getWasmCompiler(options) {
  if (!singleton) singleton = new WasmCompiler(options);
  return singleton;
}
