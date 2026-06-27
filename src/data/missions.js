/* ==========================================
   Mission Data — 7 progressive Soroban missions

   Phase 3 (i18n): Language-neutral fields (id, chapter, order,
   difficulty, xpReward, template, solution, checks,
   conceptsIntroduced) live at the top level. Localizable fields
   (title, story, learningGoal, hints) live under `i18n[locale]`.

   Use `localizeMission(mission, lang)` to get a flat, render-ready
   object whose title/story/learningGoal/hints resolve to the active
   language (falling back to English when a translation is missing).
   ========================================== */

export const DEFAULT_MISSION_LANG = 'en';

export const missions = [
    {
        id: 'hello-soroban',
        chapter: 1,
        order: 1,
        difficulty: 'beginner',
        xpReward: 100,
        i18n: {
            en: {
                title: 'The First Contract',
                story: `# 🌌 The Awakening

You stand at the gates of the **Stellar Citadel**, a shimmering fortress orbiting the edge of known space. The Guardians of Soroban have sensed your arrival.

*"Another seeker,"* whispers the Elder Guardian. *"To prove yourself worthy, you must forge your first smart contract."*

## Your Mission

Create your first Soroban smart contract — a simple contract with a \`hello\` function that takes a name and returns a greeting.

## What You'll Learn

- The \`#[contract]\` and \`#[contractimpl]\` attributes
- The \`Env\` type — your gateway to the blockchain
- The \`Symbol\` type for string-like values
- How to return a \`Vec<Symbol>\`

## Key Concepts

\`\`\`rust
#[contract]          // Marks your struct as a contract
#[contractimpl]      // Contains the contract methods
Env                  // The execution environment
Symbol               // A small, efficient string type
\`\`\`

Complete the code template to pass all checks. The Guardians await your first contract! ⚔️`,
                learningGoal: 'Create your first Soroban smart contract with a hello function',
                hints: [
                    'Start with `pub fn hello(env: Env, to: Symbol) -> Vec<Symbol>`',
                    'Use the `vec![]` macro with `&env` as the first argument',
                    'The full return line: `vec![&env, symbol_short!("Hello"), to]`',
                ],
            },
            es: {
                title: 'El Primer Contrato',
                story: `# 🌌 El Despertar

Te encuentras ante las puertas de la **Ciudadela Estelar**, una fortaleza reluciente que orbita el confín del espacio conocido. Los Guardianes de Soroban han percibido tu llegada.

*"Otro buscador,"* susurra el Guardián Anciano. *"Para demostrar tu valía, debes forjar tu primer contrato inteligente."*

## Tu Misión

Crea tu primer contrato inteligente de Soroban — un contrato simple con una función \`hello\` que recibe un nombre y devuelve un saludo.

## Lo Que Aprenderás

- Los atributos \`#[contract]\` y \`#[contractimpl]\`
- El tipo \`Env\` — tu puerta de entrada a la blockchain
- El tipo \`Symbol\` para valores tipo cadena
- Cómo devolver un \`Vec<Symbol>\`

## Conceptos Clave

\`\`\`rust
#[contract]          // Marca tu struct como un contrato
#[contractimpl]      // Contiene los métodos del contrato
Env                  // El entorno de ejecución
Symbol               // Un tipo de cadena pequeño y eficiente
\`\`\`

Completa la plantilla de código para pasar todas las verificaciones. ¡Los Guardianes esperan tu primer contrato! ⚔️`,
                learningGoal: 'Crea tu primer contrato inteligente de Soroban con una función hello',
                hints: [
                    'Comienza con `pub fn hello(env: Env, to: Symbol) -> Vec<Symbol>`',
                    'Usa la macro `vec![]` con `&env` como primer argumento',
                    'La línea de retorno completa: `vec![&env, symbol_short!("Hello"), to]`',
                ],
            },
        },
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
        i18n: {
            en: {
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
            es: {
                title: 'Protocolo de Saludos',
                story: `# 📡 La Torre de Señales

La primera puerta está abierta. Avanzas hacia la **Torre de Señales**, donde los mensajes se propagan a través de la red Stellar.

*"La comunicación es poder,"* dice el Guardián de la Torre. *"Tu contrato debe aprender a gestionar datos — aceptar entradas y devolver respuestas estructuradas."*

## Tu Misión

Construye un contrato con varias funciones:
- \`greet\` — recibe un nombre y devuelve un saludo personalizado
- \`count_chars\` — recibe una cadena y devuelve su longitud como u32

## Lo Que Aprenderás

- Varias funciones en un solo contrato
- Trabajar con el tipo \`String\` en Soroban
- Devolver distintos tipos desde las funciones
- La macro \`symbol_short!\`

## Conceptos Clave

\`\`\`rust
String              // Tipo de cadena completo en Soroban
symbol_short!()     // Crea un Symbol a partir de un literal corto
u32                 // Entero sin signo de 32 bits
\`\`\``,
                learningGoal: 'Construye un contrato multifunción con distintos tipos de retorno',
                hints: [
                    'La firma de la función greet: `pub fn greet(env: Env, name: Symbol) -> Vec<Symbol>`',
                    'Para count_chars: `pub fn count_chars(env: Env, text: String) -> u32`',
                    'Usa `text.len()` para obtener la longitud de la cadena',
                ],
            },
        },
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
        i18n: {
            en: {
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
            es: {
                title: 'La Bóveda Contadora',
                story: `# 🔐 La Bóveda de la Memoria

Desciendes a la **Bóveda de la Memoria**, donde los antiguos guardaron la sabiduría que perdura a través del tiempo.

*"Un contrato sin memoria es como un ser consciente sin alma,"* murmura el Guardián de la Bóveda. *"Aprende a almacenar y recuperar — a recordar."*

## Tu Misión

Crea un contrato contador que conserva su valor:
- \`increment\` — incrementa el contador en 1
- \`get_count\` — devuelve el conteo actual

## Lo Que Aprenderás

- **Almacenamiento persistente** con \`env.storage().instance()\`
- Leer y escribir estado
- El patrón de clave \`Symbol\` para el almacenamiento
- Valores por defecto con \`.unwrap_or()\`

## Conceptos Clave

\`\`\`rust
env.storage().instance().set(&key, &value)  // Escribir
env.storage().instance().get(&key)          // Leer (devuelve Option)
.unwrap_or(default)                         // Valor por defecto si es None
\`\`\``,
                learningGoal: 'Usa almacenamiento persistente para crear un contrato contador con estado',
                hints: [
                    'Usa `env.storage().instance().get(&COUNTER)` para leer el conteo',
                    'Usa `.unwrap_or(0)` para devolver 0 por defecto cuando no existe un valor',
                    'Usa `env.storage().instance().set(&COUNTER, &new_count)` para guardar el nuevo conteo',
                ],
            },
        },
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
        i18n: {
            en: {
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
            es: {
                title: 'Registro del Guardián',
                story: `# 📋 El Registro del Guardián

La Cámara del Consejo brilla con luz ancestral. Ante ti yace el **Registro del Guardián** — un censo de todos los que han demostrado su valía.

*"Para proteger el reino, debes controlar quién puede actuar,"* declara el Líder del Consejo. *"Aprende el arte del control de acceso."*

## Tu Misión

Construye un contrato de registro con control de acceso:
- \`register\` — registra un nuevo guardián (almacena su nombre)
- \`get_guardian\` — recupera el nombre de un guardián por su dirección
- Una dirección \`admin\` que se establece en la inicialización

## Lo Que Aprenderás

- El tipo \`Address\` para identidades de usuario
- \`require_auth()\` para control de acceso
- Trabajar con el tipo \`Map\` para pares clave-valor
- Patrones de inicialización de contratos

## Conceptos Clave

\`\`\`rust
Address                     // Representa una cuenta/identidad
address.require_auth()      // Garantiza que quien llama está autorizado
Map<Address, Symbol>        // Mapeo clave-valor
\`\`\``,
                learningGoal: 'Implementa control de acceso con Address y require_auth',
                hints: [
                    'La función init almacena el admin: `env.storage().instance().set(&ADMIN, &admin)`',
                    'En register, llama a `who.require_auth()` antes de almacenar',
                    'Almacena con: `env.storage().instance().set(&who, &name)`',
                ],
            },
        },
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
        i18n: {
            en: {
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
            es: {
                title: 'La Forja de Tokens',
                story: `# ⚒️ La Forja de Tokens

En lo más profundo de la Ciudadela yace la **Forja de Tokens**, donde los activos digitales se acuñan a partir de pura lógica.

*"La moneda es la savia de toda economía,"* dice el Maestro Forjador. *"Crearás un token que pueda transferirse entre cuentas."*

## Tu Misión

Crea un contrato de token simple:
- \`mint\` — crea tokens para una dirección (solo admin)
- \`balance\` — devuelve el saldo de una dirección
- \`transfer\` — mueve tokens de una dirección a otra

## Lo Que Aprenderás

- Gestión de saldos de tokens
- Lógica de transferencia con autorización
- Funciones restringidas al admin
- Aritmética de enteros para los saldos

## Conceptos Clave

\`\`\`rust
// Patrón de verificación de admin
admin.require_auth();

// Gestión de saldos
let bal: i128 = env.storage().persistent().get(&from).unwrap_or(0);
\`\`\``,
                learningGoal: 'Construye un token básico con funciones mint, balance y transfer',
                hints: [
                    'Para mint: obtén el admin del almacenamiento, llama a admin.require_auth(), luego actualiza el saldo',
                    'Para balance: `env.storage().persistent().get(&account).unwrap_or(0)`',
                    'Para transfer: require_auth del remitente, lee ambos saldos, actualiza ambos',
                ],
            },
        },
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
        i18n: {
            en: {
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
            es: {
                title: 'El Cerrojo Temporal',
                story: `# ⏳ La Puerta del Tiempo

La **Puerta del Tiempo** se alza ante ti, sus mecanismos marcando el ritmo del ledger.

*"El tiempo es un arma,"* dice el Guardián del Tiempo. *"Aprende a bloquear y desbloquear según el paso de los bloques."*

## Tu Misión

Crea una bóveda con cerrojo temporal:
- \`lock\` — bloquea tokens hasta un número de secuencia de ledger específico
- \`unlock\` — libera los tokens si el período de bloqueo ha pasado
- \`get_lock_info\` — devuelve cuándo expira el bloqueo

## Lo Que Aprenderás

- Secuencia / marca de tiempo del ledger para lógica temporal
- Ejecución condicional basada en el estado de la blockchain
- \`env.ledger().sequence()\` para el bloque actual
- Patrones de panic para el manejo de errores

## Conceptos Clave

\`\`\`rust
env.ledger().sequence()  // Número de secuencia del ledger actual
panic!("message")        // Abortar con un error
\`\`\``,
                learningGoal: 'Implementa lógica condicional basada en el tiempo usando la secuencia del ledger',
                hints: [
                    'Usa `env.ledger().sequence()` para obtener el número de ledger actual',
                    'Compara: `if current_seq < unlock_at { panic!("Still locked"); }`',
                    'Limpia el almacenamiento tras desbloquear: `env.storage().instance().remove(&key)`',
                ],
            },
        },
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
        i18n: {
            en: {
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
            es: {
                title: 'Pacto Multipartito',
                story: `# 🤝 El Salón de los Pactos

Has llegado al **Salón de los Pactos**, el desafío final antes de ganar tu lugar entre los Guardianes.

*"El verdadero poder de los contratos inteligentes,"* declara el Gran Anciano, *"es que permiten la confianza entre desconocidos."*

## Tu Misión

Crea un contrato de acuerdo con múltiples firmas:
- \`create_pact\` — crea un acuerdo que requiere N firmas
- \`sign_pact\` — permite que una parte firme el acuerdo
- \`is_complete\` — comprueba si se han reunido todas las firmas requeridas
- \`get_signers\` — devuelve quién ha firmado

## Lo Que Aprenderás

- Estructuras de datos complejas en contratos
- Autorización de múltiples partes
- Conteo y seguimiento con almacenamiento
- Construcción de patrones de gobernanza del mundo real

## Conceptos Clave

\`\`\`rust
// Llevar la cuenta de firmantes
let count: u32 = env.storage().instance()
    .get(&SIGNER_COUNT).unwrap_or(0);

// Almacenar con claves dinámicas
env.storage().instance().set(&signer_key, &true);
\`\`\``,
                learningGoal: 'Construye un contrato de pacto con múltiples firmas y gestión de estado compleja',
                hints: [
                    'En create_pact: almacena la descripción, el número requerido y un conteo inicial de firmas de 0',
                    'En sign_pact: lee el conteo actual, increméntalo en 1, guárdalo de nuevo',
                    'En is_complete: compara signed >= required',
                ],
            },
        },
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
];

/* ==========================================
   Localization helpers
   ========================================== */

/**
 * Returns a flat, render-ready mission object for the given language.
 * Localizable fields (title, story, learningGoal, hints) are resolved
 * from `mission.i18n[lang]`, falling back to English, then to any
 * legacy top-level field. The `i18n` block itself is omitted from the
 * returned object so consumers keep using `mission.title` etc.
 */
export function localizeMission(mission, lang = DEFAULT_MISSION_LANG) {
    if (!mission) return mission;

    const { i18n, ...neutral } = mission;
    const locale =
        (i18n && (i18n[lang] || i18n[DEFAULT_MISSION_LANG])) || {};
    const fallback = (i18n && i18n[DEFAULT_MISSION_LANG]) || {};

    const pick = (field) =>
        locale[field] != null
            ? locale[field]
            : fallback[field] != null
            ? fallback[field]
            : neutral[field];

    return {
        ...neutral,
        title: pick('title'),
        story: pick('story'),
        learningGoal: pick('learningGoal'),
        hints: pick('hints') || [],
    };
}

/** Localizes an array of missions. */
export function localizeMissions(list, lang = DEFAULT_MISSION_LANG) {
    return (list || []).map((m) => localizeMission(m, lang));
}
