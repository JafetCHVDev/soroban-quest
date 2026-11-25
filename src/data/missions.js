/* ==========================================
   Language-neutral mission definitions. Localized narrative content
   is loaded from src/data/missions/i18n by missionLoader.
   ========================================== */
const authoredMissions = Object.values(
    import.meta.glob('./missions/authored/*.json', { eager: true, import: 'default' }),
);



 
/** @type {import('../types/game').Mission[]} */
export const missions = [
    {
        id: 'hello-soroban',
        chapter: 1,
        order: 1,
        difficulty: 'beginner',
        xpReward: 100,
        skills: ['contract', 'contractimpl', 'Env', 'Symbol', 'Vec'],
        prereqs: [],

        template: `#![no_std]
use soroban_sdk::{contract, contractimpl, symbol_short, vec, Env, Symbol, Vec};

#[contract]
pub struct HelloContract;

#[contractimpl]
impl HelloContract {
    // TODO: Create a public function called 'hello'
    // It should take two parameters: env: Env, to: Symbol
    // It should return Vec<Symbol>
    // The function should return a vector containing
    // the symbols "Hello" and the 'to' parameter

}`,
        solution: `#![no_std]
use soroban_sdk::{contract, contractimpl, symbol_short, vec, Env, Symbol, Vec};

#[contract]
pub struct HelloContract;

#[contractimpl]
impl HelloContract {
    pub fn hello(env: Env, to: Symbol) -> Vec<Symbol> {
        vec![&env, symbol_short!("Hello"), to]
    }
}`,
        checks: [
            { type: 'has_attribute', attribute: 'contract', message: 'Missing #[contract] attribute on your struct', description: '#[contract] attribute' },
            { type: 'has_attribute', attribute: 'contractimpl', message: 'Missing #[contractimpl] on your impl block', description: '#[contractimpl] attribute' },
            { type: 'has_function', name: 'hello', params: ['env', 'to'], message: "Function 'hello' not found or missing parameters (env, to)" },
            { type: 'returns_type', function: 'hello', returnType: 'Vec<Symbol>', message: "Function 'hello' should return Vec<Symbol>" },
            { type: 'uses_type', typeName: 'Env', message: 'Must use the Env type' },
            { type: 'contains_pattern', pattern: 'vec![', message: 'Use vec![] macro to create the return vector', description: 'vec![] macro usage' },
        ],
        conceptsIntroduced: ['contract', 'contractimpl', 'Env', 'Symbol', 'Vec'],
    },

    {
        id: 'greetings-protocol',
        chapter: 1,
        order: 2,
        difficulty: 'beginner',
        xpReward: 150,

        template: `#![no_std]
use soroban_sdk::{contract, contractimpl, symbol_short, vec, Env, Symbol, Vec, String};

#[contract]
pub struct GreetingContract;

#[contractimpl]
impl GreetingContract {
    // TODO: Create a 'greet' function
    // Parameters: env: Env, name: Symbol
    // Returns: Vec<Symbol>
    // Should return ["Greetings", name]

    // TODO: Create a 'count_chars' function
    // Parameters: env: Env, text: String
    // Returns: u32
    // Should return the length of the text

}`,
        solution: `#![no_std]
use soroban_sdk::{contract, contractimpl, symbol_short, vec, Env, Symbol, Vec, String};

#[contract]
pub struct GreetingContract;

#[contractimpl]
impl GreetingContract {
    pub fn greet(env: Env, name: Symbol) -> Vec<Symbol> {
        vec![&env, symbol_short!("Greetings"), name]
    }

    pub fn count_chars(env: Env, text: String) -> u32 {
        text.len()
    }
}`,
        checks: [
            { type: 'has_attribute', attribute: 'contractimpl', message: 'Missing #[contractimpl]', description: '#[contractimpl] attribute' },
            { type: 'has_function', name: 'greet', params: ['env', 'name'], message: "Missing 'greet' function with (env, name) params" },
            { type: 'returns_type', function: 'greet', returnType: 'Vec<Symbol>', message: "'greet' should return Vec<Symbol>" },
            { type: 'has_function', name: 'count_chars', params: ['env', 'text'], message: "Missing 'count_chars' function" },
            { type: 'returns_type', function: 'count_chars', returnType: 'u32', message: "'count_chars' should return u32" },
            { type: 'uses_type', typeName: 'String', message: 'Must use the String type for count_chars' },
        ],
        conceptsIntroduced: ['String', 'multiple functions', 'u32'],
    },

    {
        id: 'counter-vault',
        chapter: 2,
        order: 3,
        difficulty: 'beginner',
        xpReward: 200,

        template: `#![no_std]
use soroban_sdk::{contract, contractimpl, symbol_short, Env, Symbol};

const COUNTER: Symbol = symbol_short!("COUNTER");

#[contract]
pub struct CounterContract;

#[contractimpl]
impl CounterContract {
    // TODO: Create an 'increment' function
    // Parameters: env: Env
    // Returns: u32
    // Should: read current count, add 1, store it, return new count

    // TODO: Create a 'get_count' function
    // Parameters: env: Env
    // Returns: u32
    // Should: return the current count (default 0)

}`,
        solution: `#![no_std]
use soroban_sdk::{contract, contractimpl, symbol_short, Env, Symbol};

const COUNTER: Symbol = symbol_short!("COUNTER");

#[contract]
pub struct CounterContract;

#[contractimpl]
impl CounterContract {
    pub fn increment(env: Env) -> u32 {
        let count: u32 = env.storage().instance().get(&COUNTER).unwrap_or(0);
        let new_count = count + 1;
        env.storage().instance().set(&COUNTER, &new_count);
        new_count
    }

    pub fn get_count(env: Env) -> u32 {
        env.storage().instance().get(&COUNTER).unwrap_or(0)
    }
}`,
        checks: [
            { type: 'has_attribute', attribute: 'contractimpl', message: 'Missing #[contractimpl]', description: '#[contractimpl]' },
            { type: 'has_function', name: 'increment', params: ['env'], message: "Missing 'increment' function" },
            { type: 'returns_type', function: 'increment', returnType: 'u32', message: "'increment' should return u32" },
            { type: 'has_function', name: 'get_count', params: ['env'], message: "Missing 'get_count' function" },
            { type: 'returns_type', function: 'get_count', returnType: 'u32', message: "'get_count' should return u32" },
            { type: 'storage_operation', operation: 'set', message: 'Must use storage set to persist the count' },
            { type: 'storage_operation', operation: 'get', message: 'Must use storage get to read the count' },
        ],
        conceptsIntroduced: ['storage', 'instance', 'set', 'get', 'unwrap_or'],
    },

    {
        id: 'guardian-ledger',
        chapter: 2,
        order: 4,
        difficulty: 'intermediate',
        xpReward: 250,

        template: `#![no_std]
use soroban_sdk::{contract, contractimpl, symbol_short, Address, Env, Symbol, Map};

const ADMIN: Symbol = symbol_short!("ADMIN");
const REGISTRY: Symbol = symbol_short!("REGISTRY");

#[contract]
pub struct LedgerContract;

#[contractimpl]
impl LedgerContract {
    // TODO: Create an 'init' function
    // Parameters: env: Env, admin: Address
    // Should store the admin address

    // TODO: Create a 'register' function
    // Parameters: env: Env, who: Address, name: Symbol
    // Should: require auth from 'who', then store the mapping

    // TODO: Create a 'get_guardian' function
    // Parameters: env: Env, who: Address
    // Returns: Symbol
    // Should: look up and return the guardian's name

}`,
        solution: `#![no_std]
use soroban_sdk::{contract, contractimpl, symbol_short, Address, Env, Symbol, Map};

const ADMIN: Symbol = symbol_short!("ADMIN");
const REGISTRY: Symbol = symbol_short!("REGISTRY");

#[contract]
pub struct LedgerContract;

#[contractimpl]
impl LedgerContract {
    pub fn init(env: Env, admin: Address) {
        env.storage().instance().set(&ADMIN, &admin);
    }

    pub fn register(env: Env, who: Address, name: Symbol) {
        who.require_auth();
        env.storage().instance().set(&who, &name);
    }

    pub fn get_guardian(env: Env, who: Address) -> Symbol {
        env.storage().instance().get(&who).unwrap_or(symbol_short!("Unknown"))
    }
}`,
        checks: [
            { type: 'has_attribute', attribute: 'contractimpl', message: 'Missing #[contractimpl]', description: '#[contractimpl]' },
            { type: 'has_function', name: 'init', params: ['env', 'admin'], message: "Missing 'init' function with admin parameter" },
            { type: 'has_function', name: 'register', params: ['env', 'who', 'name'], message: "Missing 'register' function" },
            { type: 'has_function', name: 'get_guardian', params: ['env', 'who'], message: "Missing 'get_guardian' function" },
            { type: 'uses_type', typeName: 'Address', message: 'Must use the Address type' },
            { type: 'contains_pattern', pattern: 'require_auth()', message: 'Must use require_auth() for access control', description: 'require_auth() call' },
            { type: 'storage_operation', operation: 'set', message: 'Must use storage set' },
        ],
        conceptsIntroduced: ['Address', 'require_auth', 'Map', 'init pattern'],
    },

    {
        id: 'token-forge',
        chapter: 3,
        order: 5,
        difficulty: 'intermediate',
        xpReward: 300,

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

    // TODO: Create a 'mint' function
    // Parameters: env: Env, to: Address, amount: i128
    // Should: require auth from admin, then add amount to 'to' balance

    // TODO: Create a 'balance' function
    // Parameters: env: Env, account: Address
    // Returns: i128
    // Should: return the balance (default 0)

    // TODO: Create a 'transfer' function
    // Parameters: env: Env, from: Address, to: Address, amount: i128
    // Should: require auth from 'from', check balance, update both balances

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
        let balance: i128 = env.storage().persistent().get(&to).unwrap_or(0);
        env.storage().persistent().set(&to, &(balance + amount));
    }

    pub fn balance(env: Env, account: Address) -> i128 {
        env.storage().persistent().get(&account).unwrap_or(0)
    }

    pub fn transfer(env: Env, from: Address, to: Address, amount: i128) {
        from.require_auth();
        let from_bal: i128 = env.storage().persistent().get(&from).unwrap_or(0);
        let to_bal: i128 = env.storage().persistent().get(&to).unwrap_or(0);
        env.storage().persistent().set(&from, &(from_bal - amount));
        env.storage().persistent().set(&to, &(to_bal + amount));
    }
}`,
        checks: [
            { type: 'has_attribute', attribute: 'contractimpl', message: 'Missing #[contractimpl]', description: '#[contractimpl]' },
            { type: 'has_function', name: 'mint', params: ['env', 'to', 'amount'], message: "Missing 'mint' function" },
            { type: 'has_function', name: 'balance', params: ['env', 'account'], message: "Missing 'balance' function" },
            { type: 'returns_type', function: 'balance', returnType: 'i128', message: "'balance' should return i128" },
            { type: 'has_function', name: 'transfer', params: ['env', 'from', 'to', 'amount'], message: "Missing 'transfer' function" },
            { type: 'contains_pattern', pattern: 'require_auth()', message: 'Must use require_auth() for authorization', description: 'require_auth()' },
            { type: 'storage_operation', operation: 'set', message: 'Must use storage set for balances' },
            { type: 'storage_operation', operation: 'get', message: 'Must use storage get for balances' },
        ],
        conceptsIntroduced: ['token', 'mint', 'transfer', 'persistent storage', 'i128'],
    },

    {
        id: 'time-lock',
        chapter: 3,
        order: 6,
        difficulty: 'advanced',
        xpReward: 350,

        template: `#![no_std]
