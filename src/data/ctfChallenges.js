/* ==========================================
   CTF Challenges — Security-focused exploits
   for intentionally vulnerable Soroban contracts
   ========================================== */

export const ctfChallenges = [
  {
    id: 'reentrancy-exploit',
    title: 'Reentrancy Exploit',
    order: 1,
    difficulty: 'beginner',
    xpReward: 150,
    category: 'Access Control',
    icon: '🔄',
    description:
      'A vault contract forgets to check authorization before releasing funds. Find the missing guard and write the fix.',
    objective:
      'Add `caller.require_auth()` before the withdrawal and ensure the balance check happens before the deduction.',
    vulnerableContract: `#![no_std]
use soroban_sdk::{contract, contractimpl, Address, Env};

#[contract]
pub struct VaultContract;

#[contractimpl]
impl VaultContract {
    pub fn deposit(env: Env, caller: Address, amount: i128) {
        caller.require_auth();
        let bal: i128 = env.storage().persistent().get(&caller).unwrap_or(0);
        env.storage().persistent().set(&caller, &(bal + amount));
    }

    // 🐛 VULNERABILITY: No auth check — anyone can drain any account!
    pub fn withdraw(env: Env, caller: Address, amount: i128) {
        let bal: i128 = env.storage().persistent().get(&caller).unwrap_or(0);
        env.storage().persistent().set(&caller, &(bal - amount));
    }
}`,
    template: `#![no_std]
use soroban_sdk::{contract, contractimpl, Address, Env};

#[contract]
pub struct VaultContract;

#[contractimpl]
impl VaultContract {
    pub fn deposit(env: Env, caller: Address, amount: i128) {
        caller.require_auth();
        let bal: i128 = env.storage().persistent().get(&caller).unwrap_or(0);
        env.storage().persistent().set(&caller, &(bal + amount));
    }

    // TODO: Fix the withdraw function
    // 1. Add require_auth() for the caller
    // 2. Check that bal >= amount before subtracting (panic if not)
    pub fn withdraw(env: Env, caller: Address, amount: i128) {
        let bal: i128 = env.storage().persistent().get(&caller).unwrap_or(0);
        env.storage().persistent().set(&caller, &(bal - amount));
    }
}`,
    solution: `#![no_std]
use soroban_sdk::{contract, contractimpl, Address, Env};

#[contract]
pub struct VaultContract;

#[contractimpl]
impl VaultContract {
    pub fn deposit(env: Env, caller: Address, amount: i128) {
        caller.require_auth();
        let bal: i128 = env.storage().persistent().get(&caller).unwrap_or(0);
        env.storage().persistent().set(&caller, &(bal + amount));
    }

    pub fn withdraw(env: Env, caller: Address, amount: i128) {
        caller.require_auth();
        let bal: i128 = env.storage().persistent().get(&caller).unwrap_or(0);
        if bal < amount {
            panic!("Insufficient balance");
        }
        env.storage().persistent().set(&caller, &(bal - amount));
    }
}`,
    checks: [
      {
        type: 'has_function',
        name: 'withdraw',
        params: ['env', 'caller', 'amount'],
        message: "Missing 'withdraw' function",
      },
      {
        type: 'contains_pattern',
        pattern: 'require_auth()',
        message: 'withdraw must call caller.require_auth()',
        description: 'require_auth() in withdraw',
      },
      {
        type: 'contains_pattern',
        pattern: 'panic!',
        message: 'Must panic when balance is insufficient',
        description: 'panic! on underflow',
      },
      {
        type: 'storage_operation',
        operation: 'get',
        message: 'Must read balance before subtracting',
      },
      {
        type: 'storage_operation',
        operation: 'set',
        message: 'Must persist the updated balance',
      },
    ],
    hints: [
      'The first line of withdraw should be `caller.require_auth();`',
      'Read the balance, then compare: `if bal < amount { panic!("Insufficient balance"); }`',
      'Only update storage after both checks pass.',
    ],
    conceptsIntroduced: ['require_auth', 'balance check', 'authorization'],
  },

  {
    id: 'storage-overflow',
    title: 'Storage Overflow',
    order: 2,
    difficulty: 'beginner',
    category: 'Integer Safety',
    icon: '💥',
    xpReward: 175,
    description:
      'A balance contract uses unchecked arithmetic. A deposit of a huge number can overflow and wrap around to a negative balance.',
    objective:
      'Guard against overflow by panicking when `amount <= 0` or when the new balance would exceed `i128::MAX`.',
    vulnerableContract: `#![no_std]
use soroban_sdk::{contract, contractimpl, Address, Env};

#[contract]
pub struct BankContract;

#[contractimpl]
impl BankContract {
    // 🐛 VULNERABILITY: No bounds check — negative or overflowing deposits accepted
    pub fn deposit(env: Env, caller: Address, amount: i128) {
        caller.require_auth();
        let bal: i128 = env.storage().persistent().get(&caller).unwrap_or(0);
        env.storage().persistent().set(&caller, &(bal + amount));
    }

    pub fn balance(env: Env, caller: Address) -> i128 {
        env.storage().persistent().get(&caller).unwrap_or(0)
    }
}`,
    template: `#![no_std]
use soroban_sdk::{contract, contractimpl, Address, Env};

#[contract]
pub struct BankContract;

#[contractimpl]
impl BankContract {
    // TODO: Fix deposit
    // 1. Panic if amount <= 0
    // 2. Panic if bal + amount would overflow i128::MAX
    //    Hint: use checked_add — if it returns None, panic
    pub fn deposit(env: Env, caller: Address, amount: i128) {
        caller.require_auth();
        let bal: i128 = env.storage().persistent().get(&caller).unwrap_or(0);
        env.storage().persistent().set(&caller, &(bal + amount));
    }

    pub fn balance(env: Env, caller: Address) -> i128 {
        env.storage().persistent().get(&caller).unwrap_or(0)
    }
}`,
    solution: `#![no_std]
use soroban_sdk::{contract, contractimpl, Address, Env};

#[contract]
pub struct BankContract;

#[contractimpl]
impl BankContract {
    pub fn deposit(env: Env, caller: Address, amount: i128) {
        caller.require_auth();
        if amount <= 0 {
            panic!("Amount must be positive");
        }
        let bal: i128 = env.storage().persistent().get(&caller).unwrap_or(0);
        let new_bal = bal.checked_add(amount).expect("Overflow");
        env.storage().persistent().set(&caller, &new_bal);
    }

    pub fn balance(env: Env, caller: Address) -> i128 {
        env.storage().persistent().get(&caller).unwrap_or(0)
    }
}`,
    checks: [
      {
        type: 'has_function',
        name: 'deposit',
        params: ['env', 'caller', 'amount'],
        message: "Missing 'deposit' function",
      },
      {
        type: 'contains_pattern',
        pattern: 'panic!',
        message: 'Must panic on invalid input',
        description: 'panic! guard',
      },
      {
        type: 'contains_pattern',
        pattern: 'checked_add',
        message: 'Use checked_add to prevent overflow',
        description: 'checked_add usage',
      },
      {
        type: 'storage_operation',
        operation: 'set',
        message: 'Must persist the new balance',
      },
    ],
    hints: [
      'First check: `if amount <= 0 { panic!("Amount must be positive"); }`',
      'Use `bal.checked_add(amount).expect("Overflow")` instead of `bal + amount`',
      'Store the result of checked_add, not the raw sum.',
    ],
    conceptsIntroduced: ['checked_add', 'integer overflow', 'input validation'],
  },

  {
    id: 'access-control-bypass',
    title: 'Access Control Bypass',
    order: 3,
    difficulty: 'intermediate',
    category: 'Access Control',
    icon: '🔓',
    xpReward: 200,
    description:
      'An admin-only mint function checks the wrong address. Any caller can mint unlimited tokens.',
    objective:
      'Fix the admin check so it reads the stored admin and calls `require_auth()` on that address, not on the `to` address.',
    vulnerableContract: `#![no_std]
use soroban_sdk::{contract, contractimpl, symbol_short, Address, Env, Symbol};

const ADMIN: Symbol = symbol_short!("ADMIN");

#[contract]
pub struct TokenContract;

#[contractimpl]
impl TokenContract {
    pub fn init(env: Env, admin: Address) {
        env.storage().instance().set(&ADMIN, &admin);
    }

    // 🐛 VULNERABILITY: Checks auth on 'to' (the recipient) instead of admin!
    pub fn mint(env: Env, to: Address, amount: i128) {
        to.require_auth();
        let bal: i128 = env.storage().persistent().get(&to).unwrap_or(0);
        env.storage().persistent().set(&to, &(bal + amount));
    }

    pub fn balance(env: Env, account: Address) -> i128 {
        env.storage().persistent().get(&account).unwrap_or(0)
    }
}`,
    template: `#![no_std]
use soroban_sdk::{contract, contractimpl, symbol_short, Address, Env, Symbol};

const ADMIN: Symbol = symbol_short!("ADMIN");

#[contract]
pub struct TokenContract;

#[contractimpl]
impl TokenContract {
    pub fn init(env: Env, admin: Address) {
        env.storage().instance().set(&ADMIN, &admin);
    }

    // TODO: Fix mint
    // 1. Load the admin address from storage
    // 2. Call require_auth() on the admin (not on 'to')
    // 3. Then update the recipient's balance
    pub fn mint(env: Env, to: Address, amount: i128) {
        to.require_auth();
        let bal: i128 = env.storage().persistent().get(&to).unwrap_or(0);
        env.storage().persistent().set(&to, &(bal + amount));
    }

    pub fn balance(env: Env, account: Address) -> i128 {
        env.storage().persistent().get(&account).unwrap_or(0)
    }
}`,
    solution: `#![no_std]
use soroban_sdk::{contract, contractimpl, symbol_short, Address, Env, Symbol};

const ADMIN: Symbol = symbol_short!("ADMIN");

#[contract]
pub struct TokenContract;

#[contractimpl]
impl TokenContract {
    pub fn init(env: Env, admin: Address) {
        env.storage().instance().set(&ADMIN, &admin);
    }

    pub fn mint(env: Env, to: Address, amount: i128) {
        let admin: Address = env.storage().instance().get(&ADMIN).unwrap();
        admin.require_auth();
        let bal: i128 = env.storage().persistent().get(&to).unwrap_or(0);
        env.storage().persistent().set(&to, &(bal + amount));
    }

    pub fn balance(env: Env, account: Address) -> i128 {
        env.storage().persistent().get(&account).unwrap_or(0)
    }
}`,
    checks: [
      {
        type: 'has_function',
        name: 'mint',
        params: ['env', 'to', 'amount'],
        message: "Missing 'mint' function",
      },
      {
        type: 'contains_pattern',
        pattern: 'ADMIN',
        message: 'Must load the ADMIN from storage',
        description: 'ADMIN key usage',
      },
      {
        type: 'storage_operation',
        operation: 'get',
        message: 'Must read admin from storage',
      },
      {
        type: 'contains_pattern',
        pattern: 'require_auth()',
        message: 'Must call require_auth() on the admin address',
        description: 'require_auth() on admin',
      },
      {
        type: 'storage_operation',
        operation: 'set',
        message: 'Must update the recipient balance',
      },
    ],
    hints: [
      'Load admin: `let admin: Address = env.storage().instance().get(&ADMIN).unwrap();`',
      'Then call `admin.require_auth();` — not `to.require_auth()`',
      'After the auth check, update the balance for `to` as before.',
    ],
    conceptsIntroduced: ['admin pattern', 'wrong auth target', 'privilege escalation'],
  },

  {
    id: 'front-running',
    title: 'Front-Running Vulnerability',
    order: 4,
    difficulty: 'intermediate',
    category: 'Timing',
    icon: '⏱️',
    xpReward: 225,
    description:
      'A price-sensitive swap contract reads the price at execution time with no deadline. An attacker can observe the transaction and front-run it.',
    objective:
      'Add a `deadline` parameter (ledger sequence) and panic if `env.ledger().sequence() > deadline`.',
    vulnerableContract: `#![no_std]
use soroban_sdk::{contract, contractimpl, symbol_short, Address, Env, Symbol};

const PRICE: Symbol = symbol_short!("PRICE");

#[contract]
pub struct SwapContract;

#[contractimpl]
impl SwapContract {
    pub fn set_price(env: Env, admin: Address, price: i128) {
        admin.require_auth();
        env.storage().instance().set(&PRICE, &price);
    }

    // 🐛 VULNERABILITY: No deadline — transaction can be held and executed
    // at an unfavorable price by a front-running validator.
    pub fn swap(env: Env, caller: Address, amount: i128) -> i128 {
        caller.require_auth();
        let price: i128 = env.storage().instance().get(&PRICE).unwrap_or(1);
        price * amount
    }
}`,
    template: `#![no_std]
use soroban_sdk::{contract, contractimpl, symbol_short, Address, Env, Symbol};

const PRICE: Symbol = symbol_short!("PRICE");

#[contract]
pub struct SwapContract;

#[contractimpl]
impl SwapContract {
    pub fn set_price(env: Env, admin: Address, price: i128) {
        admin.require_auth();
        env.storage().instance().set(&PRICE, &price);
    }

    // TODO: Add a 'deadline: u32' parameter
    // Panic with "Expired" if env.ledger().sequence() > deadline
    pub fn swap(env: Env, caller: Address, amount: i128) -> i128 {
        caller.require_auth();
        let price: i128 = env.storage().instance().get(&PRICE).unwrap_or(1);
        price * amount
    }
}`,
    solution: `#![no_std]
use soroban_sdk::{contract, contractimpl, symbol_short, Address, Env, Symbol};

const PRICE: Symbol = symbol_short!("PRICE");

#[contract]
pub struct SwapContract;

#[contractimpl]
impl SwapContract {
    pub fn set_price(env: Env, admin: Address, price: i128) {
        admin.require_auth();
        env.storage().instance().set(&PRICE, &price);
    }

    pub fn swap(env: Env, caller: Address, amount: i128, deadline: u32) -> i128 {
        caller.require_auth();
        if env.ledger().sequence() > deadline {
            panic!("Expired");
        }
        let price: i128 = env.storage().instance().get(&PRICE).unwrap_or(1);
        price * amount
    }
}`,
    checks: [
      {
        type: 'has_function',
        name: 'swap',
        params: ['env', 'caller', 'amount', 'deadline'],
        message: "swap must include a 'deadline: u32' parameter",
      },
      {
        type: 'contains_pattern',
        pattern: 'ledger()',
        message: 'Must check env.ledger().sequence()',
        description: 'ledger().sequence() check',
      },
      {
        type: 'contains_pattern',
        pattern: 'deadline',
        message: 'Must compare against the deadline',
        description: 'deadline comparison',
      },
      {
        type: 'contains_pattern',
        pattern: 'panic!',
        message: 'Must panic when the deadline is exceeded',
        description: 'panic! on expiry',
      },
    ],
    hints: [
      'Add `deadline: u32` as the last parameter of swap.',
      'Check: `if env.ledger().sequence() > deadline { panic!("Expired"); }`',
      'Place the deadline check before reading the price.',
    ],
    conceptsIntroduced: ['front-running', 'deadline', 'ledger sequence', 'MEV'],
  },

  {
    id: 'unchecked-inputs',
    title: 'Unchecked Inputs',
    order: 5,
    difficulty: 'advanced',
    category: 'Input Validation',
    icon: '🧨',
    xpReward: 250,
    description:
      'A transfer function accepts any amount — including zero and negative values — silently corrupting balances.',
    objective:
      'Validate that `amount > 0`, that the sender has sufficient balance, and that `from != to`.',
    vulnerableContract: `#![no_std]
use soroban_sdk::{contract, contractimpl, Address, Env};

#[contract]
pub struct TransferContract;

#[contractimpl]
impl TransferContract {
    pub fn mint(env: Env, to: Address, amount: i128) {
        let bal: i128 = env.storage().persistent().get(&to).unwrap_or(0);
        env.storage().persistent().set(&to, &(bal + amount));
    }

    // 🐛 VULNERABILITIES:
    // 1. No check that amount > 0
    // 2. No check that from has enough balance
    // 3. No check that from != to (self-transfer inflates nothing but wastes gas)
    pub fn transfer(env: Env, from: Address, to: Address, amount: i128) {
        from.require_auth();
        let from_bal: i128 = env.storage().persistent().get(&from).unwrap_or(0);
        let to_bal: i128 = env.storage().persistent().get(&to).unwrap_or(0);
        env.storage().persistent().set(&from, &(from_bal - amount));
        env.storage().persistent().set(&to, &(to_bal + amount));
    }
}`,
    template: `#![no_std]
use soroban_sdk::{contract, contractimpl, Address, Env};

#[contract]
pub struct TransferContract;

#[contractimpl]
impl TransferContract {
    pub fn mint(env: Env, to: Address, amount: i128) {
        let bal: i128 = env.storage().persistent().get(&to).unwrap_or(0);
        env.storage().persistent().set(&to, &(bal + amount));
    }

    // TODO: Fix transfer with three guards:
    // 1. panic if amount <= 0
    // 2. panic if from == to
    // 3. panic if from_bal < amount
    pub fn transfer(env: Env, from: Address, to: Address, amount: i128) {
        from.require_auth();
        let from_bal: i128 = env.storage().persistent().get(&from).unwrap_or(0);
        let to_bal: i128 = env.storage().persistent().get(&to).unwrap_or(0);
        env.storage().persistent().set(&from, &(from_bal - amount));
        env.storage().persistent().set(&to, &(to_bal + amount));
    }
}`,
    solution: `#![no_std]
use soroban_sdk::{contract, contractimpl, Address, Env};

#[contract]
pub struct TransferContract;

#[contractimpl]
impl TransferContract {
    pub fn mint(env: Env, to: Address, amount: i128) {
        let bal: i128 = env.storage().persistent().get(&to).unwrap_or(0);
        env.storage().persistent().set(&to, &(bal + amount));
    }

    pub fn transfer(env: Env, from: Address, to: Address, amount: i128) {
        from.require_auth();
        if amount <= 0 {
            panic!("Amount must be positive");
        }
        if from == to {
            panic!("Cannot transfer to self");
        }
        let from_bal: i128 = env.storage().persistent().get(&from).unwrap_or(0);
        if from_bal < amount {
            panic!("Insufficient balance");
        }
        let to_bal: i128 = env.storage().persistent().get(&to).unwrap_or(0);
        env.storage().persistent().set(&from, &(from_bal - amount));
        env.storage().persistent().set(&to, &(to_bal + amount));
    }
}`,
    checks: [
      {
        type: 'has_function',
        name: 'transfer',
        params: ['env', 'from', 'to', 'amount'],
        message: "Missing 'transfer' function",
      },
      {
        type: 'contains_pattern',
        pattern: 'amount <= 0',
        message: 'Must check that amount > 0',
        description: 'amount > 0 guard',
      },
      {
        type: 'contains_pattern',
        pattern: 'from == to',
        message: 'Must check that from != to',
        description: 'self-transfer guard',
      },
      {
        type: 'contains_pattern',
        pattern: 'from_bal < amount',
        message: 'Must check sufficient balance',
        description: 'balance sufficiency check',
      },
      {
        type: 'contains_pattern',
        pattern: 'panic!',
        message: 'Must panic on invalid conditions',
        description: 'panic! guards',
      },
      {
        type: 'storage_operation',
        operation: 'set',
        message: 'Must update both balances',
      },
    ],
    hints: [
      'Add `if amount <= 0 { panic!("Amount must be positive"); }` right after require_auth.',
      'Add `if from == to { panic!("Cannot transfer to self"); }`',
      'Read from_bal first, then check `if from_bal < amount { panic!("Insufficient balance"); }`',
    ],
    conceptsIntroduced: ['input validation', 'self-transfer', 'balance guard', 'defensive programming'],
  },
];
