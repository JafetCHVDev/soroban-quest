import { describe, it, expect, vi } from 'vitest';
import { extractFunctions, lintSecurity } from '../securityLinter.js';

vi.mock('../../data/missions/hello-soroban.md?raw', () => ({
  default: `---
id: hello-soroban
chapter: 1
order: 1
difficulty: beginner
xp: 100
title: The First Contract
learningGoal: Create your first Soroban smart contract with a hello function
hints:
  - hint
---
# Story
`,
}));

import { missions } from '../../data/missions.js';

describe('extractFunctions', () => {
  it('extracts pub and private functions with params and bodies', () => {
    const code = `
pub fn transfer(env: Env, from: Address, amount: i128) {
    from.require_auth();
    env.storage().instance().set(&from, &amount);
}

fn helper(x: i32) -> i32 {
    x + 1
}
`;
    const fns = extractFunctions(code);
    expect(fns.map((f) => f.name)).toEqual(['transfer', 'helper']);
    expect(fns[0].isPub).toBe(true);
    expect(fns[0].params).toContain('from: Address');
    expect(fns[0].body).toContain('require_auth');
    expect(fns[1].isPub).toBe(false);
  });

  it('skips functions that appear only inside comments or strings', () => {
    const code = `
// pub fn commented(env: Env) { env.storage().instance().set(&K, &1); }
pub fn real(env: Env) {
    let s = "fn fake() {}";
    env.storage().instance().set(&K, &1);
}
`;
    const fns = extractFunctions(code);
    expect(fns.map((f) => f.name)).toEqual(['real']);
  });
});

