/* ==========================================
   Soroban SDK Reference Data
   Structured documentation entries for common SDK items
   ========================================== */

export const sdkReference = [
  // ============ TYPES ============
  {
    id: 'env',
    name: 'Env',
    category: 'Types',
    description: 'The execution environment object. Provides access to contract execution context, storage, events, and utility functions.',
    signature: 'pub struct Env',
    params: [],
    returnType: 'N/A',
    example: `let env = Env::current();
let ledger_sequence = env.ledger().sequence();`,
    docUrl: 'https://docs.rs/soroban-sdk/latest/soroban_sdk/struct.Env.html'
  },
  {
    id: 'address',
    name: 'Address',
    category: 'Types',
    description: 'Represents an account or contract address on the Stellar network. Used for authentication and contract interactions.',
    signature: 'pub struct Address',
    params: [],
    returnType: 'N/A',
    example: `let addr = Address::from_contract_id(&env, &contract_id);
env.invoke_contract(
  &addr, 
  &symbol_short!("transfer"), 
  &args
);`,
    docUrl: 'https://docs.rs/soroban-sdk/latest/soroban_sdk/struct.Address.html'
  },
  {
    id: 'symbol',
    name: 'Symbol',
    category: 'Types',
    description: 'A compact string type optimized for contract names and identifiers. More efficient than String for small values.',
    signature: 'pub struct Symbol',
    params: [],
    returnType: 'N/A',
    example: `let symbol = symbol_short!("USDC");
let name_symbol = Symbol::new(&env, "balance");`,
    docUrl: 'https://docs.rs/soroban-sdk/latest/soroban_sdk/struct.Symbol.html'
  },
  {
    id: 'vec',
    name: 'Vec',
    category: 'Types',
    description: 'A variable-length collection type. Stores multiple items of the same type in contract storage.',
    signature: 'pub struct Vec<T>',
    params: ['T - The element type'],
    returnType: 'N/A',
    example: `let mut accounts: Vec<Address> = vec![&env];
accounts.push_back(new_account);
let first = accounts.front();`,
    docUrl: 'https://docs.rs/soroban-sdk/latest/soroban_sdk/struct.Vec.html'
  },
  {
    id: 'map',
    name: 'Map',
    category: 'Types',
    description: 'A key-value store collection. Maps unique keys to values, useful for user balances and state.',
    signature: 'pub struct Map<K, V>',
    params: ['K - Key type', 'V - Value type'],
    returnType: 'N/A',
    example: `let mut balances: Map<Address, i128> = Map::new(&env);
balances.set(user, 1000);
let balance = balances.get(user).unwrap_or(0);`,
    docUrl: 'https://docs.rs/soroban-sdk/latest/soroban_sdk/struct.Map.html'
  },
  {
    id: 'bytesn',
    name: 'BytesN',
    category: 'Types',
    description: 'Fixed-size byte array. Used for hashes, signatures, and other byte data with known length.',
    signature: 'pub struct BytesN<const N: usize>',
    params: ['N - Fixed size in bytes'],
    returnType: 'N/A',
    example: `let hash: BytesN<32> = env.crypto().sha256(&data);
let mut bytes = BytesN::<4>::zero(&env);`,
    docUrl: 'https://docs.rs/soroban-sdk/latest/soroban_sdk/struct.BytesN.html'
  },
  {
    id: 'string',
    name: 'String',
    category: 'Types',
    description: 'Variable-length UTF-8 string type. Used for longer text values and descriptions.',
    signature: 'pub struct String',
    params: [],
    returnType: 'N/A',
    example: `let message = String::from_slice(&env, "Hello, Soroban!");
let len = message.len();`,
    docUrl: 'https://docs.rs/soroban-sdk/latest/soroban_sdk/struct.String.html'
  },

  // ============ STORAGE ============
  {
    id: 'storage',
    name: 'storage()',
    category: 'Storage',
    description: 'Access the contract storage through Env. Returns a storage object for persistent and instance data.',
    signature: 'pub fn storage(&self) -> Storage',
    params: [],
    returnType: 'Storage',
    example: `let storage = env.storage();
let persistent = storage.persistent();
persistent.set(&key, &value);`,
    docUrl: 'https://docs.rs/soroban-sdk/latest/soroban_sdk/struct.Env.html#method.storage'
  },
  {
    id: 'ledger-key-type',
    name: 'Ledger Key Types',
    category: 'Storage',
    description: 'Storage types for contract data: Persistent (long-term), Instance (contract lifetime), or Temporary (short-term).',
    signature: 'persistent / instance / temporary',
    params: [],
    returnType: 'N/A',
    example: `// Persistent: Lives until explicitly deleted
storage.persistent().set(&key, &value);

// Instance: Lives while contract exists
storage.instance().set(&key, &value);

// Temporary: Auto-expires after ~4 weeks
storage.temporary().set(&key, &value);`,
    docUrl: 'https://docs.rs/soroban-sdk/latest/soroban_sdk/struct.Storage.html'
  },

  // ============ AUTH ============
  {
    id: 'require-auth',
    name: 'require_auth()',
    category: 'Auth',
    description: 'Verifies that a specific address has authorized the current contract invocation. Essential for security.',
    signature: 'pub fn require_auth(&self, address: &Address)',
    params: ['address - The address to verify'],
    returnType: '()',
    example: `pub fn transfer(env: &Env, to: Address, amount: i128) {
    let caller = env.invoker();
    caller.require_auth();
    // Caller is verified, proceed with transfer
}`,
    docUrl: 'https://docs.rs/soroban-sdk/latest/soroban_sdk/struct.Address.html#method.require_auth'
  },
  {
    id: 'invoker',
    name: 'invoker()',
    category: 'Auth',
    description: 'Returns the Address of the account or contract that invoked the current contract function.',
    signature: 'pub fn invoker(&self) -> Address',
    params: [],
    returnType: 'Address',
    example: `let caller = env.invoker();
caller.require_auth();
println!("Called by: {:?}", caller);`,
    docUrl: 'https://docs.rs/soroban-sdk/latest/soroban_sdk/struct.Env.html#method.invoker'
  },

  // ============ UTILITIES ============
  {
    id: 'contract-attr',
    name: '#[contract]',
    category: 'Utilities',
    description: 'Macro attribute that marks a struct as a Soroban smart contract. Required for all contracts.',
    signature: '#[contract]',
    params: [],
    returnType: 'N/A',
    example: `#[contract]
pub struct MyContract;

#[contractimpl]
impl MyContract {
    // Methods here
}`,
    docUrl: 'https://docs.rs/soroban-sdk/latest/soroban_sdk/attr.contract.html'
  },
  {
    id: 'contractimpl-attr',
    name: '#[contractimpl]',
    category: 'Utilities',
    description: 'Macro attribute for the implementation block containing contract functions. Exports functions as contract entry points.',
    signature: '#[contractimpl]',
    params: [],
    returnType: 'N/A',
    example: `#[contract]
pub struct HelloContract;

#[contractimpl]
impl HelloContract {
    pub fn greet(env: Env, name: Symbol) -> String {
        // Contract logic
    }
}`,
    docUrl: 'https://docs.rs/soroban-sdk/latest/soroban_sdk/attr.contractimpl.html'
  },
  {
    id: 'events',
    name: 'env.events()',
    category: 'Utilities',
    description: 'Emit events from your contract. Events are logged on the Stellar ledger for off-chain monitoring.',
    signature: 'pub fn events(&self) -> Events',
    params: [],
    returnType: 'Events',
    example: `env.events().publish(
    (Symbol::new(&env, "transfer"),),
    (from, to, amount)
);`,
    docUrl: 'https://docs.rs/soroban-sdk/latest/soroban_sdk/struct.Env.html#method.events'
  },
  {
    id: 'invoke-contract',
    name: 'invoke_contract()',
    category: 'Utilities',
    description: 'Call another contract function. Essential for cross-contract interactions.',
    signature: 'pub fn invoke_contract<T>(&self, contract: &Address, func: &Symbol, args: &Vec<Val>) -> T',
    params: ['contract - Target contract Address', 'func - Function name as Symbol', 'args - Function arguments'],
    returnType: 'T - Return value from called function',
    example: `let transfer_args = vec![&env, to, amount];
env.invoke_contract::<i128>(
    &token_contract,
    &Symbol::new(&env, "transfer"),
    &transfer_args
);`,
    docUrl: 'https://docs.rs/soroban-sdk/latest/soroban_sdk/struct.Env.html#method.invoke_contract'
  },
  {
    id: 'token-interface',
    name: 'Token (Interface)',
    category: 'Utilities',
    description: 'Standard interface for Soroban token contracts. Includes transfer, mint, burn, and balance functions.',
    signature: 'pub trait Token { ... }',
    params: [],
    returnType: 'N/A',
    example: `// Using token client
let client = TokenClient::new(&env, &token_id);
client.transfer(&from, &to, &amount);
let balance = client.balance(&account);`,
    docUrl: 'https://docs.rs/soroban-sdk/latest/soroban_sdk_token/index.html'
  },
];

// Categories for tab filtering
export const SDK_CATEGORIES = ['All', 'Types', 'Storage', 'Auth', 'Utilities'];

// Helper function to get entries by category
export function getEntriesByCategory(category) {
  if (category === 'All') return sdkReference;
  return sdkReference.filter(entry => entry.category === category);
}

// Helper function to search entries
export function searchSDKEntries(query) {
  const lowerQuery = query.toLowerCase();
  return sdkReference.filter(entry =>
    entry.name.toLowerCase().includes(lowerQuery) ||
    entry.description.toLowerCase().includes(lowerQuery)
  );
}

// Helper function to get highlighted entries by concept
export function getHighlightedEntries(concepts = []) {
  if (!concepts || concepts.length === 0) return [];
  const conceptsLower = concepts.map(c => c.toLowerCase());
  return sdkReference.filter(entry =>
    conceptsLower.includes(entry.name.toLowerCase()) ||
    conceptsLower.some(c => entry.id.toLowerCase().includes(c))
  );
}
