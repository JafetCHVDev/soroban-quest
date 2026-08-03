import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { runLiveValidation, createDebouncedValidator } from '../liveValidator';
import { Severity } from '../liveValidator';

describe('runLiveValidation', () => {
  const sampleCode = `
    pub fn hello(x: i32) -> i32 {
        x + 1
    }
  `;

  it('returns zero markers when mission has no checks', () => {
    const result = runLiveValidation(sampleCode, { checks: [] });
    expect(result.markers).toHaveLength(0);
    expect(result.passCount).toBe(0);
    expect(result.totalCount).toBe(0);
  });

  it('returns zero when mission is null', () => {
    const result = runLiveValidation(sampleCode, null);
    expect(result.markers).toHaveLength(0);
    expect(result.passCount).toBe(0);
    expect(result.totalCount).toBe(0);
  });

  it('passes has_function check when function exists', () => {
    const result = runLiveValidation(sampleCode, {
      checks: [{ type: 'has_function', name: 'hello' }]
    });
    expect(result.passCount).toBe(1);
    expect(result.totalCount).toBe(1);
    expect(result.markers).toHaveLength(0);
  });

  it('fails has_function check when function is missing', () => {
    const result = runLiveValidation(sampleCode, {
      checks: [{ type: 'has_function', name: 'nonexistent' }]
    });
    expect(result.passCount).toBe(0);
    expect(result.totalCount).toBe(1);
    expect(result.markers).toHaveLength(1);
    expect(result.markers[0].severity).toBe(Severity.Warning);
  });

  it('validates function parameters', () => {
    const code = `pub fn greet(name: Symbol) -> i32 { 0 }`;
    const result = runLiveValidation(code, {
      checks: [{ type: 'has_function', name: 'greet', params: ['name'] }]
    });
    expect(result.passCount).toBe(1);
  });

  it('fails on wrong function parameters', () => {
    const result = runLiveValidation(sampleCode, {
      checks: [{ type: 'has_function', name: 'hello', params: ['y', 'z'] }]
    });
    expect(result.markers).toHaveLength(1);
    expect(result.markers[0].message).toContain('parameters');
  });

  it('passes has_attribute when attribute exists', () => {
    const code = `#[contract]
pub struct MyContract;`;
    const result = runLiveValidation(code, {
      checks: [{ type: 'has_attribute', attribute: 'contract' }]
    });
    expect(result.passCount).toBe(1);
  });

  it('fails has_attribute when missing', () => {
    const result = runLiveValidation(sampleCode, {
      checks: [{ type: 'has_attribute', attribute: 'contractimpl' }]
    });
    expect(result.markers).toHaveLength(1);
    expect(result.markers[0].severity).toBe(Severity.Error);
  });

  it('passes uses_type when type is present', () => {
    const code = `let x: i32 = 5;`;
    const result = runLiveValidation(code, {
      checks: [{ type: 'uses_type', typeName: 'i32' }]
    });
    expect(result.passCount).toBe(1);
  });

  it('passes balanced_braces for balanced code', () => {
    const result = runLiveValidation(sampleCode, {
      checks: [{ type: 'balanced_braces' }]
    });
    expect(result.passCount).toBe(1);
  });

  it('fails balanced_braces for unbalanced code', () => {
    const result = runLiveValidation('{', {
      checks: [{ type: 'balanced_braces' }]
    });
    expect(result.markers).toHaveLength(1);
  });

  it('passes has_struct when struct exists', () => {
    const code = `pub struct MyStruct { x: i32 }`;
    const result = runLiveValidation(code, {
      checks: [{ type: 'has_struct', name: 'MyStruct' }]
    });
    expect(result.passCount).toBe(1);
  });

  it('passes has_import when import exists', () => {
    const code = `use soroban_sdk::contract;`;
    const result = runLiveValidation(code, {
      checks: [{ type: 'has_import', module: 'soroban_sdk' }]
    });
    expect(result.passCount).toBe(1);
  });

  it('handles multiple check types simultaneously', () => {
    const code = `
      use soroban_sdk::contract;
      #[contract]
      pub struct MyContract;
      pub fn greet(name: Symbol) -> i32 { 0 }
    `;
    const result = runLiveValidation(code, {
      checks: [
        { type: 'has_import', module: 'soroban_sdk' },
        { type: 'has_attribute', attribute: 'contract' },
        { type: 'has_struct', name: 'MyContract' },
        { type: 'has_function', name: 'greet' },
      ]
    });
    expect(result.passCount).toBe(4);
    expect(result.totalCount).toBe(4);
  });
});

describe('createDebouncedValidator', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('does not call onResult immediately', () => {
    const onResult = vi.fn();
    const validator = createDebouncedValidator(500, onResult);
    validator.call('code', { checks: [] });
    expect(onResult).not.toHaveBeenCalled();
  });

  it('calls onResult after debounce delay', () => {
    const onResult = vi.fn();
    const validator = createDebouncedValidator(500, onResult);
    validator.call('code', { checks: [] });
    vi.advanceTimersByTime(500);
    expect(onResult).toHaveBeenCalledTimes(1);
  });

  it('resets debounce on rapid successive calls', () => {
    const onResult = vi.fn();
    const validator = createDebouncedValidator(500, onResult);
    validator.call('code', { checks: [] });
    vi.advanceTimersByTime(300);
    validator.call('code', { checks: [] });
    vi.advanceTimersByTime(300);
    expect(onResult).not.toHaveBeenCalled();
    vi.advanceTimersByTime(200);
    expect(onResult).toHaveBeenCalledTimes(1);
  });

  it('cancel prevents pending execution', () => {
    const onResult = vi.fn();
    const validator = createDebouncedValidator(500, onResult);
    validator.call('code', { checks: [] });
    validator.cancel();
    vi.advanceTimersByTime(500);
    expect(onResult).not.toHaveBeenCalled();
  });

  it('passes validation result to callback', () => {
    const onResult = vi.fn();
    const validator = createDebouncedValidator(500, onResult);
    validator.call('pub fn foo() {}', {
      checks: [{ type: 'has_function', name: 'foo' }]
    });
    vi.advanceTimersByTime(500);
    expect(onResult).toHaveBeenCalledWith(
      expect.objectContaining({ passCount: 1, totalCount: 1 })
    );
  });

  it('handles multiple calls with different code', () => {
    const onResult = vi.fn();
    const validator = createDebouncedValidator(100, onResult);
    validator.call('pub fn foo() {}', {
      checks: [{ type: 'has_function', name: 'foo' }]
    });
    vi.advanceTimersByTime(100);
    expect(onResult.mock.calls[0][0].passCount).toBe(1);

    validator.call('pub fn bar() {}', {
      checks: [{ type: 'has_function', name: 'bar' }]
    });
    vi.advanceTimersByTime(100);
    expect(onResult.mock.calls[1][0].passCount).toBe(1);
    expect(onResult).toHaveBeenCalledTimes(2);
  });
});

describe('Severity constants', () => {
  it('has correct severity values', () => {
    expect(Severity.Error).toBe(8);
    expect(Severity.Warning).toBe(4);
    expect(Severity.Info).toBe(2);
    expect(Severity.Hint).toBe(1);
  });
});
