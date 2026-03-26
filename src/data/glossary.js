export const glossaryTerms = [
  {
    name: "#[contract]",
    category: "Attributes",
    description:
      "Marks a Rust struct as a Soroban smart contract. Required on the struct that represents your contract.",
    code: `#[contract]
  pub struct HelloContract;`,
    missions: ["hello-soroban"],
  },
  {
    name: "#[contractimpl]",
    category: "Attributes",
    description:
      "Marks an impl block as containing the contract's public functions. All callable contract methods go inside this block.",
    code: `#[contractimpl]
  impl HelloContract {
      pub fn hello(env: Env, to: Symbol) -> Vec<Symbol> {
          vec![&env, symbol_short!("Hello"), to]
      }
  }`,
    missions: ["hello-soroban", "greetings-protocol"],
  },
  {
    name: "Env",
    category: "Types",
    description:
      "The execution environment passed to every contract function. Provides access to storage, ledger info, events, and more.",
    code: `pub fn my_fn(env: Env) {
      let seq = env.ledger().sequence();
      env.storage().instance().set(&KEY, &value);
  }`,
    missions: ["hello-soroban"],
  },
  {
    name: "Symbol",
    category: "Types",
    description:
      "A small, efficient string-like type in Soroban. Used for short identifiers, storage keys, and return values.",
    code: `use soroban_sdk::Symbol;
  const KEY: Symbol = symbol_short!("COUNTER");`,
    missions: ["hello-soroban", "counter-vault"],
  },
  {
    name: "Vec",
    category: "Types",
    description:
      "A Soroban-native vector type. Created using the vec![] macro with &env as the first argument.",
    code: `use soroban_sdk::Vec;
  let v: Vec<Symbol> = vec![&env, symbol_short!("Hello"), to];`,
    missions: ["hello-soroban"],
  },
  {
    name: "String",
    category: "Types",
    description:
      "Full string type in Soroban for longer text values. Supports .len() to get character count.",
    code: `use soroban_sdk::String;
  pub fn count_chars(env: Env, text: String) -> u32 {
      text.len()
  }`,
    missions: ["greetings-protocol"],
  },
  {
    name: "u32",
    category: "Types",
    description:
      "Unsigned 32-bit integer. Commonly used for counts, sequence numbers, and small numeric values.",
    code: `pub fn get_count(env: Env) -> u32 {
      env.storage().instance().get(&COUNTER).unwrap_or(0)
  }`,
    missions: ["greetings-protocol", "counter-vault"],
  },
  {
    name: "i128",
    category: "Types",
    description:
      "Signed 128-bit integer. The standard type for token balances and large numeric values in Soroban.",
    code: `let balance: i128 = env.storage().persistent().get(&account).unwrap_or(0);`,
    missions: ["token-forge"],
  },
  {
    name: "Address",
    category: "Types",
    description:
      "Represents a Stellar account or contract identity. Used for access control and identifying users.",
    code: `use soroban_sdk::Address;
  pub fn register(env: Env, who: Address, name: Symbol) {
      who.require_auth();
  }`,
    missions: ["guardian-ledger", "token-forge"],
  },
  {
    name: "storage().instance()",
    category: "Storage",
    description:
      "Instance storage is tied to the contract instance lifetime. Best for contract-wide configuration and counters.",
    code: `// Write
  env.storage().instance().set(&KEY, &value);
  // Read
  let val: u32 = env.storage().instance().get(&KEY).unwrap_or(0);
  // Delete
  env.storage().instance().remove(&KEY);`,
    missions: ["counter-vault", "guardian-ledger"],
  },
  {
    name: "storage().persistent()",
    category: "Storage",
    description:
      "Persistent storage survives beyond the contract instance. Used for per-user data like token balances.",
    code: `// Store a balance
  env.storage().persistent().set(&address, &amount);
  // Read a balance
  let bal: i128 = env.storage().persistent().get(&address).unwrap_or(0);`,
    missions: ["token-forge"],
  },
  {
    name: "unwrap_or()",
    category: "Storage",
    description:
      "Safely unwraps an Option returned by storage.get(). Provides a default value when no data exists yet.",
    code: `let count: u32 = env.storage().instance()
      .get(&COUNTER)
      .unwrap_or(0); // default to 0 if not set`,
    missions: ["counter-vault"],
  },
  {
    name: "require_auth()",
    category: "Auth",
    description:
      "Asserts that the given Address has authorized the current contract invocation. Panics if not authorized.",
    code: `pub fn register(env: Env, who: Address, name: Symbol) {
      who.require_auth(); // panics if 'who' didn't sign
      env.storage().instance().set(&who, &name);
  }`,
    missions: [
      "guardian-ledger",
      "token-forge",
      "time-lock",
      "multi-party-pact",
    ],
  },
  {
    name: "ledger().sequence()",
    category: "Functions",
    description:
      "Returns the current ledger sequence number. Used for time-based logic like locks and expiry.",
    code: `let current: u32 = env.ledger().sequence();
  if current < unlock_at {
      panic!("Still locked");
  }`,
    missions: ["time-lock"],
  },
  {
    name: "panic!()",
    category: "Functions",
    description:
      "Aborts contract execution with an error message. Used for enforcing conditions and error handling.",
    code: `if current_seq < unlock_at {
      panic!("Still locked");
  }`,
    missions: ["time-lock"],
  },
  {
    name: "symbol_short!()",
    category: "Functions",
    description:
      "Macro that creates a Symbol from a short string literal (max 9 characters). Used for storage keys.",
    code: `const COUNTER: Symbol = symbol_short!("COUNTER");
  let greeting = symbol_short!("Hello");`,
    missions: ["hello-soroban", "counter-vault"],
  },
  {
    name: "vec![]",
    category: "Functions",
    description:
      "Macro to create a Soroban Vec. Always pass &env as the first argument.",
    code: `let result = vec![&env, symbol_short!("Hello"), to];`,
    missions: ["hello-soroban"],
  },
  {
    name: "multiple functions",
    category: "Functions",
    description:
      "A single contract can expose multiple public functions. Each function is independently callable and can have different parameters and return types.",
    code: `#[contractimpl]
impl GreetingContract {
    pub fn greet(env: Env, name: Symbol) -> Vec<Symbol> {
        vec![&env, symbol_short!("Greetings"), name]
    }

    pub fn count_chars(env: Env, text: String) -> u32 {
        text.len()
    }
}`,
    missions: ["greetings-protocol"],
  },
  {
    name: "Map",
    category: "Types",
    description:
      "A key-value mapping type in Soroban. Used to associate one value with another, such as an Address to a Symbol.",
    code: `use soroban_sdk::Map;
let mut map: Map<Address, Symbol> = Map::new(&env);
map.set(address, symbol_short!("Guardian"));`,
    missions: ["guardian-ledger"],
  },
  {
    name: "bool",
    category: "Types",
    description:
      "Boolean type. Used for true/false return values such as checking if a condition is met.",
    code: `pub fn is_complete(env: Env) -> bool {
    let signed: u32 = env.storage().instance().get(&SIGNED).unwrap_or(0);
    let required: u32 = env.storage().instance().get(&REQUIRED).unwrap_or(1);
    signed >= required
}`,
    missions: ["multi-party-pact"],
  },
  {
    name: "init pattern",
    category: "Functions",
    description:
      "A convention for initializing contract state. An init function is called once to set up admin addresses or default values before the contract is used.",
    code: `pub fn init(env: Env, admin: Address) {
    env.storage().instance().set(&ADMIN, &admin);
}`,
    missions: ["guardian-ledger", "token-forge"],
  },
  {
    name: "mint",
    category: "Functions",
    description:
      "A pattern for creating new tokens and assigning them to an address. Typically restricted to an admin using require_auth().",
    code: `pub fn mint(env: Env, to: Address, amount: i128) {
    let admin: Address = env.storage().instance().get(&ADMIN).unwrap();
    admin.require_auth();
    let balance: i128 = env.storage().persistent().get(&to).unwrap_or(0);
    env.storage().persistent().set(&to, &(balance + amount));
}`,
    missions: ["token-forge"],
  },
  {
    name: "transfer",
    category: "Functions",
    description:
      "A pattern for moving token balances between two addresses. Requires authorization from the sender.",
    code: `pub fn transfer(env: Env, from: Address, to: Address, amount: i128) {
    from.require_auth();
    let from_bal: i128 = env.storage().persistent().get(&from).unwrap_or(0);
    let to_bal: i128 = env.storage().persistent().get(&to).unwrap_or(0);
    env.storage().persistent().set(&from, &(from_bal - amount));
    env.storage().persistent().set(&to, &(to_bal + amount));
}`,
    missions: ["token-forge"],
  },
  {
    name: "time-lock",
    category: "Functions",
    description:
      "A pattern that prevents an action until a specific ledger sequence number is reached. Used to lock funds or actions for a period of time.",
    code: `pub fn unlock(env: Env, owner: Address) -> i128 {
    owner.require_auth();
    let current_seq = env.ledger().sequence();
    let unlock_at: u32 = env.storage().instance().get(&UNLOCK_AT).unwrap_or(0);
    if current_seq < unlock_at {
        panic!("Still locked");
    }
    env.storage().instance().get(&LOCKED_AMOUNT).unwrap_or(0)
}`,
    missions: ["time-lock"],
  },
  {
    name: "storage().remove()",
    category: "Storage",
    description:
      "Deletes a key from contract storage. Used to clean up state after it is no longer needed, such as after unlocking a time-locked vault.",
    code: `env.storage().instance().remove(&LOCKED_AMOUNT);
env.storage().instance().remove(&UNLOCK_AT);`,
    missions: ["time-lock"],
  },
  {
    name: "multi-sig",
    category: "Auth",
    description:
      "A pattern requiring multiple parties to authorize an action before it executes. Implemented by tracking a signature count against a required threshold.",
    code: `pub fn sign_pact(env: Env, signer: Address) {
    signer.require_auth();
    let count: u32 = env.storage().instance().get(&SIGNED).unwrap_or(0);
    env.storage().instance().set(&SIGNED, &(count + 1));
}`,
    missions: ["multi-party-pact"],
  },
  {
    name: "governance pattern",
    category: "Functions",
    description:
      "A contract design where multiple parties must agree before an action is taken. Combines multi-sig, state tracking, and completion checks.",
    code: `pub fn is_complete(env: Env) -> bool {
    let signed: u32 = env.storage().instance().get(&SIGNED).unwrap_or(0);
    let required: u32 = env.storage().instance().get(&REQUIRED).unwrap_or(1);
    signed >= required
}`,
    missions: ["multi-party-pact"],
  },
];

export const categories = [
  "All",
  "Attributes",
  "Types",
  "Storage",
  "Auth",
  "Functions",
];
