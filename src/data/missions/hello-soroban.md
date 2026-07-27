---
id: hello-soroban
chapter: 1
order: 1
difficulty: beginner
xp: 100
skills:
  - contract
  - contractimpl
  - Env
  - Symbol
  - Vec
prereqs: []
title: The First Contract
learningGoal: Create your first Soroban smart contract with a hello function
hints:
  - 'Start with `pub fn hello(env: Env, to: Symbol) -> Vec<Symbol>`'
  - 'Use the `vec![]` macro with `&env` as the first argument'
  - 'The full return line: `vec![&env, symbol_short!("Hello"), to]`'
---

# The Awakening

You stand at the gates of the **Stellar Citadel**, a shimmering fortress orbiting the edge of known space. The Guardians of Soroban have sensed your arrival.

*"Another seeker,"* whispers the Elder Guardian. *"To prove yourself worthy, you must forge your first smart contract."*

## Your Mission

Create your first Soroban smart contract, a simple contract with a `hello` function that takes a name and returns a greeting.

## What You'll Learn

- The `#[contract]` and `#[contractimpl]` attributes
- The `Env` type, your gateway to the blockchain
- The `Symbol` type for string-like values
- How to return a `Vec<Symbol>`

## Key Concepts

```rust
#[contract]          // Marks your struct as a contract
#[contractimpl]      // Contains the contract methods
Env                  // The execution environment
Symbol               // A small, efficient string type
```

Complete the code template to pass all checks. The Guardians await your first contract.
