/* ==========================================
   Compiler Worker — runs Soroban analysis/compilation off the UI thread.

   Message protocol (main → worker):
     { type: 'compile', id, code, mission, wasmUrl }

   Message protocol (worker → main):
     { type: 'ready' }                              on startup
     { type: 'result', id, result }                 on success
     { type: 'error',  id, message }                on failure

   The worker first tries to load a real WASM compiler module when a
   `wasmUrl` is provided (future Soroban toolchain — Option A/B in the
   issue). When none is available it falls back to the shared local
   analyzer so the feature degrades gracefully instead of blocking.
   ========================================== */

import { analyze } from "./sorobanAnalyzer";

// Cache of a loaded real-WASM compiler, if one ever gets wired in.
let wasmModule: unknown = null;
let wasmTried = false;

async function loadWasm(wasmUrl: string | null): Promise<unknown> {
  if (!wasmUrl || wasmTried) return wasmModule;
  wasmTried = true;
  try {
    // A real toolchain module is expected to export `compileAndRun(code)`.
    // This is intentionally dynamic so the bundle stays small until a real
    // compiler artifact exists.
    const mod = await import(/* @vite-ignore */ wasmUrl);
    if (mod && typeof mod.compileAndRun === "function") {
      wasmModule = mod;
    }
  } catch {
    wasmModule = null; // fall back to the local analyzer
  }
  return wasmModule;
}

async function compile({
  code,
  mission,
  wasmUrl,
}: {
  code: string;
  mission: unknown;
  wasmUrl: string | null;
}): Promise<unknown> {
  const wasm = await loadWasm(wasmUrl);
  if (wasm && typeof (wasm as Record<string, unknown>).compileAndRun === 'function') {
    // Real compiler path (when available). Normalize its output to our shape.
    const raw = await (wasm as Record<string, unknown> & { compileAndRun(code: string): Promise<Record<string, unknown>> }).compileAndRun(code);
    return {
      ok: !!raw.ok,
      engine: "wasm",
      diagnostics: (raw.diagnostics as unknown[]) || [],
      stdout: (raw.stdout as string) || "",
      stderr: (raw.stderr as string) || "",
      returnValue: (raw.returnValue as unknown) ?? null,
      checkResults: [],
      summary: raw.ok
        ? "✓ Compiled successfully (WASM)"
        : "✗ Compilation failed (WASM)",
      errorCount: ((raw.diagnostics as Array<{ severity?: string }>) || []).filter(
        (d) => d.severity === "error"
      ).length,
      warningCount: ((raw.diagnostics as Array<{ severity?: string }>) || []).filter(
        (d) => d.severity === "warning"
      ).length,
    };
  }
  // Graceful fallback: local static analysis.
  return analyze(code, mission);
}

const ctx = self as unknown as { onmessage: ((event: MessageEvent) => Promise<void>) | null; postMessage(msg: unknown): void };

ctx.onmessage = async (event: MessageEvent) => {
  const data = event.data as Record<string, unknown> | null || {};
  if ((data as Record<string, unknown>).type !== "compile") return;
  const { id } = data as { id?: unknown };
  try {
    const result = await compile(data as { code?: string; mission?: unknown; wasmUrl?: string | null });
    (ctx as unknown as { postMessage(msg: unknown): void }).postMessage({ type: "result", id, result });
  } catch (err) {
    (ctx as unknown as { postMessage(msg: unknown): void }).postMessage({
      type: "error",
      id,
      message: (err as Record<string, unknown>)?.message
        ? (err as Record<string, unknown>).message
        : String(err),
    });
  }
};

// Signal readiness so the host can resolve init().
(ctx as unknown as { postMessage(msg: unknown): void }).postMessage({ type: "ready" });