describe('lintSecurity', () => {
  it('returns an empty list for empty or non-string input', () => {
    expect(lintSecurity('')).toEqual([]);
    expect(lintSecurity('   ')).toEqual([]);
    expect(lintSecurity(null)).toEqual([]);
    expect(lintSecurity(undefined)).toEqual([]);
  });

  describe('missing-auth', () => {
    it('flags a pub fn with an Address actor param that writes storage without require_auth', () => {
      const code = `
pub fn transfer(env: Env, from: Address, to: Address, amount: i128) {
    env.storage().instance().set(&from, &amount);
}
`;
      const notes = lintSecurity(code);
      expect(notes.some((n) => n.rule === 'missing-auth')).toBe(true);
      const note = notes.find((n) => n.rule === 'missing-auth');
      expect(note.functionName).toBe('transfer');
      expect(note.severity).toBe('warning');
      expect(note.titleKey).toBe('missionDetail.securityNotes.rules.missingAuth.title');
    });

    it('does not flag increment(env: Env) storage writes without an Address param', () => {
      const code = `
pub fn increment(env: Env) -> u32 {
    let count: u32 = env.storage().instance().get(&COUNTER).unwrap_or(0);
    env.storage().instance().set(&COUNTER, &(count + 1));
    count + 1
}
`;
      expect(lintSecurity(code).filter((n) => n.rule === 'missing-auth')).toEqual([]);
    });

    it('does not flag require_auth before the storage write', () => {
      const code = `
pub fn transfer(env: Env, from: Address, to: Address, amount: i128) {
    from.require_auth();
    env.storage().instance().set(&from, &amount);
}
`;
      expect(lintSecurity(code).filter((n) => n.rule === 'missing-auth')).toEqual([]);
    });

    it('does not flag init even when it stores an Address without require_auth', () => {
      const code = `
pub fn init(env: Env, admin: Address) {
    env.storage().instance().set(&ADMIN, &admin);
}
`;
      expect(lintSecurity(code).filter((n) => n.rule === 'missing-auth')).toEqual([]);
    });

    it('flags privileged admin writers that omit require_auth even without an Address param', () => {
      const code = `
pub fn set_fee(env: Env, new_fee: i128) {
    env.storage().instance().set(&FEE, &new_fee);
}
`;
      const notes = lintSecurity(code).filter((n) => n.rule === 'missing-auth');
      expect(notes).toHaveLength(1);
      expect(notes[0].functionName).toBe('set_fee');
    });

    it('does not flag flash_loan recording a borrower without require_auth', () => {
      const code = `
pub fn flash_loan(env: Env, borrower: Address, amount: i128) {
    env.storage().instance().set(&POOL, &amount);
    env.storage().instance().set(&(borrower, LOAN), &amount);
}
`;
      expect(lintSecurity(code).filter((n) => n.rule === 'missing-auth')).toEqual([]);
    });

    it('does not flag require_auth after a mutex storage write', () => {
      const code = `
pub fn withdraw(env: Env, user: Address, amount: i128) -> i128 {
    env.storage().instance().set(&MUTEX, &true);
    user.require_auth();
    env.storage().instance().set(&(user, BALANCE), &0);
    env.storage().instance().set(&MUTEX, &false);
    amount
}
`;
      expect(lintSecurity(code).filter((n) => n.rule === 'missing-auth')).toEqual([]);
    });

    it('does not flag collect updating billing state without user auth', () => {
      const code = `
pub fn collect(env: Env, user: Address) -> i128 {
    env.storage().instance().set(&(user, NEXT_BILLING), &1);
    100
}
`;
      expect(lintSecurity(code).filter((n) => n.rule === 'missing-auth')).toEqual([]);
    });
  });

  describe('unchecked-arithmetic', () => {
    it('flags wrapping arithmetic on token amounts', () => {
      const code = `
pub fn mint(env: Env, amount: i128) {
    let balance: i128 = env.storage().persistent().get(&K).unwrap_or(0);
    let next = balance.wrapping_add(amount);
    env.storage().persistent().set(&K, &next);
}
`;
      const notes = lintSecurity(code).filter((n) => n.rule === 'unchecked-arithmetic');
      expect(notes.length).toBeGreaterThan(0);
      expect(notes[0].severity).toBe('warning');
    });

    it('flags multiplying two amount-like i128 values without checked_mul', () => {
      const code = `
pub fn quote(env: Env, amount: i128, balance: i128) -> i128 {
    amount * balance
}
`;
      const notes = lintSecurity(code).filter((n) => n.rule === 'unchecked-arithmetic');
      expect(notes.length).toBeGreaterThan(0);
    });

    it('does not flag count + 1', () => {
      const code = `
pub fn increment(env: Env) -> u32 {
    let count: u32 = env.storage().instance().get(&COUNTER).unwrap_or(0);
    env.storage().instance().set(&COUNTER, &(count + 1));
    count + 1
}
`;
      expect(lintSecurity(code).filter((n) => n.rule === 'unchecked-arithmetic')).toEqual([]);
    });

    it('does not flag balance + amount without wrapping or multiplication', () => {
      const code = `
pub fn mint(env: Env, to: Address, amount: i128) {
    let balance: i128 = env.storage().persistent().get(&to).unwrap_or(0);
    env.storage().persistent().set(&to, &(balance + amount));
}
`;
      expect(lintSecurity(code).filter((n) => n.rule === 'unchecked-arithmetic')).toEqual([]);
    });
  });

  describe('reentrancy-ordering', () => {
    it('flags an external call before a later storage write', () => {
      const code = `
pub fn withdraw(env: Env, token: Address, to: Address, amount: i128) {
    env.invoke_contract(&token, &symbol_short!("xfer"), vec![&env, to, amount]);
    env.storage().instance().set(&BAL, &0);
}
`;
      const notes = lintSecurity(code).filter((n) => n.rule === 'reentrancy-ordering');
      expect(notes.length).toBeGreaterThan(0);
      expect(notes[0].severity).toBe('warning');
    });

    it('does not flag storage write then external call', () => {
      const code = `
pub fn withdraw(env: Env, token: Address, to: Address, amount: i128) {
    env.storage().instance().set(&BAL, &0);
    env.invoke_contract(&token, &symbol_short!("xfer"), vec![&env, to, amount]);
}
`;
      expect(lintSecurity(code).filter((n) => n.rule === 'reentrancy-ordering')).toEqual([]);
    });

    it('does not flag a local pub fn transfer definition as an external call', () => {
      const code = `
pub fn transfer(env: Env, from: Address, to: Address, amount: i128) {
    from.require_auth();
    env.storage().persistent().set(&from, &amount);
}
`;
      expect(lintSecurity(code).filter((n) => n.rule === 'reentrancy-ordering')).toEqual([]);
    });
  });

  describe('storage-unwrap', () => {
    it('flags storage get().unwrap() on a user-supplied key', () => {
      const code = `
pub fn balance_of(env: Env, from: Address) -> i128 {
    env.storage().persistent().get(&from).unwrap()
}
`;
      const notes = lintSecurity(code).filter((n) => n.rule === 'storage-unwrap');
      expect(notes.length).toBeGreaterThan(0);
      expect(notes[0].severity).toBe('info');
    });

    it('does not flag unwrap_or', () => {
      const code = `
pub fn balance_of(env: Env, from: Address) -> i128 {
    env.storage().persistent().get(&from).unwrap_or(0)
}
`;
      expect(lintSecurity(code).filter((n) => n.rule === 'storage-unwrap')).toEqual([]);
    });

    it('does not flag unwrap on a constant storage key like ADMIN', () => {
      const code = `
pub fn mint(env: Env, to: Address, amount: i128) {
    let admin: Address = env.storage().instance().get(&ADMIN).unwrap();
    admin.require_auth();
    env.storage().persistent().set(&to, &amount);
}
`;
      expect(lintSecurity(code).filter((n) => n.rule === 'storage-unwrap')).toEqual([]);
    });
  });

  describe('official mission solutions', () => {
    it('does not flag any official mission solution', () => {
      const failures = [];
      for (const mission of missions) {
        const notes = lintSecurity(mission.solution || '');
        if (notes.length > 0) {
          failures.push({
            id: mission.id,
            rules: notes.map((n) => `${n.rule}@${n.functionName}:${n.line}`),
          });
        }
      }
      expect(failures).toEqual([]);
    });
  });
});