use soroban_sdk::{contract, contractimpl, symbol_short, Address, Env, Symbol};

const LOCKED_AMOUNT: Symbol = symbol_short!("LOCKED");
const UNLOCK_AT: Symbol = symbol_short!("UNLOCK");
const OWNER: Symbol = symbol_short!("OWNER");

#[contract]
pub struct TimeLockContract;

#[contractimpl]
impl TimeLockContract {
    // TODO: Create a 'lock' function
    // Parameters: env: Env, owner: Address, amount: i128, unlock_at: u32
    // Should: require auth, store amount, unlock_at, and owner

    // TODO: Create an 'unlock' function
    // Parameters: env: Env, owner: Address
    // Returns: i128
    // Should: check require_auth, check if current ledger >= unlock_at
    // If locked: panic with "Still locked"
    // If unlocked: return the amount and clear storage

    // TODO: Create a 'get_lock_info' function
    // Parameters: env: Env
    // Returns: (i128, u32)  — but you can use two separate getters
    // Should return the locked amount and unlock_at time

}`,
        solution: `#![no_std]
use soroban_sdk::{contract, contractimpl, symbol_short, Address, Env, Symbol};

const LOCKED_AMOUNT: Symbol = symbol_short!("LOCKED");
const UNLOCK_AT: Symbol = symbol_short!("UNLOCK");
const OWNER: Symbol = symbol_short!("OWNER");

#[contract]
pub struct TimeLockContract;

#[contractimpl]
impl TimeLockContract {
    pub fn lock(env: Env, owner: Address, amount: i128, unlock_at: u32) {
        owner.require_auth();
        env.storage().instance().set(&OWNER, &owner);
        env.storage().instance().set(&LOCKED_AMOUNT, &amount);
        env.storage().instance().set(&UNLOCK_AT, &unlock_at);
    }

    pub fn unlock(env: Env, owner: Address) -> i128 {
        owner.require_auth();
        let stored_owner: Address = env.storage().instance().get(&OWNER).unwrap();
        let current_seq = env.ledger().sequence();
        let unlock_at: u32 = env.storage().instance().get(&UNLOCK_AT).unwrap_or(0);
        if current_seq < unlock_at {
            panic!("Still locked");
        }
        let amount: i128 = env.storage().instance().get(&LOCKED_AMOUNT).unwrap_or(0);
        env.storage().instance().remove(&LOCKED_AMOUNT);
        env.storage().instance().remove(&UNLOCK_AT);
        amount
    }

    pub fn get_lock_info(env: Env) -> i128 {
        env.storage().instance().get(&LOCKED_AMOUNT).unwrap_or(0)
    }
}`,
        checks: [
            { type: 'has_attribute', attribute: 'contractimpl', message: 'Missing #[contractimpl]', description: '#[contractimpl]' },
            { type: 'has_function', name: 'lock', params: ['env', 'owner', 'amount', 'unlock_at'], message: "Missing 'lock' function" },
            { type: 'has_function', name: 'unlock', params: ['env', 'owner'], message: "Missing 'unlock' function" },
            { type: 'has_function', name: 'get_lock_info', params: ['env'], message: "Missing 'get_lock_info' function" },
            { type: 'contains_pattern', pattern: 'require_auth()', message: 'Must use require_auth()', description: 'require_auth()' },
            { type: 'contains_pattern', pattern: 'ledger()', message: 'Must use env.ledger() for time checks', description: 'ledger() access' },
            { type: 'contains_pattern', pattern: 'panic!', message: 'Must panic if still locked', description: 'panic! for errors' },
            { type: 'storage_operation', operation: 'set', message: 'Must store lock data' },
        ],
        conceptsIntroduced: ['ledger sequence', 'time-lock', 'conditional panic', 'remove storage'],
    },

    {
        id: 'multi-party-pact',
        chapter: 3,
        order: 7,
        difficulty: 'advanced',
        xpReward: 400,

        template: `#![no_std]
use soroban_sdk::{contract, contractimpl, symbol_short, Address, Env, Symbol};

const REQUIRED: Symbol = symbol_short!("REQUIRED");
const SIGNED: Symbol = symbol_short!("SIGNED");
const PACT_DESC: Symbol = symbol_short!("PACT");

#[contract]
pub struct PactContract;

#[contractimpl]
impl PactContract {
    // TODO: Create 'create_pact'
    // Parameters: env: Env, creator: Address, description: Symbol, required_sigs: u32
    // Should: require auth, store description and required count, set signed=0

    // TODO: Create 'sign_pact'
    // Parameters: env: Env, signer: Address
    // Should: require auth from signer, increment signed count

    // TODO: Create 'is_complete'
    // Parameters: env: Env
    // Returns: bool
    // Should: return true if signed >= required

    // TODO: Create 'get_signed_count'
    // Parameters: env: Env
    // Returns: u32
    // Should: return current number of signatures

}`,
        solution: `#![no_std]
use soroban_sdk::{contract, contractimpl, symbol_short, Address, Env, Symbol};

const REQUIRED: Symbol = symbol_short!("REQUIRED");
const SIGNED: Symbol = symbol_short!("SIGNED");
const PACT_DESC: Symbol = symbol_short!("PACT");

#[contract]
pub struct PactContract;

#[contractimpl]
impl PactContract {
    pub fn create_pact(env: Env, creator: Address, description: Symbol, required_sigs: u32) {
        creator.require_auth();
        env.storage().instance().set(&PACT_DESC, &description);
        env.storage().instance().set(&REQUIRED, &required_sigs);
        env.storage().instance().set(&SIGNED, &0u32);
    }

    pub fn sign_pact(env: Env, signer: Address) {
        signer.require_auth();
        let count: u32 = env.storage().instance().get(&SIGNED).unwrap_or(0);
        env.storage().instance().set(&SIGNED, &(count + 1));
    }

    pub fn is_complete(env: Env) -> bool {
        let signed: u32 = env.storage().instance().get(&SIGNED).unwrap_or(0);
        let required: u32 = env.storage().instance().get(&REQUIRED).unwrap_or(1);
        signed >= required
    }

