import { describe, it, expect } from 'vitest';
import { analyze, DiagnosticSeverity, AnalyzerEngine } from '../sorobanAnalyzer.js';
import { WasmCompiler } from '../wasmCompiler.js';

const GOOD = `#![no_std]
use soroban_sdk::{contract, contractimpl, symbol_short, vec, Env, Symbol, Vec};

#[contract]
pub struct HelloContract;

#[contractimpl]
impl HelloContract {
    pub fn hello(env: Env, to: Symbol) -> Vec<Symbol> {
        vec![&env, symbol_short!("Hello"), to]
    }
}`;

describe('sorobanAnalyzer', () => {
  it('compiles well-formed Soroban code', () => {
    const res = analyze(GOOD);
    expect(res.ok).toBe(true);
    expect(res.engine).toBe(AnalyzerEngine.LocalAnalyzer);
    expect(res.errorCount).toBe(0);
    expect(res.stdout).toContain('Finished');
    expect(res.stdout).toContain('hello');
  });

  it('reports an unclosed delimiter with a line number', () => {
    const broken = GOOD.replace(/\}$/, ''); // drop the final brace
    const res = analyze(broken);
    expect(res.ok).toBe(false);
    const delim = res.diagnostics.find((d) => /delimiter/.test(d.message));
    expect(delim).toBeTruthy();
    expect(delim.severity).toBe(DiagnosticSeverity.Error);
    expect(delim.line).toBeGreaterThan(0);
  });

  it('flags an unexpected closing delimiter', () => {
    const res = analyze('fn a() }');
    expect(res.ok).toBe(false);
    expect(res.diagnostics.some((d) => /unexpected closing/.test(d.message))).toBe(true);
  });

  it('flags a mismatched closing delimiter', () => {
    const res = analyze('fn a() { )');
    expect(res.ok).toBe(false);
    expect(res.diagnostics.some((d) => /mismatched closing/.test(d.message))).toBe(true);
  });

  it('ignores delimiters inside strings and comments', () => {
    const res = analyze(`${GOOD}\n// a stray } in a comment and "a { in a string"`);
    expect(res.ok).toBe(true);
  });

  it('errors when soroban_sdk import is missing', () => {
    const res = analyze(`#![no_std]\n#[contract]\npub struct C;\n#[contractimpl]\nimpl C {}`);
    expect(res.ok).toBe(false);
    expect(res.diagnostics.some((d) => d.code === 'E0433')).toBe(true);
  });

  it('warns when #![no_std] is missing but still compiles', () => {
    const noStd = GOOD.replace('#![no_std]\n', '');
    const res = analyze(noStd);
    expect(res.ok).toBe(true);
    expect(res.warningCount).toBeGreaterThan(0);
  });

  it('folds mission checks into diagnostics', () => {
    const mission = { checks: [{ type: 'has_function', name: 'transfer' }] };
    const res = analyze(GOOD, mission);
    expect(res.ok).toBe(false);
    expect(res.diagnostics.some((d) => d.code === 'check::has_function')).toBe(true);
  });

  it('reports the empty-source case', () => {
    const res = analyze('   ');
    expect(res.ok).toBe(false);
    expect(res.diagnostics[0].code).toBe('soroban::empty');
  });

  it('echoes expectedOutput as the invocation result', () => {
    const res = analyze(GOOD, { expectedOutput: 42 });
    expect(res.ok).toBe(true);
    expect(res.returnValue).toBe('42');
    expect(res.stdout).toContain('42');
  });
});

describe('WasmCompiler', () => {
  it('falls back to inline analysis when workers are unavailable', async () => {
    const compiler = new WasmCompiler();
    // Node/vitest has no Worker → the fallback path runs.
    const res = await compiler.compileAndRun(GOOD);
    expect(res.ok).toBe(true);
    expect(typeof res.durationMs).toBe('number');
    compiler.dispose();
  });

  it('maps diagnostics to Monaco markers', () => {
    const res = analyze('fn a() { )');
    const markers = WasmCompiler.toMonacoMarkers(res.diagnostics);
    expect(markers.length).toBeGreaterThan(0);
    const m = markers[0];
    expect(m.severity).toBe(8); // monaco Error
    expect(m.source).toBe('soroban-compiler');
    expect(m.startLineNumber).toBeGreaterThan(0);
    expect(m.endColumn).toBeGreaterThanOrEqual(m.startColumn);
  });
});
