/*
 * These tests dispatch synthetic messages to the worker's onmessage handler.
 * Importing the worker after installing a self stub keeps its real global
 * wiring intact while allowing Vitest's Node environment to observe
 * postMessage calls without starting a browser Worker.
 */

import { beforeAll, afterAll, beforeEach, describe, expect, it, vi } from 'vitest';

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

let workerScope;

async function dispatch(data) {
  await workerScope.onmessage({ data });
  return workerScope.postMessage.mock.calls.at(-1)?.[0];
}

describe('compilerWorker', () => {
  beforeAll(async () => {
    workerScope = {
      onmessage: null,
      postMessage: vi.fn(),
    };
    vi.stubGlobal('self', workerScope);
    await import('../compilerWorker.js');
  });

  beforeEach(() => {
    workerScope.postMessage.mockClear();
  });

  afterAll(() => {
    vi.unstubAllGlobals();
  });

  it('posts a result with the analyzer success shape for a compile request', async () => {
    const message = await dispatch({
      type: 'compile',
      id: 'success-1',
      code: GOOD,
    });

    expect(message).toMatchObject({
      type: 'result',
      id: 'success-1',
      result: {
        ok: true,
        engine: 'local-analyzer',
        diagnostics: [],
        stdout: expect.stringContaining('Finished'),
        stderr: '',
        returnValue: 'ok',
        errorCount: 0,
      },
    });
  });

  it('posts an error message instead of leaking a malformed request exception', async () => {
    const message = await dispatch({
      type: 'compile',
      id: 'invalid-1',
      code: GOOD,
      mission: { checks: [null] },
    });

    expect(message).toEqual({
      type: 'error',
      id: 'invalid-1',
      message: expect.any(String),
    });
  });

  it('keeps independent compile results isolated across requests', async () => {
    const first = await dispatch({
      type: 'compile',
      id: 'request-1',
      code: GOOD,
      mission: { expectedOutput: 'first result' },
    });
    const second = await dispatch({
      type: 'compile',
      id: 'request-2',
      code: GOOD,
      mission: { expectedOutput: 'second result' },
    });

    expect(first).toMatchObject({
      type: 'result',
      id: 'request-1',
      result: { returnValue: 'first result' },
    });
    expect(second).toMatchObject({
      type: 'result',
      id: 'request-2',
      result: { returnValue: 'second result' },
    });
  });
});