    pub fn get_signed_count(env: Env) -> u32 {
        env.storage().instance().get(&SIGNED).unwrap_or(0)
    }
}`,
        checks: [
            { type: 'has_attribute', attribute: 'contractimpl', message: 'Missing #[contractimpl]', description: '#[contractimpl]' },
            { type: 'has_function', name: 'create_pact', params: ['env', 'creator', 'description', 'required_sigs'], message: "Missing 'create_pact' function" },
            { type: 'has_function', name: 'sign_pact', params: ['env', 'signer'], message: "Missing 'sign_pact' function" },
            { type: 'has_function', name: 'is_complete', params: ['env'], message: "Missing 'is_complete' function" },
            { type: 'returns_type', function: 'is_complete', returnType: 'bool', message: "'is_complete' should return bool" },
            { type: 'has_function', name: 'get_signed_count', params: ['env'], message: "Missing 'get_signed_count' function" },
            { type: 'returns_type', function: 'get_signed_count', returnType: 'u32', message: "'get_signed_count' should return u32" },
            { type: 'contains_pattern', pattern: 'require_auth()', message: 'Must use require_auth()', description: 'require_auth()' },
            { type: 'storage_operation', operation: 'set', message: 'Must use storage operations' },
        ],
        conceptsIntroduced: ['multi-sig', 'bool', 'governance pattern', 'complex state'],
    },

/* ==========================================
   Chapter 4: Data Fortress
   ========================================== */

    {
        id: 'vault-manager',
        chapter: 4,
        order: 8,
        difficulty: 'intermediate',
        xpReward: 300,

        template: `#![no_std]
use soroban_sdk::{contract, contractimpl, symbol_short, Address, Env, Map, i128};

const BALANCES: Symbol = symbol_short!("BALANCE");

#[contract]
pub struct VaultContract;

#[contractimpl]
impl VaultContract {
    // TODO: Create 'deposit' function
    // Parameters: env: Env, user: Address, amount: i128
    // Should: require auth from user, read balances map,
    //         add amount to user's balance, store updated map

    // TODO: Create 'withdraw' function
    // Parameters: env: Env, user: Address, amount: i128
    // Should: require auth from user, read balances map,
    //         subtract amount from user's balance, store updated map

    // TODO: Create 'get_balance' function
    // Parameters: env: Env, user: Address
    // Returns: i128
    // Should: read balances map and return user's balance (default 0)
}`,
        solution: `#![no_std]
use soroban_sdk::{contract, contractimpl, symbol_short, Address, Env, Map, i128};

const BALANCES: Symbol = symbol_short!("BALANCE");

#[contract]
pub struct VaultContract;

#[contractimpl]
impl VaultContract {
    pub fn deposit(env: Env, user: Address, amount: i128) {
        user.require_auth();
        let mut balances: Map<Address, i128> = env.storage()
            .instance()
            .get(&BALANCES)
            .unwrap_or(Map::new(&env));
        let current = balances.get(&user).unwrap_or(0);
        balances.set(&user, &(current + amount));
        env.storage().instance().set(&BALANCES, &balances);
    }

    pub fn withdraw(env: Env, user: Address, amount: i128) {
        user.require_auth();
        let mut balances: Map<Address, i128> = env.storage()
            .instance()
            .get(&BALANCES)
            .unwrap_or(Map::new(&env));
        let current = balances.get(&user).unwrap_or(0);
        balances.set(&user, &(current - amount));
        env.storage().instance().set(&BALANCES, &balances);
    }

    pub fn get_balance(env: Env, user: Address) -> i128 {
        let balances: Map<Address, i128> = env.storage()
            .instance()
            .get(&BALANCES)
            .unwrap_or(Map::new(&env));
        balances.get(&user).unwrap_or(0)
    }
}`,
        checks: [
            { type: 'has_attribute', attribute: 'contractimpl', message: 'Missing #[contractimpl]', description: '#[contractimpl]' },
            { type: 'has_function', name: 'deposit', params: ['env', 'user', 'amount'], message: "Missing 'deposit' function" },
            { type: 'has_function', name: 'withdraw', params: ['env', 'user', 'amount'], message: "Missing 'withdraw' function" },
            { type: 'has_function', name: 'get_balance', params: ['env', 'user'], message: "Missing 'get_balance' function" },
            { type: 'returns_type', function: 'get_balance', returnType: 'i128', message: "'get_balance' should return i128" },
            { type: 'uses_type', typeName: 'Map', message: 'Must use Map type for balances' },
            { type: 'uses_type', typeName: 'Address', message: 'Must use Address type' },
            { type: 'contains_pattern', pattern: 'require_auth()', message: 'Must use require_auth()', description: 'require_auth()' },
            { type: 'storage_operation', operation: 'set', message: 'Must use storage set' },
            { type: 'storage_operation', operation: 'get', message: 'Must use storage get' },
        ],
        conceptsIntroduced: ['Map<Address, i128>', 'multi-user storage', 'complex state'],
    },

    {
        id: 'event-emitter',
        chapter: 4,
        order: 9,
        difficulty: 'intermediate',
        xpReward: 300,

        template: `#![no_std]
use soroban_sdk::{contract, contractimpl, symbol_short, Env, Symbol, Vec, IntoVal};

const KEYS: Symbol = symbol_short!("KEYS");

#[contract]
pub struct EventContract;

#[contractimpl]
impl EventContract {
    // TODO: Create 'set_value' function
    // Parameters: env: Env, key: Symbol, value: u32
    // Should: store the value, emit an event with topic "set_value"
    //         containing (key, value), and track the key

    // TODO: Create 'get_value' function
    // Parameters: env: Env, key: Symbol
    // Returns: u32
    // Should: return the stored value (default 0)

    // TODO: Create 'get_all_keys' function
    // Parameters: env: Env
    // Returns: Vec<Symbol>
    // Should: return all tracked keys
}`,
        solution: `#![no_std]
use soroban_sdk::{contract, contractimpl, symbol_short, Env, Symbol, Vec, IntoVal};

const KEYS: Symbol = symbol_short!("KEYS");

#[contract]
pub struct EventContract;

#[contractimpl]
impl EventContract {
    pub fn set_value(env: Env, key: Symbol, value: u32) {
        env.storage().instance().set(&key, &value);
        env.events().publish(
            &symbol_short!("set_value"),
            (key.clone(), value),
        );
        let mut keys: Vec<Symbol> = env.storage().instance()
            .get(&KEYS)
            .unwrap_or(Vec::new(&env));
        if !keys.contains(&key) {
            keys.push_back(key);
            env.storage().instance().set(&KEYS, &keys);
        }
    }

    pub fn get_value(env: Env, key: Symbol) -> u32 {
        env.storage().instance().get(&key).unwrap_or(0)
    }

    pub fn get_all_keys(env: Env) -> Vec<Symbol> {
        env.storage().instance()
            .get(&KEYS)
            .unwrap_or(Vec::new(&env))
    }
}`,
        checks: [
            { type: 'has_attribute', attribute: 'contractimpl', message: 'Missing #[contractimpl]', description: '#[contractimpl]' },
            { type: 'has_function', name: 'set_value', params: ['env', 'key', 'value'], message: "Missing 'set_value' function" },
            { type: 'has_function', name: 'get_value', params: ['env', 'key'], message: "Missing 'get_value' function" },
            { type: 'has_function', name: 'get_all_keys', params: ['env'], message: "Missing 'get_all_keys' function" },
            { type: 'returns_type', function: 'get_value', returnType: 'u32', message: "'get_value' should return u32" },
            { type: 'returns_type', function: 'get_all_keys', returnType: 'Vec<Symbol>', message: "'get_all_keys' should return Vec<Symbol>" },
            { type: 'contains_pattern', pattern: 'env.events().publish', message: 'Must use env.events().publish()', description: 'event publishing' },
            { type: 'storage_operation', operation: 'set', message: 'Must use storage set' },
            { type: 'storage_operation', operation: 'get', message: 'Must use storage get' },
        ],
        conceptsIntroduced: ['events', 'publish', 'Vec tracking', 'event-driven design'],
    },

    {
        id: 'approval-manager',
        chapter: 4,
        order: 10,
        difficulty: 'intermediate',
        xpReward: 350,

        template: `#![no_std]
use soroban_sdk::{contract, contractimpl, symbol_short, Address, Env, Symbol};

#[contract]
pub struct ApprovalContract;

#[contractimpl]
impl ApprovalContract {
    // TODO: Create 'approve' function
    // Parameters: env: Env, owner: Address, spender: Address, amount: i128
    // Should: require auth from owner, store allowance for (owner, spender)

    // TODO: Create 'transfer_from' function
    // Parameters: env: Env, owner: Address, spender: Address, to: Address, amount: i128
    // Should: require auth from spender, check allowance >= amount,
    //         decrement allowance, update balances

    // TODO: Create 'allowance' function
    // Parameters: env: Env, owner: Address, spender: Address
    // Returns: i128
    // Should: return the stored allowance (default 0)
}`,
        solution: `#![no_std]
use soroban_sdk::{contract, contractimpl, symbol_short, Address, Env, Symbol};

#[contract]
pub struct ApprovalContract;

#[contractimpl]
impl ApprovalContract {
    pub fn approve(env: Env, owner: Address, spender: Address, amount: i128) {
        owner.require_auth();
        env.storage().instance().set(&(owner, spender), &amount);
    }

    pub fn transfer_from(env: Env, owner: Address, spender: Address, to: Address, amount: i128) {
        spender.require_auth();
        let current: i128 = env.storage().instance().get(&(owner.clone(), spender.clone())).unwrap_or(0);
        env.storage().instance().set(&(owner.clone(), spender.clone()), &(current - amount));
        let owner_bal: i128 = env.storage().instance().get(&owner).unwrap_or(0);
        let to_bal: i128 = env.storage().instance().get(&to).unwrap_or(0);
        env.storage().instance().set(&owner, &(owner_bal - amount));
        env.storage().instance().set(&to, &(to_bal + amount));
    }

