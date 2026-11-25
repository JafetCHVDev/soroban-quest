/* eslint-disable no-useless-escape */
import helloSorobanMarkdown from '../hello-soroban.md?raw';
import { parseMissionMarkdown } from '../../../systems/missionParser.js';
const helloSoroban = parseMissionMarkdown(helloSorobanMarkdown);

export const missionLocale = {
  "hello-soroban": { title: helloSoroban.title, story: helloSoroban.story, learningGoal: helloSoroban.learningGoal, hints: helloSoroban.hints },
  "greetings-protocol": {
                title: 'Greetings Protocol',
                story: `# 📡 The Signal Tower

The first gate is open. You advance to the **Signal Tower**, where messages ripple across the Stellar network.

*"Communication is power,"* says the Tower Keeper. *"Your contract must learn to manage data — accepting input and returning structured responses."*

## Your Mission

Build a contract with multiple functions:
- \`greet\` — takes a name and returns a personalized greeting
- \`count_chars\` — takes a string and returns its length as a u32

## What You'll Learn

- Multiple functions in a single contract
- Working with \`String\` type in Soroban
- Returning different types from functions
- The \`symbol_short!\` macro

## Key Concepts

\`\`\`rust
String              // Full string type in Soroban
symbol_short!()     // Create a Symbol from a short literal
u32                 // Unsigned 32-bit integer
\`\`\``,
                learningGoal: 'Build a multi-function contract with different return types',
                hints: [
                    'The greet function signature: `pub fn greet(env: Env, name: Symbol) -> Vec<Symbol>`',
                    'For count_chars: `pub fn count_chars(env: Env, text: String) -> u32`',
                    'Use `text.len()` to get the string length',
                ],
            },
  "counter-vault": {
                title: 'The Counter Vault',
                story: `# 🔐 The Vault of Memory

You descend into the **Vault of Memory**, where the ancients stored wisdom that persists across time.

*"A contract without memory is like a sentient without a soul,"* murmurs the Vault Keeper. *"Learn to store and retrieve — to remember."*

## Your Mission

Create a counter contract that persists its value:
- \`increment\` — increases the counter by 1
- \`get_count\` — returns the current count

## What You'll Learn

- **Persistent storage** with \`env.storage().instance()\`
- Reading and writing state
- The \`Symbol\` key pattern for storage
- Default values with \`.unwrap_or()\`

## Key Concepts

\`\`\`rust
env.storage().instance().set(&key, &value)  // Write
env.storage().instance().get(&key)          // Read (returns Option)
.unwrap_or(default)                         // Default if None
\`\`\``,
                learningGoal: 'Use persistent storage to create a stateful counter contract',
                hints: [
                    'Use `env.storage().instance().get(&COUNTER)` to read the count',
                    'Use `.unwrap_or(0)` to default to 0 when no value exists',
                    'Use `env.storage().instance().set(&COUNTER, &new_count)` to store the new count',
                ],
            },
  "guardian-ledger": {
                title: 'Guardian Ledger',
                story: `# 📋 The Guardian Ledger

The Council Chamber glows with ancient light. Before you lies the **Guardian Ledger** — a registry of all who have proven themselves.

*"To protect the realm, you must control who can act,"* declares the Council Head. *"Learn the art of access control."*

## Your Mission

Build a registry contract with access control:
- \`register\` — registers a new guardian (stores their name)
- \`get_guardian\` — retrieves a guardian's name by address
- An \`admin\` address that is set on initialization

## What You'll Learn

- The \`Address\` type for user identities
- \`require_auth()\` for access control
- Working with \`Map\` type for key-value pairs
- Contract initialization patterns

## Key Concepts

\`\`\`rust
Address                     // Represents an account/identity
address.require_auth()      // Ensures the caller is authorized
Map<Address, Symbol>        // Key-value mapping
\`\`\``,
                learningGoal: 'Implement access control with Address and require_auth',
                hints: [
                    'The init function stores the admin: `env.storage().instance().set(&ADMIN, &admin)`',
                    'In register, call `who.require_auth()` before storing',
                    'Store with: `env.storage().instance().set(&who, &name)`',
                ],
            },
  "token-forge": {
                title: 'Token Forge',
                story: `# ⚒️ The Token Forge

Deep within the Citadel lies the **Token Forge**, where digital assets are minted from pure logic.

*"Currency is the lifeblood of any economy,"* says the Forgemaster. *"You will create a token that can be transferred between accounts."*

## Your Mission

Create a simple token contract:
- \`mint\` — creates tokens for an address (admin only)
- \`balance\` — returns the balance of an address
- \`transfer\` — moves tokens from one address to another

## What You'll Learn

- Token balance management
- Transfer logic with authorization
- Admin-restricted functions
- Integer arithmetic for balances

## Key Concepts

\`\`\`rust
// Admin check pattern
admin.require_auth();

// Balance management
let bal: i128 = env.storage().persistent().get(&from).unwrap_or(0);
\`\`\``,
                learningGoal: 'Build a basic token with mint, balance, and transfer functions',
                hints: [
                    'For mint: get admin from storage, call admin.require_auth(), then update balance',
                    'For balance: `env.storage().persistent().get(&account).unwrap_or(0)`',
                    'For transfer: require_auth from sender, read both balances, update both',
                ],
            },
  "time-lock": {
                title: 'The Time Lock',
                story: `# ⏳ The Chrono Gate

The **Chrono Gate** stands before you, its mechanisms ticking with the rhythm of the ledger.

*"Time is a weapon,"* says the Chrono Guardian. *"Learn to lock and unlock based on the passage of blocks."*

## Your Mission

Create a time-locked vault:
- \`lock\` — locks tokens until a specified ledger sequence number
- \`unlock\` — releases tokens if the lock period has passed
- \`get_lock_info\` — returns when the lock expires

## What You'll Learn

- Ledger sequence / timestamp for time-based logic
- Conditional execution based on blockchain state
- \`env.ledger().sequence()\` for current block
- Panic patterns for error handling

## Key Concepts

\`\`\`rust
env.ledger().sequence()  // Current ledger sequence number
panic!("message")        // Abort with error
\`\`\``,
                learningGoal: 'Implement time-based conditional logic using ledger sequence',
                hints: [
                    'Use `env.ledger().sequence()` to get the current ledger number',
                    'Compare: `if current_seq < unlock_at { panic!("Still locked"); }`',
                    'Clear storage after unlock: `env.storage().instance().remove(&key)`',
                ],
            },
  "multi-party-pact": {
                title: 'Multi-Party Pact',
                story: `# 🤝 The Hall of Pacts

You have reached the **Hall of Pacts**, the final challenge before earning your place among the Guardians.

*"The true power of smart contracts,"* declares the Grand Elder, *"is that they enable trust between strangers."*

## Your Mission

Create a multi-signature agreement contract:
- \`create_pact\` — creates an agreement requiring N signatures
- \`sign_pact\` — allows a party to sign the agreement
- \`is_complete\` — checks if all required signatures are collected
- \`get_signers\` — returns who has signed

## What You'll Learn

- Complex data structures in contracts
- Multi-party authorization
- Counting and tracking with storage
- Building real-world governance patterns

## Key Concepts

\`\`\`rust
// Track signer count
let count: u32 = env.storage().instance()
    .get(&SIGNER_COUNT).unwrap_or(0);

// Store with dynamic keys
env.storage().instance().set(&signer_key, &true);
\`\`\``,
                learningGoal: 'Build a multi-signature pact contract with complex state management',
                hints: [
                    'In create_pact: store the description, required count, and initial signed count of 0',
                    'In sign_pact: read current count, increment by 1, store back',
                    'In is_complete: compare signed >= required',
                ],
            },
  "vault-manager": {
                title: 'Vault Manager',
                story: `# 🏦 The Data Fortress

Beyond the Hall of Pacts lies the **Data Fortress**, where countless user balances are stored and protected.

*"One balance is trivial,"* says the Vault Architect. *"Managing many — that is the art of storage architecture."*

## Your Mission

Build a vault contract that manages multiple user balances:
- \`deposit\` — adds funds to a user's balance (user must auth)
- \`withdraw\` — subtracts funds from a user's balance (user must auth)
- \`get_balance\` — returns a user's current balance

## What You'll Learn

- \`Map<Address, i128>\` for multi-user state
- \`Env::require_auth()\` for per-user authorization
- Persistent storage with complex keys
- Safe arithmetic patterns

## Key Concepts

\`\`\`rust
// Map for multiple balances
let mut balances: Map<Address, i128> = env.storage()
    .instance()
    .get(&BALANCES)
    .unwrap_or(Map::new(&env));

// Per-user auth
user.require_auth();

// Update and persist
balances.set(user, &(current + amount));
env.storage().instance().set(&BALANCES, &balances);
\`\`\``,
                learningGoal: 'Build a multi-user vault with Map storage pattern',
                hints: [
                    'Use Map<Address, i128> to store user balances',
                    'Call user.require_auth() before modifying a user balance',
                    'Read the Map from storage with .unwrap_or(Map::new(&env))',
                    'For deposit: get current balance, add amount, set back',
                ],
            },
  "event-emitter": {
                title: 'Event Emitter',
                story: `# 📡 The Signal Beacon

High atop the Data Fortress stands the **Signal Beacon**, broadcasting events across the Stellar network.

*"Contracts that speak are contracts that are understood,"* says the Beacon Keeper. *"Events let the world know what happened."*

## Your Mission

Create a contract that stores key-value data and emits events for every state change:
- \`set_value\` — stores a value and emits an event with the key and value
- \`get_value\` — retrieves a stored value by key
- \`get_all_keys\` — returns all stored keys

## What You'll Learn

- \`env.events().publish()\` for emitting events
- \`Vec<Symbol>\` for dynamic key tracking
- Event-driven contract architecture
- Publish-subscribe patterns on Stellar

## Key Concepts

\`\`\`rust
// Emit an event
env.events().publish(
    &symbol_short!("set_value"),
    (key, value),
);

// Track keys in a Vec
let mut keys = env.storage().instance()
    .get(&KEYS)
    .unwrap_or(Vec::new(&env));
keys.push_back(key);
\`\`\``,
                learningGoal: 'Implement event emission in a key-value store contract',
                hints: [
                    'Use env.events().publish() with a topic Symbol and event data',
                    'Use Vec<Symbol> to track all stored keys',
                    'Push new keys with keys.push_back(key)',
                ],
            },
  "approval-manager": {
                title: 'Approval Manager',
                story: `# ✋ The Chamber of Delegation

Within the Data Fortress lies the **Chamber of Delegation**, where trust is formalized through allowances.

*"You cannot always act yourself,"* explains the Delegation Master. *"Sometimes you must empower others to act on your behalf."*

## Your Mission

Build a contract that allows users to approve others to spend on their behalf:
- \`approve\` — owner authorizes a spender for a given amount
- \`transfer_from\` — spender transfers from owner to a recipient
- \`allowance\` — check how much a spender is authorized to spend

## What You'll Learn

- Nested key-value patterns (owner -> spender -> allowance)
- Delegated authorization
- Dual-address storage keys
- Allowance decrement pattern

## Key Concepts

\`\`\`rust
// Compound storage key for allowances
let allowance_key = (owner.clone(), spender.clone());
env.storage().instance().set(&allowance_key, &amount);

// Read nested allowance
env.storage().instance().get(&(owner, spender))
    .unwrap_or(0)
\`\`\``,
                learningGoal: 'Implement an allowance and delegated transfer system',
                hints: [
                    'Use a tuple (Address, Address) as a compound storage key',
                    'In approve: store the allowance for (owner, spender) pair',
                    'In transfer_from: require_auth from spender, check allowance, decrement it, update balances',
                ],
            },
  "crowdfund": {
                title: 'Crowdfund Campaign',
                story: `# 🎯 The Crowdforge Arena

You enter the **Crowdforge Arena**, where collective power brings ideas to life.

*"Alone you are strong,"* announces the Auctioneer. *"Together, you can move stars. Build a campaign that the people can fund."*

## Your Mission

Create a crowdfunding contract:
- \`init\` — sets the funding goal and deadline (ledger sequence)
- \`contribute\` — adds funds from a contributor
- \`check_goal\` — returns true if total contributions >= goal
- \`get_total_raised\` — returns the total funds raised

## What You'll Learn

- Ledger sequence for time-based deadlines
- Escrow-like fund accumulation
- Goal tracking with conditional checks
- Multi-contributor state management

## Key Concepts

\`\`\`rust
// Track total raised
let total: i128 = env.storage().instance()
    .get(&TOTAL_RAISED)
    .unwrap_or(0);

env.storage().instance().set(&TOTAL_RAISED, &(total + amount));

// Check deadline
let deadline: u32 = env.storage().instance()
    .get(&DEADLINE)
    .unwrap_or(0);
if env.ledger().sequence() > deadline { panic!("Campaign ended"); }
\`\`\``,
                learningGoal: 'Build a crowdfunding contract with goal and deadline tracking',
                hints: [
                    'In init: store the goal amount and deadline ledger sequence',
                    'In contribute: check deadline has not passed, add amount to total',
                    'In check_goal: compare total raised against the goal',
                ],
            },
  "escrow-agent": {
                title: 'Escrow Agent',
                story: `# 🤲 The Trust Exchange

Deep within the Crowdforge Arena is the **Trust Exchange**, where transactions between strangers are mediated.

*"Trust is the rarest currency,"* says the Escrow Mediator. *"Build a system that holds value until conditions are met."*

## Your Mission

Create an escrow contract with buyer, seller, and arbiter:
- \`init\` — sets up the escrow with buyer, seller, and arbiter addresses
- \`deposit\` — buyer deposits funds into escrow
- \`release\` — arbiter releases funds to the seller
- \`refund\` — arbiter refunds the buyer

## What You'll Learn

- Multi-party contract initialization
- Three-actor authorization patterns
- State machine for escrow lifecycle
- Dispute resolution patterns

## Key Concepts

\`\`\`rust
// Multi-party init
pub fn init(env: Env, buyer: Address, seller: Address, arbiter: Address) {
    env.storage().instance().set(&BUYER, &buyer);
    env.storage().instance().set(&SELLER, &seller);
    env.storage().instance().set(&ARBITER, &arbiter);
}

// Arbiter-only functions
arbiter.require_auth();
\`\`\``,
                learningGoal: 'Implement a multi-party escrow contract with dispute resolution',
                hints: [
                    'In init: store buyer, seller, and arbiter addresses',
                    'In deposit: require auth from buyer and store the amount',
                    'In release: require auth from arbiter, transfer to seller',
                    'In refund: require auth from arbiter, return to buyer',
                ],
            },
  "subscription": {
                title: 'Subscription Manager',
                story: `# 🔄 The Recurring Engine

At the heart of the Advanced Protocols district hums the **Recurring Engine**, powering automated periodic agreements.

*"The most powerful contracts are those that work without constant attention,"* says the Engine Tender. *"Build a subscription that collects recurring payments."*

## Your Mission

Create a subscription management contract:
- \`subscribe\` — user subscribes to a plan (stores plan, next billing)
- \`collect\` — collects the subscription fee if billing is due
- \`cancel\` — cancels the subscription
- \`get_subscription\` — returns subscription info for a user

## What You'll Learn

- Recurring billing logic with ledger sequence
- Subscription state management
- Cancel and refund patterns
- Time-interval calculations

## Key Concepts

\`\`\`rust
// Track subscription period
let interval: u32 = 1000; // billing every ~1000 ledgers
let next_billing: u32 = env.ledger().sequence() + interval;

// Check if billing is due
if env.ledger().sequence() >= next_billing {
    // collect payment
}
\`\`\``,
                learningGoal: 'Build a recurring subscription contract with periodic billing',
                hints: [
                    'In subscribe: store the plan, set next_billing to current sequence + interval',
                    'In collect: check if current sequence >= next_billing, if so collect and update next_billing',
                    'In cancel: clear subscription data from storage',
                ],
            },
  "flash-loan": {
                title: 'Flash Loan Pool',
                story: `# ⚡ The Lightning Vault

In the deepest layer of the Citadel lies the **Lightning Vault**, where capital moves at the speed of light.

*"Flash loans are the ultimate test of contract design,"* says the Lightning Archon. *"Borrow, use, and repay in a single transaction."*

## Your Mission

Build a simplified flash loan pool:
- \`init\` — sets the pool balance
- \`flash_loan\` — borrows from the pool (must repay within the call)
- \`get_pool_balance\` — returns the current pool balance
- \`repay\` — repays the borrowed amount plus a small fee

## What You'll Learn

- Flash loan mechanics (simplified for validation)
- Pool balance management
- Loan lifecycle tracking
- Fee-on-repay patterns

## Key Concepts

\`\`\`rust
// Track active loan
let loan: i128 = env.storage().instance()
    .get(&(borrower.clone(), LOAN_AMOUNT))
    .unwrap_or(0);

// Repay with fee
let fee = amount / 100; // 1% fee
env.storage().instance().set(&POOL, &(pool_bal + amount + fee));
\`\`\``,
                learningGoal: 'Build a simplified flash loan pool contract',
                hints: [
                    'In init: store the initial pool balance',
                    'In flash_loan: check pool has enough, deduct from pool, record the loan',
                    'In repay: check loan exists, add funds plus fee back to pool, clear loan',
                ],
            },
  "permissions-rbac": {
                title: 'Permissions RBAC',
                story: `# 🛡️ The Role Hall

Beyond the Lightning Vault rises the **Role Hall**, where access is governed by structured permissions.

*"Not all who wander are meant to access all doors,"* declares the Role Master. *"Build a system where roles define what one can do."*

## Your Mission

Create a role-based access control contract:
- \`grant_role\` — admin grants a role to a user
- \`revoke_role\` — admin revokes a role from a user
- \`has_role\` — checks if a user has a specific role
- \`get_admin\` — returns the contract admin

## What You'll Learn

- Role-based access control (RBAC) patterns
- Admin-only privileged functions
- Compound keys for role membership
- Flexible permission architecture

## Key Concepts

\`\`\`rust
// Grant a role
let role_key = (user.clone(), role.clone());
env.storage().instance().set(&role_key, &true);

// Check role membership
env.storage().instance()
    .get(&(user.clone(), role.clone()))
    .unwrap_or(false)
\`\`\``,
                learningGoal: 'Implement a role-based access control contract',
                hints: [
                    'In init: store the admin address',
                    'In grant_role: require auth from admin, store role membership for user',
                    'In revoke_role: require auth from admin, remove the role membership',
                    'In has_role: check if the role key exists and is true',
                ],
            },
  "oracle-feed": {
                title: 'Oracle Feed',
                story: `# 📊 The Oracle Spire

At the pinnacle of the Production Systems district stands the **Oracle Spire**, where off-chain data enters the blockchain.

*"Smart contracts are blind without data,"* says the Oracle Sage. *"Build a bridge between the on-chain and off-chain worlds."*

## Your Mission

Create a price oracle contract:
- \`update_price\` — admin updates the price for an asset pair
- \`get_price\` — returns the current price for an asset pair
- \`get_last_updated\` — returns when the price was last updated
- \`get_all_assets\` — returns all tracked asset pairs

## What You'll Learn

- Oracle data feed patterns
- Admin-only update functions
- Timestamp/sequence tracking
- Asset pair management with Vec<Symbol>

## Key Concepts

\`\`\`rust
// Store price with metadata
pub fn update_price(env: Env, asset: Symbol, price: i128) {
    admin.require_auth();
    env.storage().instance().set(&asset, &price);
    env.storage().instance()
        .set(&(asset.clone(), TIMESTAMP), &env.ledger().sequence());
}
\`\`\``,
                learningGoal: 'Build an on-chain price oracle with admin updates',
                hints: [
                    'In update_price: require auth from admin, store price and sequence',
                    'In get_price: look up and return the price for the asset',
                    'In get_last_updated: return the stored sequence for the asset',
                    'In get_all_assets: use a Vec<Symbol> tracker similar to event-emitter',
                ],
            },
  "governor-simple": {
                title: 'Simple Governor',
                story: `# 🏛️ The Hall of Governance

The final chamber awaits — the **Hall of Governance**, where the fate of the entire realm is decided by collective will.

*"The greatest smart contracts empower communities to govern themselves,"* proclaims the Grand Elder. *"Build a system where proposals become law through voting."*

## Your Mission

Create a governance contract with proposals and voting:
- \`create_proposal\` — creates a proposal with a description and voting period
- \`vote\` — cast a vote (yes/no) on an active proposal
- \`execute\` — executes a proposal if it passes
- \`get_proposal\` — returns proposal details

## What You'll Learn

- On-chain governance mechanisms
- Proposal lifecycle (create → vote → execute)
- Vote tallying with Map<Address, bool>
- Quorum and approval threshold logic

## Key Concepts

\`\`\`rust
// Track votes per proposal
let mut votes: Map<Address, bool> = env.storage().instance()
    .get(&VOTES)
    .unwrap_or(Map::new(&env));
votes.set(&voter, &support);

// Count approval
let yes_votes: u32 = /* count votes where value is true */
let no_votes: u32 = /* count votes where value is false */
\`\`\``,
                learningGoal: 'Build a complete on-chain governance system with proposals and voting',
                hints: [
                    'In create_proposal: store description, deadline, yes/no counts',
                    'In vote: check proposal is active, record voter choice, update tallies',
                    'In execute: check proposal passed (yes > no), mark as executed',
                ],
            },
  "reentrancy-guard": {
                title: 'Reentrancy Guard',
                story: `# 🛡️ The Vulnerability Forge

Deep beneath the Citadel lies the **Vulnerability Forge**, where broken contracts are made whole.

*"The most dangerous vulnerability in smart contracts,"* warns the Security Sage, *"is reentrancy. A contract that calls external code while holding state can be exploited."*

## Your Mission

The vault contract below is vulnerable to reentrancy — it updates its balance AFTER sending funds. Your job is to fix it using a **mutex guard** pattern: a boolean flag that prevents reentrancy.

The vulnerable code has:
- \`withdraw\` that sends funds BEFORE updating state (the bug)
- No reentrancy protection

Fix it by:
1. Adding a \`MUTEX\` boolean storage key initialized to \`false\`
2. At the start of \`withdraw\`, set it to \`true\`
3. At the end of \`withdraw\`, set it back to \`false\`
4. Check the mutex at entry and panic if already locked

## What You'll Learn

- Reentrancy vulnerability identification
- Mutex/guard pattern for prevention
- Check-effects-interaction pattern
- Security-first development mindset

## Key Concepts

\`\`\`rust
// Mutex guard pattern
if env.storage().instance().get(&MUTEX).unwrap_or(false) {
    panic!("Reentrancy detected");
}
env.storage().instance().set(&MUTEX, &true);
// ... vulnerable operations ...
env.storage().instance().set(&MUTEX, &false);
\`\`\``,
                learningGoal: 'Fix a reentrancy vulnerability using the mutex guard pattern',
                hints: [
                    'Add a MUTEX constant: `const MUTEX: Symbol = symbol_short!("MUTEX");`',
                    'At the start of withdraw, check if mutex is true and panic if so',
                    'Set mutex to true before the balance update, false after',
                ],
            },
  "access-control-fix": {
                title: 'Access Control Fix',
                story: `# 🔓 The Permissions Breach

The **Permissions Breach** is a training ground where broken authorization logic is repaired.

*"The second most common vulnerability,"* explains the Security Sage, *"is missing access control. Functions that should be restricted to admins are callable by anyone."*

## Your Mission

The contract below has an \`admin\` address stored but NEVER uses \`require_auth()\` on privileged functions. Your job is to add proper access control.

The vulnerable code has:
- An \`ADMIN\` constant defined but never checked
- \`set_fee\` and \`pause\` functions callable by anyone
- No \`require_auth()\` calls anywhere

Fix it by:
1. Adding \`require_auth()\` checks on \`set_fee\` and \`pause\`
2. Reading the admin address from storage before checking auth

## What You'll Learn

- Access control vulnerability identification
- Proper \`require_auth()\` placement
- Admin-only function patterns
- Defense-in-depth principles

## Key Concepts

\`\`\`rust
// Correct access control
let admin: Address = env.storage().instance().get(&ADMIN).unwrap();
admin.require_auth();

// Now perform privileged operation
env.storage().instance().set(&FEE, &new_fee);
\`\`\``,
                learningGoal: 'Fix missing access control by adding require_auth() checks',
                hints: [
                    'In set_fee: read ADMIN from storage, call admin.require_auth()',
                    'In pause: read ADMIN from storage, call admin.require_auth()',
                    'The init function is fine — it already stores the admin correctly',
                ],
            },
  "standalone-storage-dojo": {
                title: 'Storage Dojo',
                story: `# 🥋 Storage Dojo

Welcome to the **Storage Dojo** — a quiet training hall outside the campaign path.

*"Before mastering complex protocols, drill the basics until they are reflex,"* says the Dojo Master.

## Your Mission

Build a minimal storage contract that can save and retrieve a single value:

- \`set_value\` — stores a \`u32\` under a fixed key
- \`get_value\` — retrieves the stored value (defaults to \`0\` if empty)

## What You'll Learn

- \`env.storage().instance().set(&key, &value)\` — write
- \`env.storage().instance().get(&key).unwrap_or(0)\` — read with default
- The \`symbol_short!\` macro for storage keys

## Key Concepts

\`\`\`rust
const VALUE: Symbol = symbol_short!("VALUE");
env.storage().instance().set(&VALUE, &value);
env.storage().instance().get(&VALUE).unwrap_or(0)
\`\`\``,
                learningGoal: 'Practice basic instance storage: set and get a u32 value',
                hints: [
                    'Define `const VALUE: Symbol = symbol_short!("VALUE");` at the top',
                    'In set_value: `env.storage().instance().set(&VALUE, &value)`',
                    'In get_value: `env.storage().instance().get(&VALUE).unwrap_or(0)`',
                ],
            },
  "standalone-auth-guard": {
                title: 'Auth Guard Drill',
                story: `# 🛡️ Auth Guard Drill

Step into the **Guard Post** — a standalone drill for authorization.

*"Every state change must prove who asked for it,"* warns the Guard Captain.

## Your Mission

Build a contract that gates a privileged action behind \`require_auth\`:

- \`init\` — stores an admin address
- \`protected_action\` — requires auth from the caller, flips a \`DONE\` flag to \`true\`
- \`is_done\` — returns whether the flag is set

## What You'll Learn

- \`Address\` type for identities
- \`address.require_auth()\` guard
- Storing and checking a boolean flag

## Key Concepts

\`\`\`rust
let admin: Address = env.storage().instance().get(&ADMIN).unwrap();
admin.require_auth();
env.storage().instance().set(&DONE, &true);
\`\`\``,
                learningGoal: 'Practice require_auth gating for a protected state change',
                hints: [
                    'Store admin in init: `env.storage().instance().set(&ADMIN, &admin)`',
                    'In protected_action: read caller auth with `user.require_auth()`',
                    'Set flag: `env.storage().instance().set(&DONE, &true)`',
                ],
            },
  "standalone-vector-lab": {
                title: 'Vector Lab',
                story: `# 🧪 Vector Lab

Enter the **Vector Lab** — a hands-on workshop for Soroban's most flexible collection.

*"Vectors hold the many, order the many, return the many,"* says the Lab Technician.

## Your Mission

Create a contract that builds and inspects Vectors:

- \`make_sequence\` — returns a \`Vec<u32>\` containing \`[1, 2, 3]\`
- \`get_length\` — takes a \`Vec<u32>\` and returns its length as \`u32\`

## What You'll Learn

- \`Vec\` type and the \`vec![&env, ...]\` macro
- \`Vec::len()\` for length
- Passing Vectors between functions

## Key Concepts

\`\`\`rust
use soroban_sdk::{vec, Vec};
vec![&env, 1u32, 2u32, 3u32]
vals.len()
\`\`\``,
                learningGoal: 'Practice creating and inspecting Vec<u32> collections',
                hints: [
                    'Use `vec![&env, 1u32, 2u32, 3u32]` to build the sequence',
                    'Signature for get_length: `pub fn get_length(env: Env, vals: Vec<u32>) -> u32`',
                    'Return length with `vals.len()`',
                ],
            },
};