    pub fn allowance(env: Env, owner: Address, spender: Address) -> i128 {
        env.storage().instance().get(&(owner, spender)).unwrap_or(0)
    }
}`,
        checks: [
            { type: 'has_attribute', attribute: 'contractimpl', message: 'Missing #[contractimpl]', description: '#[contractimpl]' },
            { type: 'has_function', name: 'approve', params: ['env', 'owner', 'spender', 'amount'], message: "Missing 'approve' function" },
            { type: 'has_function', name: 'transfer_from', params: ['env', 'owner', 'spender', 'to', 'amount'], message: "Missing 'transfer_from' function" },
            { type: 'has_function', name: 'allowance', params: ['env', 'owner', 'spender'], message: "Missing 'allowance' function" },
            { type: 'returns_type', function: 'allowance', returnType: 'i128', message: "'allowance' should return i128" },
            { type: 'contains_pattern', pattern: 'require_auth()', message: 'Must use require_auth()', description: 'require_auth()' },
            { type: 'storage_operation', operation: 'set', message: 'Must use storage set' },
            { type: 'storage_operation', operation: 'get', message: 'Must use storage get' },
        ],
        conceptsIntroduced: ['compound storage keys', 'delegated authorization', 'allowance pattern'],
    },

/* ==========================================
   Chapter 5: Advanced Protocols
   ========================================== */

    {
        id: 'crowdfund',
        chapter: 5,
        order: 11,
        difficulty: 'intermediate',
        xpReward: 350,

        template: `#![no_std]
use soroban_sdk::{contract, contractimpl, symbol_short, Env, Symbol};

const GOAL: Symbol = symbol_short!("GOAL");
const DEADLINE: Symbol = symbol_short!("DEADLINE");
const TOTAL_RAISED: Symbol = symbol_short!("TOTAL");

#[contract]
pub struct CrowdfundContract;

#[contractimpl]
impl CrowdfundContract {
    // TODO: Create 'init' function
    // Parameters: env: Env, goal: i128, deadline: u32
    // Should: store the goal amount and deadline

    // TODO: Create 'contribute' function
    // Parameters: env: Env, amount: i128
    // Should: check deadline not passed, add amount to total raised

    // TODO: Create 'check_goal' function
    // Parameters: env: Env
    // Returns: bool
    // Should: return true if total raised >= goal

    // TODO: Create 'get_total_raised' function
    // Parameters: env: Env
    // Returns: i128
    // Should: return the total raised so far
}`,
        solution: `#![no_std]
use soroban_sdk::{contract, contractimpl, symbol_short, Env, Symbol};

const GOAL: Symbol = symbol_short!("GOAL");
const DEADLINE: Symbol = symbol_short!("DEADLINE");
const TOTAL_RAISED: Symbol = symbol_short!("TOTAL");

#[contract]
pub struct CrowdfundContract;

#[contractimpl]
impl CrowdfundContract {
    pub fn init(env: Env, goal: i128, deadline: u32) {
        env.storage().instance().set(&GOAL, &goal);
        env.storage().instance().set(&DEADLINE, &deadline);
    }

    pub fn contribute(env: Env, amount: i128) {
        let deadline: u32 = env.storage().instance().get(&DEADLINE).unwrap_or(0);
        if env.ledger().sequence() > deadline {
            panic!("Campaign ended");
        }
        let total: i128 = env.storage().instance().get(&TOTAL_RAISED).unwrap_or(0);
        env.storage().instance().set(&TOTAL_RAISED, &(total + amount));
    }

    pub fn check_goal(env: Env) -> bool {
        let total: i128 = env.storage().instance().get(&TOTAL_RAISED).unwrap_or(0);
        let goal: i128 = env.storage().instance().get(&GOAL).unwrap_or(0);
        total >= goal
    }

    pub fn get_total_raised(env: Env) -> i128 {
        env.storage().instance().get(&TOTAL_RAISED).unwrap_or(0)
    }
}`,
        checks: [
            { type: 'has_attribute', attribute: 'contractimpl', message: 'Missing #[contractimpl]', description: '#[contractimpl]' },
            { type: 'has_function', name: 'init', params: ['env', 'goal', 'deadline'], message: "Missing 'init' function" },
            { type: 'has_function', name: 'contribute', params: ['env', 'amount'], message: "Missing 'contribute' function" },
            { type: 'has_function', name: 'check_goal', params: ['env'], message: "Missing 'check_goal' function" },
            { type: 'has_function', name: 'get_total_raised', params: ['env'], message: "Missing 'get_total_raised' function" },
            { type: 'returns_type', function: 'check_goal', returnType: 'bool', message: "'check_goal' should return bool" },
            { type: 'returns_type', function: 'get_total_raised', returnType: 'i128', message: "'get_total_raised' should return i128" },
            { type: 'contains_pattern', pattern: 'panic!', message: 'Must panic if deadline has passed', description: 'panic for deadline' },
            { type: 'contains_pattern', pattern: 'ledger()', message: 'Must use env.ledger() for deadline check', description: 'ledger access' },
            { type: 'storage_operation', operation: 'set', message: 'Must use storage set' },
        ],
        conceptsIntroduced: ['crowdfunding', 'deadline pattern', 'goal tracking', 'ledger sequence'],
    },

    {
        id: 'escrow-agent',
        chapter: 5,
        order: 12,
        difficulty: 'advanced',
        xpReward: 400,

        template: `#![no_std]
use soroban_sdk::{contract, contractimpl, symbol_short, Address, Env, Symbol};

const BUYER: Symbol = symbol_short!("BUYER");
const SELLER: Symbol = symbol_short!("SELLER");
const ARBITER: Symbol = symbol_short!("ARBITER");
const DEPOSIT: Symbol = symbol_short!("DEPOSIT");

#[contract]
pub struct EscrowContract;

#[contractimpl]
impl EscrowContract {
    // TODO: Create 'init' function
    // Parameters: env: Env, buyer: Address, seller: Address, arbiter: Address
    // Should: store all three addresses

    // TODO: Create 'deposit' function
    // Parameters: env: Env, amount: i128
    // Should: require auth from buyer, store the deposit amount

    // TODO: Create 'release' function
    // Parameters: env: Env
    // Should: require auth from arbiter, return stored deposit amount
    // (simulating release to seller)

    // TODO: Create 'refund' function
    // Parameters: env: Env
    // Should: require auth from arbiter, return stored deposit amount
    // (simulating refund to buyer)
}`,
        solution: `#![no_std]
use soroban_sdk::{contract, contractimpl, symbol_short, Address, Env, Symbol};

const BUYER: Symbol = symbol_short!("BUYER");
const SELLER: Symbol = symbol_short!("SELLER");
const ARBITER: Symbol = symbol_short!("ARBITER");
const DEPOSIT: Symbol = symbol_short!("DEPOSIT");

#[contract]
pub struct EscrowContract;

#[contractimpl]
impl EscrowContract {
    pub fn init(env: Env, buyer: Address, seller: Address, arbiter: Address) {
        env.storage().instance().set(&BUYER, &buyer);
        env.storage().instance().set(&SELLER, &seller);
        env.storage().instance().set(&ARBITER, &arbiter);
    }

    pub fn deposit(env: Env, amount: i128) {
        let buyer: Address = env.storage().instance().get(&BUYER).unwrap();
        buyer.require_auth();
        env.storage().instance().set(&DEPOSIT, &amount);
    }

    pub fn release(env: Env) -> i128 {
        let arbiter: Address = env.storage().instance().get(&ARBITER).unwrap();
        arbiter.require_auth();
        let amount: i128 = env.storage().instance().get(&DEPOSIT).unwrap_or(0);
        env.storage().instance().remove(&DEPOSIT);
        amount
    }

    pub fn refund(env: Env) -> i128 {
        let arbiter: Address = env.storage().instance().get(&ARBITER).unwrap();
        arbiter.require_auth();
        let amount: i128 = env.storage().instance().get(&DEPOSIT).unwrap_or(0);
        env.storage().instance().remove(&DEPOSIT);
        amount
    }
}`,
        checks: [
            { type: 'has_attribute', attribute: 'contractimpl', message: 'Missing #[contractimpl]', description: '#[contractimpl]' },
            { type: 'has_function', name: 'init', params: ['env', 'buyer', 'seller', 'arbiter'], message: "Missing 'init' function" },
            { type: 'has_function', name: 'deposit', params: ['env', 'amount'], message: "Missing 'deposit' function" },
            { type: 'has_function', name: 'release', params: ['env'], message: "Missing 'release' function" },
            { type: 'has_function', name: 'refund', params: ['env'], message: "Missing 'refund' function" },
            { type: 'returns_type', function: 'release', returnType: 'i128', message: "'release' should return i128" },
            { type: 'returns_type', function: 'refund', returnType: 'i128', message: "'refund' should return i128" },
            { type: 'uses_type', typeName: 'Address', message: 'Must use Address type' },
            { type: 'contains_pattern', pattern: 'require_auth()', message: 'Must use require_auth()', description: 'require_auth()' },
            { type: 'storage_operation', operation: 'set', message: 'Must use storage set' },
            { type: 'storage_operation', operation: 'get', message: 'Must use storage get' },
        ],
        conceptsIntroduced: ['multi-party init', 'escrow pattern', 'dispute resolution', 'state machine'],
    },

    {
        id: 'subscription',
        chapter: 5,
        order: 13,
        difficulty: 'advanced',
        xpReward: 400,

        template: `#![no_std]
use soroban_sdk::{contract, contractimpl, symbol_short, Address, Env, Symbol};

const PLAN: Symbol = symbol_short!("PLAN");
const NEXT_BILLING: Symbol = symbol_short!("NEXT_BILL");
const ACTIVE: Symbol = symbol_short!("ACTIVE");
const INTERVAL: u32 = 1000;

#[contract]
pub struct SubscriptionContract;

#[contractimpl]
impl SubscriptionContract {
    // TODO: Create 'subscribe' function
    // Parameters: env: Env, user: Address, plan: Symbol
    // Should: require auth, store plan, set next billing to current seq + INTERVAL, mark active

    // TODO: Create 'collect' function
    // Parameters: env: Env, user: Address
    // Returns: i128
    // Should: check active, check billing due, simulate collection, update next billing

    // TODO: Create 'cancel' function
    // Parameters: env: Env, user: Address
    // Should: require auth, clear subscription data (set active to false or remove)

    // TODO: Create 'get_subscription' function
    // Parameters: env: Env, user: Address
    // Returns: Symbol
    // Should: return the plan symbol (or "None" if not active)
}`,
        solution: `#![no_std]
use soroban_sdk::{contract, contractimpl, symbol_short, Address, Env, Symbol};

const PLAN: Symbol = symbol_short!("PLAN");
const NEXT_BILLING: Symbol = symbol_short!("NEXT_BILL");
const ACTIVE: Symbol = symbol_short!("ACTIVE");
const INTERVAL: u32 = 1000;

#[contract]
pub struct SubscriptionContract;

#[contractimpl]
impl SubscriptionContract {
    pub fn subscribe(env: Env, user: Address, plan: Symbol) {
        user.require_auth();
        let next_billing = env.ledger().sequence() + INTERVAL;
        env.storage().instance().set(&(user.clone(), PLAN), &plan);
        env.storage().instance().set(&(user.clone(), NEXT_BILLING), &next_billing);
        env.storage().instance().set(&(user, ACTIVE), &true);
    }

    pub fn collect(env: Env, user: Address) -> i128 {
        let active: bool = env.storage().instance().get(&(user.clone(), ACTIVE)).unwrap_or(false);
        if !active { panic!("No active subscription"); }
        let next_billing: u32 = env.storage().instance().get(&(user.clone(), NEXT_BILLING)).unwrap_or(0);
        if env.ledger().sequence() < next_billing { panic!("Not yet due"); }
        let new_next = env.ledger().sequence() + INTERVAL;
        env.storage().instance().set(&(user, NEXT_BILLING), &new_next);
        100
    }

    pub fn cancel(env: Env, user: Address) {
        user.require_auth();
        env.storage().instance().set(&(user.clone(), ACTIVE), &false);
        env.storage().instance().remove(&(user.clone(), PLAN));
        env.storage().instance().remove(&(user, NEXT_BILLING));
    }

    pub fn get_subscription(env: Env, user: Address) -> Symbol {
        let active: bool = env.storage().instance().get(&(user.clone(), ACTIVE)).unwrap_or(false);
        if !active { return symbol_short!("None"); }
        env.storage().instance().get(&(user, PLAN)).unwrap_or(symbol_short!("None"))
    }
}`,
        checks: [
            { type: 'has_attribute', attribute: 'contractimpl', message: 'Missing #[contractimpl]', description: '#[contractimpl]' },
            { type: 'has_function', name: 'subscribe', params: ['env', 'user', 'plan'], message: "Missing 'subscribe' function" },
            { type: 'has_function', name: 'collect', params: ['env', 'user'], message: "Missing 'collect' function" },
            { type: 'has_function', name: 'cancel', params: ['env', 'user'], message: "Missing 'cancel' function" },
            { type: 'has_function', name: 'get_subscription', params: ['env', 'user'], message: "Missing 'get_subscription' function" },
            { type: 'returns_type', function: 'get_subscription', returnType: 'Symbol', message: "'get_subscription' should return Symbol" },
            { type: 'contains_pattern', pattern: 'require_auth()', message: 'Must use require_auth()', description: 'require_auth()' },
            { type: 'contains_pattern', pattern: 'panic!', message: 'Must use panic for error conditions', description: 'panic for errors' },
            { type: 'storage_operation', operation: 'set', message: 'Must use storage set' },
            { type: 'storage_operation', operation: 'get', message: 'Must use storage get' },
        ],
        conceptsIntroduced: ['recurring billing', 'subscription state', 'time-interval pattern', 'cancel pattern'],
    },

/* ==========================================
   Chapter 6: Production Systems
   ========================================== */

    {
        id: 'flash-loan',
        chapter: 6,
        order: 14,
        difficulty: 'advanced',
        xpReward: 450,

        template: `#![no_std]
use soroban_sdk::{contract, contractimpl, symbol_short, Address, Env, i128, Symbol};

const POOL: Symbol = symbol_short!("POOL");
const LOAN_AMOUNT: Symbol = symbol_short!("LOAN");
const FEE_DIVISOR: i128 = 100;

#[contract]
pub struct FlashLoanContract;

#[contractimpl]
impl FlashLoanContract {
    // TODO: Create 'init' function
    // Parameters: env: Env, initial_balance: i128
    // Should: store the initial pool balance

    // TODO: Create 'flash_loan' function
    // Parameters: env: Env, borrower: Address, amount: i128
    // Should: check pool has enough balance, deduct from pool,
    //         record loan amount for borrower

    // TODO: Create 'repay' function
    // Parameters: env: Env, borrower: Address, amount: i128
    // Should: check loan exists, calculate fee, add to pool, clear loan record

    // TODO: Create 'get_pool_balance' function
    // Parameters: env: Env
    // Returns: i128
    // Should: return current pool balance
}`,
        solution: `#![no_std]
use soroban_sdk::{contract, contractimpl, symbol_short, Address, Env, i128, Symbol};

const POOL: Symbol = symbol_short!("POOL");
const LOAN_AMOUNT: Symbol = symbol_short!("LOAN");
const FEE_DIVISOR: i128 = 100;

#[contract]
pub struct FlashLoanContract;

#[contractimpl]
impl FlashLoanContract {
    pub fn init(env: Env, initial_balance: i128) {
        env.storage().instance().set(&POOL, &initial_balance);
    }

    pub fn flash_loan(env: Env, borrower: Address, amount: i128) {
        let pool_bal: i128 = env.storage().instance().get(&POOL).unwrap_or(0);
        if pool_bal < amount { panic!("Insufficient pool balance"); }
        env.storage().instance().set(&POOL, &(pool_bal - amount));
        env.storage().instance().set(&(borrower, LOAN_AMOUNT), &amount);
    }

    pub fn repay(env: Env, borrower: Address, amount: i128) {
        let loan: i128 = env.storage().instance().get(&(borrower.clone(), LOAN_AMOUNT)).unwrap_or(0);
        if loan == 0 { panic!("No active loan"); }
        let fee = amount / FEE_DIVISOR;
        let pool_bal: i128 = env.storage().instance().get(&POOL).unwrap_or(0);
        env.storage().instance().set(&POOL, &(pool_bal + amount + fee));
        env.storage().instance().remove(&(borrower, LOAN_AMOUNT));
    }

    pub fn get_pool_balance(env: Env) -> i128 {
        env.storage().instance().get(&POOL).unwrap_or(0)
    }
}`,
        checks: [
            { type: 'has_attribute', attribute: 'contractimpl', message: 'Missing #[contractimpl]', description: '#[contractimpl]' },
            { type: 'has_function', name: 'init', params: ['env', 'initial_balance'], message: "Missing 'init' function" },
            { type: 'has_function', name: 'flash_loan', params: ['env', 'borrower', 'amount'], message: "Missing 'flash_loan' function" },
            { type: 'has_function', name: 'repay', params: ['env', 'borrower', 'amount'], message: "Missing 'repay' function" },
            { type: 'has_function', name: 'get_pool_balance', params: ['env'], message: "Missing 'get_pool_balance' function" },
            { type: 'returns_type', function: 'get_pool_balance', returnType: 'i128', message: "'get_pool_balance' should return i128" },
            { type: 'contains_pattern', pattern: 'panic!', message: 'Must use panic for error conditions', description: 'panic for errors' },
            { type: 'storage_operation', operation: 'set', message: 'Must use storage set' },
            { type: 'storage_operation', operation: 'get', message: 'Must use storage get' },
        ],
        conceptsIntroduced: ['flash loan', 'pool management', 'fee mechanism', 'loan lifecycle'],
    },

    {
        id: 'permissions-rbac',
        chapter: 6,
        order: 15,
        difficulty: 'advanced',
        xpReward: 450,

        template: `#![no_std]
use soroban_sdk::{contract, contractimpl, symbol_short, Address, Env, Symbol};

const ADMIN: Symbol = symbol_short!("ADMIN");

#[contract]
pub struct RBACContract;

#[contractimpl]
impl RBACContract {
    // TODO: Create 'init' function
    // Parameters: env: Env, admin: Address
    // Should: store the admin address

    // TODO: Create 'grant_role' function
    // Parameters: env: Env, user: Address, role: Symbol
    // Should: require auth from admin, store role membership

    // TODO: Create 'revoke_role' function
    // Parameters: env: Env, user: Address, role: Symbol
    // Should: require auth from admin, remove role membership

    // TODO: Create 'has_role' function
    // Parameters: env: Env, user: Address, role: Symbol
    // Returns: bool
    // Should: return true if user has the role
}`,
        solution: `#![no_std]
use soroban_sdk::{contract, contractimpl, symbol_short, Address, Env, Symbol};

const ADMIN: Symbol = symbol_short!("ADMIN");

#[contract]
pub struct RBACContract;

#[contractimpl]
impl RBACContract {
    pub fn init(env: Env, admin: Address) {
        env.storage().instance().set(&ADMIN, &admin);
    }

    pub fn grant_role(env: Env, user: Address, role: Symbol) {
        let admin: Address = env.storage().instance().get(&ADMIN).unwrap();
        admin.require_auth();
        env.storage().instance().set(&(user, role), &true);
    }

    pub fn revoke_role(env: Env, user: Address, role: Symbol) {
        let admin: Address = env.storage().instance().get(&ADMIN).unwrap();
        admin.require_auth();
        env.storage().instance().set(&(user, role), &false);
    }

    pub fn has_role(env: Env, user: Address, role: Symbol) -> bool {
        env.storage().instance().get(&(user, role)).unwrap_or(false)
    }
}`,
        checks: [
            { type: 'has_attribute', attribute: 'contractimpl', message: 'Missing #[contractimpl]', description: '#[contractimpl]' },
            { type: 'has_function', name: 'init', params: ['env', 'admin'], message: "Missing 'init' function" },
            { type: 'has_function', name: 'grant_role', params: ['env', 'user', 'role'], message: "Missing 'grant_role' function" },
            { type: 'has_function', name: 'revoke_role', params: ['env', 'user', 'role'], message: "Missing 'revoke_role' function" },
            { type: 'has_function', name: 'has_role', params: ['env', 'user', 'role'], message: "Missing 'has_role' function" },
            { type: 'returns_type', function: 'has_role', returnType: 'bool', message: "'has_role' should return bool" },
            { type: 'contains_pattern', pattern: 'require_auth()', message: 'Must use require_auth()', description: 'require_auth()' },
            { type: 'storage_operation', operation: 'set', message: 'Must use storage set' },
            { type: 'storage_operation', operation: 'get', message: 'Must use storage get' },
        ],
        conceptsIntroduced: ['RBAC', 'role membership', 'admin pattern', 'compound permission keys'],
    },

    {
        id: 'oracle-feed',
        chapter: 6,
        order: 16,
        difficulty: 'advanced',
        xpReward: 450,

        template: `#![no_std]
use soroban_sdk::{contract, contractimpl, symbol_short, Address, Env, Symbol, Vec};

const ADMIN: Symbol = symbol_short!("ADMIN");
const TS: Symbol = symbol_short!("TIMESTAMP");
const ASSETS: Symbol = symbol_short!("ASSETS");

#[contract]
pub struct OracleContract;

#[contractimpl]
impl OracleContract {
    // TODO: Create 'init' function
    // Parameters: env: Env, admin: Address
    // Should: store admin address

    // TODO: Create 'update_price' function
    // Parameters: env: Env, asset: Symbol, price: i128
    // Should: require auth from admin, store price and sequence,
    //         track asset key in Vec

    // TODO: Create 'get_price' function
    // Parameters: env: Env, asset: Symbol
    // Returns: i128
    // Should: return stored price (default 0)

    // TODO: Create 'get_last_updated' function
    // Parameters: env: Env, asset: Symbol
    // Returns: u32
    // Should: return stored sequence (default 0)

    // TODO: Create 'get_all_assets' function
    // Parameters: env: Env
    // Returns: Vec<Symbol>
    // Should: return all tracked asset symbols
}`,
        solution: `#![no_std]
use soroban_sdk::{contract, contractimpl, symbol_short, Address, Env, Symbol, Vec};

const ADMIN: Symbol = symbol_short!("ADMIN");
const TS: Symbol = symbol_short!("TIMESTAMP");
const ASSETS: Symbol = symbol_short!("ASSETS");

#[contract]
pub struct OracleContract;

#[contractimpl]
impl OracleContract {
    pub fn init(env: Env, admin: Address) {
        env.storage().instance().set(&ADMIN, &admin);
    }

    pub fn update_price(env: Env, asset: Symbol, price: i128) {
        let admin: Address = env.storage().instance().get(&ADMIN).unwrap();
        admin.require_auth();
        env.storage().instance().set(&asset, &price);
        env.storage().instance().set(&(asset.clone(), TS), &env.ledger().sequence());
        let mut assets: Vec<Symbol> = env.storage().instance()
            .get(&ASSETS)
            .unwrap_or(Vec::new(&env));
        if !assets.contains(&asset) {
            assets.push_back(asset);
            env.storage().instance().set(&ASSETS, &assets);
        }
    }

    pub fn get_price(env: Env, asset: Symbol) -> i128 {
        env.storage().instance().get(&asset).unwrap_or(0)
    }

    pub fn get_last_updated(env: Env, asset: Symbol) -> u32 {
        env.storage().instance().get(&(asset, TS)).unwrap_or(0)
    }

    pub fn get_all_assets(env: Env) -> Vec<Symbol> {
        env.storage().instance()
            .get(&ASSETS)
            .unwrap_or(Vec::new(&env))
    }
}`,
        checks: [
            { type: 'has_attribute', attribute: 'contractimpl', message: 'Missing #[contractimpl]', description: '#[contractimpl]' },
            { type: 'has_function', name: 'init', params: ['env', 'admin'], message: "Missing 'init' function" },
            { type: 'has_function', name: 'update_price', params: ['env', 'asset', 'price'], message: "Missing 'update_price' function" },
            { type: 'has_function', name: 'get_price', params: ['env', 'asset'], message: "Missing 'get_price' function" },
            { type: 'has_function', name: 'get_last_updated', params: ['env', 'asset'], message: "Missing 'get_last_updated' function" },
            { type: 'has_function', name: 'get_all_assets', params: ['env'], message: "Missing 'get_all_assets' function" },
            { type: 'returns_type', function: 'get_price', returnType: 'i128', message: "'get_price' should return i128" },
            { type: 'returns_type', function: 'get_all_assets', returnType: 'Vec<Symbol>', message: "'get_all_assets' should return Vec<Symbol>" },
            { type: 'contains_pattern', pattern: 'require_auth()', message: 'Must use require_auth()', description: 'require_auth()' },
            { type: 'storage_operation', operation: 'set', message: 'Must use storage set' },
            { type: 'storage_operation', operation: 'get', message: 'Must use storage get' },
        ],
        conceptsIntroduced: ['oracle pattern', 'price feed', 'asset tracking', 'off-chain bridge'],
    },

    {
        id: 'governor-simple',
        chapter: 6,
        order: 17,
        difficulty: 'advanced',
        xpReward: 500,

        template: `#![no_std]
use soroban_sdk::{contract, contractimpl, symbol_short, Address, Env, Symbol, Map};

const DESCRIPTION: Symbol = symbol_short!("DESC");
const DEADLINE: Symbol = symbol_short!("DEADLINE");
const VOTES: Symbol = symbol_short!("VOTES");
const EXECUTED: Symbol = symbol_short!("EXEC");
const YES_COUNT: Symbol = symbol_short!("YES");
const NO_COUNT: Symbol = symbol_short!("NO");

#[contract]
pub struct GovernorContract;

#[contractimpl]
impl GovernorContract {
    // TODO: Create 'create_proposal' function
    // Parameters: env: Env, creator: Address, description: Symbol, voting_period: u32
    // Should: require auth from creator, store description, calculate and store deadline,
    //         initialize vote counts to 0, create empty votes Map

    // TODO: Create 'vote' function
    // Parameters: env: Env, voter: Address, support: bool
    // Should: check proposal active (deadline not passed), check not already voted,
    //         record vote in Map, update yes/no counts

    // TODO: Create 'execute' function
    // Parameters: env: Env
    // Should: check not already executed, check deadline passed,
    //         check yes > no (majority), mark as executed

    // TODO: Create 'get_proposal' function
    // Parameters: env: Env
    // Returns: Symbol
    // Should: return the proposal description
}`,
        solution: `#![no_std]
use soroban_sdk::{contract, contractimpl, symbol_short, Address, Env, Symbol, Map};

const DESCRIPTION: Symbol = symbol_short!("DESC");
const DEADLINE: Symbol = symbol_short!("DEADLINE");
const VOTES: Symbol = symbol_short!("VOTES");
const EXECUTED: Symbol = symbol_short!("EXEC");
const YES_COUNT: Symbol = symbol_short!("YES");
const NO_COUNT: Symbol = symbol_short!("NO");

#[contract]
pub struct GovernorContract;

#[contractimpl]
impl GovernorContract {
    pub fn create_proposal(env: Env, creator: Address, description: Symbol, voting_period: u32) {
        creator.require_auth();
        let deadline = env.ledger().sequence() + voting_period;
        env.storage().instance().set(&DESCRIPTION, &description);
        env.storage().instance().set(&DEADLINE, &deadline);
        env.storage().instance().set(&YES_COUNT, &0u32);
        env.storage().instance().set(&NO_COUNT, &0u32);
        let empty_votes: Map<Address, bool> = Map::new(&env);
        env.storage().instance().set(&VOTES, &empty_votes);
    }

    pub fn vote(env: Env, voter: Address, support: bool) {
        let deadline: u32 = env.storage().instance().get(&DEADLINE).unwrap_or(0);
        if env.ledger().sequence() > deadline { panic!("Voting period ended"); }
        let mut votes: Map<Address, bool> = env.storage().instance()
            .get(&VOTES).unwrap_or(Map::new(&env));
        if votes.contains(&voter) { panic!("Already voted"); }
        votes.set(&voter, &support);
        env.storage().instance().set(&VOTES, &votes);
        if support {
            let yes: u32 = env.storage().instance().get(&YES_COUNT).unwrap_or(0);
            env.storage().instance().set(&YES_COUNT, &(yes + 1));
        } else {
            let no: u32 = env.storage().instance().get(&NO_COUNT).unwrap_or(0);
            env.storage().instance().set(&NO_COUNT, &(no + 1));
        }
    }

    pub fn execute(env: Env) -> bool {
        let executed: bool = env.storage().instance().get(&EXECUTED).unwrap_or(false);
        if executed { panic!("Already executed"); }
        let deadline: u32 = env.storage().instance().get(&DEADLINE).unwrap_or(0);
        if env.ledger().sequence() <= deadline { panic!("Voting period not ended"); }
        let yes: u32 = env.storage().instance().get(&YES_COUNT).unwrap_or(0);
        let no: u32 = env.storage().instance().get(&NO_COUNT).unwrap_or(0);
        if yes <= no { panic!("Proposal did not pass"); }
        env.storage().instance().set(&EXECUTED, &true);
        true
    }

    pub fn get_proposal(env: Env) -> Symbol {
        env.storage().instance().get(&DESCRIPTION).unwrap_or(symbol_short!("None"))
    }
}`,
        checks: [
            { type: 'has_attribute', attribute: 'contractimpl', message: 'Missing #[contractimpl]', description: '#[contractimpl]' },
            { type: 'has_function', name: 'create_proposal', params: ['env', 'creator', 'description', 'voting_period'], message: "Missing 'create_proposal' function" },
            { type: 'has_function', name: 'vote', params: ['env', 'voter', 'support'], message: "Missing 'vote' function" },
            { type: 'has_function', name: 'execute', params: ['env'], message: "Missing 'execute' function" },
            { type: 'has_function', name: 'get_proposal', params: ['env'], message: "Missing 'get_proposal' function" },
            { type: 'returns_type', function: 'execute', returnType: 'bool', message: "'execute' should return bool" },
            { type: 'returns_type', function: 'get_proposal', returnType: 'Symbol', message: "'get_proposal' should return Symbol" },
            { type: 'uses_type', typeName: 'Map', message: 'Must use Map type for votes' },
            { type: 'contains_pattern', pattern: 'require_auth()', message: 'Must use require_auth()', description: 'require_auth()' },
            { type: 'contains_pattern', pattern: 'panic!', message: 'Must use panic for error conditions', description: 'panic for errors' },
            { type: 'storage_operation', operation: 'set', message: 'Must use storage set' },
            { type: 'storage_operation', operation: 'get', message: 'Must use storage get' },
        ],
        conceptsIntroduced: ['governance', 'proposal lifecycle', 'vote tallying', 'quorum logic', 'execution'],
    },

/* ==========================================
   Chapter 7: Security (CTF)
   ========================================== */

    {
        id: 'reentrancy-guard',
        chapter: 7,
        order: 18,
        difficulty: 'advanced',
        xpReward: 500,

        template: `#![no_std]
use soroban_sdk::{contract, contractimpl, symbol_short, Address, Env, Symbol};

const BALANCE: Symbol = symbol_short!("BALANCE");

// BUG: This contract is vulnerable to reentrancy!
// The withdraw function sends funds before updating state.

#[contract]
pub struct VaultContract;

#[contractimpl]
impl VaultContract {
    pub fn deposit(env: Env, user: Address, amount: i128) {
        user.require_auth();
        let bal: i128 = env.storage().instance().get(&(user.clone(), BALANCE)).unwrap_or(0);
        env.storage().instance().set(&(user, BALANCE), &(bal + amount));
    }

    // TODO: Fix this function!
    // Add a mutex guard to prevent reentrancy attacks.
    // Current problem: state is updated after the simulated "send"
    pub fn withdraw(env: Env, user: Address, amount: i128) -> i128 {
        user.require_auth();
        let bal: i128 = env.storage().instance().get(&(user.clone(), BALANCE)).unwrap_or(0);
        // BUG: This should update state FIRST, or use a mutex
        env.storage().instance().set(&(user.clone(), BALANCE), &(bal - amount));
        amount
    }

    pub fn get_balance(env: Env, user: Address) -> i128 {
        env.storage().instance().get(&(user, BALANCE)).unwrap_or(0)
    }
}`,
        solution: `#![no_std]
use soroban_sdk::{contract, contractimpl, symbol_short, Address, Env, Symbol};

const BALANCE: Symbol = symbol_short!("BALANCE");
const MUTEX: Symbol = symbol_short!("MUTEX");

#[contract]
pub struct VaultContract;

#[contractimpl]
impl VaultContract {
    pub fn deposit(env: Env, user: Address, amount: i128) {
        user.require_auth();
        let bal: i128 = env.storage().instance().get(&(user.clone(), BALANCE)).unwrap_or(0);
        env.storage().instance().set(&(user, BALANCE), &(bal + amount));
    }

    pub fn withdraw(env: Env, user: Address, amount: i128) -> i128 {
        if env.storage().instance().get(&MUTEX).unwrap_or(false) {
            panic!("Reentrancy detected");
        }
        env.storage().instance().set(&MUTEX, &true);
        user.require_auth();
        let bal: i128 = env.storage().instance().get(&(user.clone(), BALANCE)).unwrap_or(0);
        env.storage().instance().set(&(user.clone(), BALANCE), &(bal - amount));
        env.storage().instance().set(&MUTEX, &false);
        amount
    }

    pub fn get_balance(env: Env, user: Address) -> i128 {
        env.storage().instance().get(&(user, BALANCE)).unwrap_or(0)
    }
}`,
        checks: [
            { type: 'has_attribute', attribute: 'contractimpl', message: 'Missing #[contractimpl]', description: '#[contractimpl]' },
            { type: 'has_function', name: 'withdraw', params: ['env', 'user', 'amount'], message: "Missing 'withdraw' function" },
            { type: 'has_function', name: 'deposit', params: ['env', 'user', 'amount'], message: "Missing 'deposit' function" },
            { type: 'has_function', name: 'get_balance', params: ['env', 'user'], message: "Missing 'get_balance' function" },
            { type: 'contains_pattern', pattern: 'MUTEX', message: 'Must define a MUTEX symbol for the reentrancy guard', description: 'MUTEX constant' },
            { type: 'contains_pattern', pattern: 'panic!', message: 'Must panic when reentrancy is detected', description: 'panic on reentrancy' },
            { type: 'storage_operation', operation: 'set', message: 'Must use storage set for state' },
            { type: 'storage_operation', operation: 'get', message: 'Must use storage get for state' },
        ],
        conceptsIntroduced: ['reentrancy', 'mutex guard', 'security pattern', 'vulnerability fix'],
    },

    {
        id: 'access-control-fix',
        chapter: 7,
        order: 19,
        difficulty: 'advanced',
        xpReward: 500,

        template: `#![no_std]
use soroban_sdk::{contract, contractimpl, symbol_short, Address, Env, Symbol};

const ADMIN: Symbol = symbol_short!("ADMIN");
const FEE: Symbol = symbol_short!("FEE");
const PAUSED: Symbol = symbol_short!("PAUSED");

// BUG: This contract stores an admin but never checks authorization!
// The set_fee and pause functions should be admin-only.

#[contract]
pub struct ConfigContract;

#[contractimpl]
impl ConfigContract {
    pub fn init(env: Env, admin: Address) {
        env.storage().instance().set(&ADMIN, &admin);
        env.storage().instance().set(&FEE, &100i128);
        env.storage().instance().set(&PAUSED, &false);
    }

    // TODO: Add access control! require_auth() from admin before changing fee
    pub fn set_fee(env: Env, new_fee: i128) {
        // Missing: admin.require_auth()
        env.storage().instance().set(&FEE, &new_fee);
    }

    // TODO: Add access control! require_auth() from admin before pausing
    pub fn pause(env: Env, paused: bool) {
        // Missing: admin.require_auth()
        env.storage().instance().set(&PAUSED, &paused);
    }

    pub fn get_fee(env: Env) -> i128 {
        env.storage().instance().get(&FEE).unwrap_or(0)
    }

    pub fn is_paused(env: Env) -> bool {
        env.storage().instance().get(&PAUSED).unwrap_or(false)
    }
}`,
        solution: `#![no_std]
use soroban_sdk::{contract, contractimpl, symbol_short, Address, Env, Symbol};

const ADMIN: Symbol = symbol_short!("ADMIN");
const FEE: Symbol = symbol_short!("FEE");
const PAUSED: Symbol = symbol_short!("PAUSED");

#[contract]
pub struct ConfigContract;

#[contractimpl]
impl ConfigContract {
    pub fn init(env: Env, admin: Address) {
        env.storage().instance().set(&ADMIN, &admin);
        env.storage().instance().set(&FEE, &100i128);
        env.storage().instance().set(&PAUSED, &false);
    }

    pub fn set_fee(env: Env, new_fee: i128) {
        let admin: Address = env.storage().instance().get(&ADMIN).unwrap();
        admin.require_auth();
        env.storage().instance().set(&FEE, &new_fee);
    }

    pub fn pause(env: Env, paused: bool) {
        let admin: Address = env.storage().instance().get(&ADMIN).unwrap();
        admin.require_auth();
        env.storage().instance().set(&PAUSED, &paused);
    }

    pub fn get_fee(env: Env) -> i128 {
        env.storage().instance().get(&FEE).unwrap_or(0)
    }

    pub fn is_paused(env: Env) -> bool {
        env.storage().instance().get(&PAUSED).unwrap_or(false)
    }
}`,
        checks: [
            { type: 'has_attribute', attribute: 'contractimpl', message: 'Missing #[contractimpl]', description: '#[contractimpl]' },
            { type: 'has_function', name: 'set_fee', params: ['env', 'new_fee'], message: "Missing 'set_fee' function" },
            { type: 'has_function', name: 'pause', params: ['env', 'paused'], message: "Missing 'pause' function" },
            { type: 'has_function', name: 'get_fee', params: ['env'], message: "Missing 'get_fee' function" },
            { type: 'has_function', name: 'is_paused', params: ['env'], message: "Missing 'is_paused' function" },
            { type: 'contains_pattern', pattern: 'require_auth()', message: 'Must use require_auth() for access control', description: 'require_auth() call' },
            { type: 'storage_operation', operation: 'set', message: 'Must use storage set' },
            { type: 'storage_operation', operation: 'get', message: 'Must use storage get' },
        ],
        conceptsIntroduced: ['access control', 'authorization fix', 'admin guard', 'security audit'],
    },

    /* ==========================================
       Standalone Missions — outside campaign structure
       Self-contained drills, no level gating. Filtered out of
       campaign progression but still count toward XP/gold.
       ========================================== */

    {
        id: 'standalone-storage-dojo',
        standalone: true,
        order: 20,
        difficulty: 'beginner',
        xpReward: 120,

        template: `#![no_std]
use soroban_sdk::{contract, contractimpl, symbol_short, Env, Symbol};

const VALUE: Symbol = symbol_short!("VALUE");

#[contract]
pub struct StorageDojo;

#[contractimpl]
impl StorageDojo {
    // TODO: Create 'set_value' function
    // Parameters: env: Env, value: u32
    // Should store the value under VALUE key

    // TODO: Create 'get_value' function
    // Parameters: env: Env
    // Returns: u32
    // Should return the stored value or 0 if not set

}`,
        solution: `#![no_std]
use soroban_sdk::{contract, contractimpl, symbol_short, Env, Symbol};

const VALUE: Symbol = symbol_short!("VALUE");

#[contract]
pub struct StorageDojo;

#[contractimpl]
impl StorageDojo {
    pub fn set_value(env: Env, value: u32) {
        env.storage().instance().set(&VALUE, &value);
    }

    pub fn get_value(env: Env) -> u32 {
        env.storage().instance().get(&VALUE).unwrap_or(0)
    }
}`,
        checks: [
            { type: 'has_attribute', attribute: 'contractimpl', message: 'Missing #[contractimpl]', description: '#[contractimpl]' },
            { type: 'has_function', name: 'set_value', params: ['env', 'value'], message: "Missing 'set_value' function" },
            { type: 'has_function', name: 'get_value', params: ['env'], message: "Missing 'get_value' function" },
            { type: 'returns_type', function: 'get_value', returnType: 'u32', message: "'get_value' should return u32" },
            { type: 'storage_operation', operation: 'set', message: 'Must use storage set to store the value' },
            { type: 'storage_operation', operation: 'get', message: 'Must use storage get to read the value' },
            { type: 'uses_type', typeName: 'Symbol', message: 'Must use Symbol for the storage key' },
        ],
        conceptsIntroduced: ['storage', 'instance', 'set', 'get', 'unwrap_or'],
    },

    {
        id: 'standalone-auth-guard',
        standalone: true,
        order: 21,
        difficulty: 'beginner',
        xpReward: 150,

        template: `#![no_std]
use soroban_sdk::{contract, contractimpl, symbol_short, Address, Env, Symbol};

const ADMIN: Symbol = symbol_short!("ADMIN");
const DONE: Symbol = symbol_short!("DONE");

#[contract]
pub struct AuthGuard;

#[contractimpl]
impl AuthGuard {
    // TODO: Create 'init' function
    // Parameters: env: Env, admin: Address
    // Should store admin

    // TODO: Create 'protected_action' function
    // Parameters: env: Env, user: Address
    // Should call user.require_auth() and set DONE to true

    // TODO: Create 'is_done' function
    // Parameters: env: Env
    // Returns: bool
    // Should return the DONE flag or false

}`,
        solution: `#![no_std]
use soroban_sdk::{contract, contractimpl, symbol_short, Address, Env, Symbol};

const ADMIN: Symbol = symbol_short!("ADMIN");
const DONE: Symbol = symbol_short!("DONE");

#[contract]
pub struct AuthGuard;

#[contractimpl]
impl AuthGuard {
    pub fn init(env: Env, admin: Address) {
        env.storage().instance().set(&ADMIN, &admin);
        env.storage().instance().set(&DONE, &false);
    }

    pub fn protected_action(env: Env, user: Address) {
        user.require_auth();
        env.storage().instance().set(&DONE, &true);
    }

    pub fn is_done(env: Env) -> bool {
        env.storage().instance().get(&DONE).unwrap_or(false)
    }
}`,
        checks: [
            { type: 'has_attribute', attribute: 'contractimpl', message: 'Missing #[contractimpl]', description: '#[contractimpl]' },
            { type: 'has_function', name: 'init', params: ['env', 'admin'], message: "Missing 'init' function" },
            { type: 'has_function', name: 'protected_action', params: ['env', 'user'], message: "Missing 'protected_action' function" },
            { type: 'has_function', name: 'is_done', params: ['env'], message: "Missing 'is_done' function" },
            { type: 'returns_type', function: 'is_done', returnType: 'bool', message: "'is_done' should return bool" },
            { type: 'contains_pattern', pattern: 'require_auth()', message: 'Must use require_auth() for access control', description: 'require_auth()' },
            { type: 'storage_operation', operation: 'set', message: 'Must use storage set' },
            { type: 'storage_operation', operation: 'get', message: 'Must use storage get' },
            { type: 'uses_type', typeName: 'Address', message: 'Must use Address type' },
        ],
        conceptsIntroduced: ['Address', 'require_auth', 'access control', 'bool storage'],
    },

    {
        id: 'standalone-vector-lab',
        standalone: true,
        order: 22,
        difficulty: 'beginner',
        xpReward: 130,

        template: `#![no_std]
use soroban_sdk::{contract, contractimpl, vec, Env, Vec};

#[contract]
pub struct VectorLab;

#[contractimpl]
impl VectorLab {
    // TODO: Create 'make_sequence' function
    // Parameters: env: Env
    // Returns: Vec<u32>
    // Should return vec![&env, 1u32, 2u32, 3u32]

    // TODO: Create 'get_length' function
    // Parameters: env: Env, vals: Vec<u32>
    // Returns: u32
    // Should return vals.len()

}`,
        solution: `#![no_std]
use soroban_sdk::{contract, contractimpl, vec, Env, Vec};

#[contract]
pub struct VectorLab;

#[contractimpl]
impl VectorLab {
    pub fn make_sequence(env: Env) -> Vec<u32> {
        vec![&env, 1u32, 2u32, 3u32]
    }

    pub fn get_length(env: Env, vals: Vec<u32>) -> u32 {
        vals.len()
    }
}`,
        checks: [
            { type: 'has_attribute', attribute: 'contractimpl', message: 'Missing #[contractimpl]', description: '#[contractimpl]' },
            { type: 'has_function', name: 'make_sequence', params: ['env'], message: "Missing 'make_sequence' function" },
            { type: 'returns_type', function: 'make_sequence', returnType: 'Vec<u32>', message: "'make_sequence' should return Vec<u32>" },
            { type: 'has_function', name: 'get_length', params: ['env', 'vals'], message: "Missing 'get_length' function" },
            { type: 'returns_type', function: 'get_length', returnType: 'u32', message: "'get_length' should return u32" },
            { type: 'contains_pattern', pattern: 'vec![', message: 'Must use vec! macro', description: 'vec! macro' },
            { type: 'uses_type', typeName: 'Vec', message: 'Must use Vec type' },
        ],
        conceptsIntroduced: ['Vec', 'vec! macro', 'len', 'collections'],
    },
    ...authoredMissions,
];
