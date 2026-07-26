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

import helloSorobanMarkdown from './missions/hello-soroban.md?raw';
import { createMissionFromMarkdown } from '../systems/missionParser.js';

export const DEFAULT_MISSION_LANG = 'en';

const helloSorobanContent = createMissionFromMarkdown(helloSorobanMarkdown);

export const missions = [
    {
        id: 'hello-soroban',
        chapter: 1,
        order: 1,
        difficulty: 'beginner',
        xpReward: 100,
        ...helloSorobanContent,
        i18n: {
            ...helloSorobanContent.i18n,
            en: {
                ...helloSorobanContent.i18n.en,
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
            ja: {
                title: '初めてのコントラクト',
                story: `# 🌌 覚醒

あなたは**星の城塞**の門の前に立っている。それは、既知の宇宙の果てを周回する輝く要塞だ。Sorobanの守護者たちは、あなたの到着を感じ取っている。

*「また一人の探求者か」*と古老の守護者はささやく。*「お前の価値を示すためには、最初のスマートコントラクトを鍛え上げねばならない。」*

## ミッション

あなたの最初のSorobanスマートコントラクトを作成せよ — 名前を受け取り挨拶を返す、シンプルな\`hello\`関数を持つコントラクトだ。

## 学ぶこと

- \`#[contract]\`属性と\`#[contractimpl]\`属性
- \`Env\`型 — ブロックチェーンへの入り口
- 文字列のような値のための\`Symbol\`型
- \`Vec<Symbol>\`を返す方法

## キーコンセプト

\`\`\`rust
#[contract]          // 構造体をコントラクトとしてマーク
#[contractimpl]      // コントラクトのメソッドを含む
Env                  // 実行環境
Symbol               // 小型で効率的な文字列型
\`\`\`

コードテンプレートを完成させ、すべてのチェックを通過せよ。守護者たちはあなたの最初のコントラクトを待っている！ ⚔️`,
                learningGoal: '初めてのSorobanスマートコントラクト（hello関数付き）を作成する',
                hints: [
                    '`pub fn hello(env: Env, to: Symbol) -> Vec<Symbol>` から始めよう',
                    '`vec![]`マクロの最初の引数として`&env`を使用する',
                    '完全なreturn行: `vec![&env, symbol_short!("Hello"), to]`',
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
            ja: {
                title: '挨拶プロトコル',
                story: `# 📡 信号塔

最初の門が開かれた。あなたは**信号塔**へと進む。そこではメッセージがStellarネットワーク全体に波紋のように広がっている。

*「コミュニケーションこそ力なり」*と塔の守護者は言う。*「あなたのコントラクトはデータを管理することを学ばねばならない — 入力を受け付け、構造化された応答を返すのだ。」*

## ミッション

複数の関数を持つコントラクトを構築せよ：
- \`greet\` — 名前を受け取り、個人化された挨拶を返す
- \`count_chars\` — 文字列を受け取り、その長さをu32で返す

## 学ぶこと

- 単一のコントラクト内での複数関数
- Sorobanにおける\`String\`型の操作
- 関数からの異なる型の返却
- \`symbol_short!\`マクロ

## キーコンセプト

\`\`\`rust
String              // Sorobanにおける完全な文字列型
symbol_short!()     // 短いリテラルからSymbolを作成
u32                 // 符号なし32ビット整数
\`\`\``,
                learningGoal: '異なる戻り値の型を持つマルチ関数コントラクトを構築する',
                hints: [
                    'greet関数のシグネチャ: `pub fn greet(env: Env, name: Symbol) -> Vec<Symbol>`',
                    'count_charsの場合: `pub fn count_chars(env: Env, text: String) -> u32`',
                    '文字列の長さを取得するには`text.len()`を使用する',
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
            ja: {
                title: 'カウンター保管庫',
                story: `# 🔐 記憶の保管庫

あなたは**記憶の保管庫**へと降りていく。そこには古代の知恵が時を超えて保存されている。

*「記憶のないコントラクトは、魂のない意識体のようなものだ」*と保管庫の守護者はささやく。*「保存と取得を学べ — つまり、記憶することを。」*

## ミッション

値を永続化するカウンターコントラクトを作成せよ：
- \`increment\` — カウンターを1増やす
- \`get_count\` — 現在のカウントを返す

## 学ぶこと

- \`env.storage().instance()\`による**永続ストレージ**
- 状態の読み取りと書き込み
- ストレージのための\`Symbol\`キーパターン
- \`.unwrap_or()\`によるデフォルト値

## キーコンセプト

\`\`\`rust
env.storage().instance().set(&key, &value)  // 書き込み
env.storage().instance().get(&key)          // 読み取り（Optionを返す）
.unwrap_or(default)                         // Noneの場合のデフォルト
\`\`\``,
                learningGoal: '永続ストレージを使用して状態を持つカウンターコントラクトを作成する',
                hints: [
                    'カウントを読み取るには`env.storage().instance().get(&COUNTER)`を使用',
                    '値が存在しない場合のデフォルトに`.unwrap_or(0)`を使用',
                    '新しいカウントを保存するには`env.storage().instance().set(&COUNTER, &new_count)`を使用',
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
            ja: {
                title: 'ガーディアン台帳',
                story: `# 📋 ガーディアン台帳

評議会の間は古の光に輝いている。あなたの前には**ガーディアン台帳**が置かれている — それは、自らを証明したすべての者の登録簿である。

*「領域を守るためには、誰が行動できるかを制御しなければならない」*と評議会の長は宣言する。*「アクセス制御の技術を学べ。」*

## ミッション

アクセス制御付きの登録コントラクトを構築せよ：
- \`register\` — 新しいガーディアンを登録する（名前を保存する）
- \`get_guardian\` — アドレスからガーディアンの名前を取得する
- 初期化時に設定される\`admin\`アドレス

## 学ぶこと

- ユーザーIDのための\`Address\`型
- アクセス制御のための\`require_auth()\`
- キーと値のペアのための\`Map\`型
- コントラクト初期化パターン

## キーコンセプト

\`\`\`rust
Address                     // アカウント/IDを表す
address.require_auth()      // 呼び出し元が認証されていることを確認
Map<Address, Symbol>        // キーと値のマッピング
\`\`\``,
                learningGoal: 'Addressとrequire_authでアクセス制御を実装する',
                hints: [
                    'init関数でadminを保存: `env.storage().instance().set(&ADMIN, &admin)`',
                    'registerでは、保存前に`who.require_auth()`を呼び出す',
                    '保存方法: `env.storage().instance().set(&who, &name)`',
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
            ja: {
                title: 'トークン鋳造所',
                story: `# ⚒️ トークン鋳造所

城塞の奥深くには**トークン鋳造所**がある。そこでは、純粋なロジックからデジタル資産が鋳造される。

*「通貨はあらゆる経済の血液だ」*と鍛冶師は言う。*「アカウント間で転送可能なトークンを作成するのだ。」*

## ミッション

シンプルなトークンコントラクトを作成せよ：
- \`mint\` — アドレスにトークンを生成する（管理者のみ）
- \`balance\` — アドレスの残高を返す
- \`transfer\` — あるアドレスから別のアドレスへトークンを移動する

## 学ぶこと

- トークン残高管理
- 認証付き転送ロジック
- 管理者制限関数
- 残高の整数演算

## キーコンセプト

\`\`\`rust
// 管理者チェックパターン
admin.require_auth();

// 残高管理
let bal: i128 = env.storage().persistent().get(&from).unwrap_or(0);
\`\`\``,
                learningGoal: 'mint、balance、transfer関数を持つ基本的なトークンを構築する',
                hints: [
                    'mintの場合: ストレージからadminを取得し、admin.require_auth()を呼び出してから残高を更新',
                    'balanceの場合: `env.storage().persistent().get(&account).unwrap_or(0)`',
                    'transferの場合: 送信元からrequire_auth、両方の残高を読み取り、両方を更新',
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
            ja: {
                title: 'タイムロック',
                story: `# ⏳ クロノゲート

**クロノゲート**があなたの前にそびえ立つ。その機構は台帳のリズムに合わせて刻々と動いている。

*「時間は武器だ」*と時の守護者は言う。*「ブロックの経過に基づいてロックとアンロックを行うことを学べ。」*

## ミッション

タイムロック付き保管庫を作成せよ：
- \`lock\` — 指定された台帳シーケンス番号までトークンをロックする
- \`unlock\` — ロック期間が経過した場合にトークンを解放する
- \`get_lock_info\` — ロックの期限を返す

## 学ぶこと

- 時間ベースのロジックのための台帳シーケンス/タイムスタンプ
- ブロックチェーン状態に基づく条件付き実行
- 現在のブロックのための\`env.ledger().sequence()\`
- エラーハンドリングのためのパニックパターン

## キーコンセプト

\`\`\`rust
env.ledger().sequence()  // 現在の台帳シーケンス番号
panic!("message")        // エラーで中断
\`\`\``,
                learningGoal: '台帳シーケンスを使用して時間ベースの条件付きロジックを実装する',
                hints: [
                    '現在の台帳番号を取得するには`env.ledger().sequence()`を使用',
                    '比較: `if current_seq < unlock_at { panic!("Still locked"); }`',
                    'アンロック後にストレージをクリア: `env.storage().instance().remove(&key)`',
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
            ja: {
                title: 'マルチパーティ協定',
                story: `# 🤝 協定の間

あなたは**協定の間**に到着した。守護者たちの仲間入りを果たす前の最後の試練である。

*「スマートコントラクトの真の力は」*と大長老は宣言する。*「見知らぬ者同士の信頼を可能にすることにある。」*

## ミッション

マルチシグネチャ合意コントラクトを作成せよ：
- \`create_pact\` — N個の署名を必要とする合意を作成する
- \`sign_pact\` — 当事者が合意に署名することを可能にする
- \`is_complete\` — 必要な署名がすべて集まったか確認する
- \`get_signers\` — 誰が署名したかを返す

## 学ぶこと

- コントラクト内の複雑なデータ構造
- マルチパーティ認証
- ストレージによるカウントと追跡
- 現実世界のガバナンスパターンの構築

## キーコンセプト

\`\`\`rust
// 署名者数の追跡
let count: u32 = env.storage().instance()
    .get(&SIGNER_COUNT).unwrap_or(0);

// 動的キーでの保存
env.storage().instance().set(&signer_key, &true);
\`\`\``,
                learningGoal: '複雑な状態管理を持つマルチシグネチャ協定コントラクトを構築する',
                hints: [
                    'create_pact: 説明、必要数、初期署名数0を保存',
                    'sign_pact: 現在のカウントを読み取り、1増やして保存',
                    'is_complete: signed >= required を比較',
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

/* ==========================================
   Chapter 4: Data Fortress
   ========================================== */

    {
        id: 'vault-manager',
        chapter: 4,
        order: 8,
        difficulty: 'intermediate',
        xpReward: 300,
        i18n: {
            en: {
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
            es: {
                title: 'Gestor de Bóveda',
                story: `# 🏦 La Fortaleza de Datos

Más allá del Salón de los Pactos yace la **Fortaleza de Datos**, donde innumerables saldos de usuarios se almacenan y protegen.

*"Un solo saldo es trivial,"* dice el Arquitecto de la Bóveda. *"Gestionar muchos — ese es el arte de la arquitectura de almacenamiento."*

## Tu Misión

Construye un contrato de bóveda que gestione múltiples saldos de usuarios:
- \`deposit\` — añade fondos al saldo de un usuario (el usuario debe autenticarse)
- \`withdraw\` — resta fondos del saldo de un usuario (el usuario debe autenticarse)
- \`get_balance\` — devuelve el saldo actual de un usuario

## Lo Que Aprenderás

- \`Map<Address, i128>\` para estado multiusuario
- \`Env::require_auth()\` para autorización por usuario
- Almacenamiento persistente con claves complejas
- Patrones aritméticos seguros

## Conceptos Clave

\`\`\`rust
// Map para múltiples saldos
let mut balances: Map<Address, i128> = env.storage()
    .instance()
    .get(&BALANCES)
    .unwrap_or(Map::new(&env));

// Autenticación por usuario
user.require_auth();

// Actualizar y persistir
balances.set(user, &(current + amount));
env.storage().instance().set(&BALANCES, &balances);
\`\`\``,
                learningGoal: 'Construye una bóveda multiusuario con patrón de almacenamiento Map',
                hints: [
                    'Usa Map<Address, i128> para almacenar los saldos de los usuarios',
                    'Llama a user.require_auth() antes de modificar el saldo de un usuario',
                    'Lee el Map del almacenamiento con .unwrap_or(Map::new(&env))',
                    'Para deposit: obtén el saldo actual, suma el monto, guarda de nuevo',
                ],
            },
            ja: {
                title: 'ボールトマネージャー',
                story: `# 🏦 データ要塞

協定の間の先には**データ要塞**がある。そこでは無数のユーザー残高が保存され、保護されている。

*「1つの残高は簡単だ」*と保管庫の設計者は言う。*「多数を管理する — それがストレージアーキテクチャの芸術だ。」*

## ミッション

複数のユーザー残高を管理する保管庫コントラクトを構築せよ：
- \`deposit\` — ユーザーの残高に資金を追加する（ユーザー認証必須）
- \`withdraw\` — ユーザーの残高から資金を減らす（ユーザー認証必須）
- \`get_balance\` — ユーザーの現在の残高を返す

## 学ぶこと

- マルチユーザー状態のための\`Map<Address, i128>\`
- ユーザーごとの認証のための\`Env::require_auth()\`
- 複雑なキーを使用した永続ストレージ
- 安全な算術パターン

## キーコンセプト

\`\`\`rust
// 複数残高のためのMap
let mut balances: Map<Address, i128> = env.storage()
    .instance()
    .get(&BALANCES)
    .unwrap_or(Map::new(&env));

// ユーザーごとの認証
user.require_auth();

// 更新と永続化
balances.set(user, &(current + amount));
env.storage().instance().set(&BALANCES, &balances);
\`\`\``,
                learningGoal: 'Mapストレージパターンでマルチユーザー保管庫を構築する',
                hints: [
                    'ユーザー残高を保存するにはMap<Address, i128>を使用',
                    'ユーザー残高を変更する前にuser.require_auth()を呼び出す',
                    'ストレージからMapを読み取る: .unwrap_or(Map::new(&env))',
                    'depositの場合: 現在の残高を取得し、金額を加算して保存',
                ],
            },
        },
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
        i18n: {
            en: {
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
            es: {
                title: 'Emisor de Eventos',
                story: `# 📡 La Baliza de Señales

En lo alto de la Fortaleza de Datos se encuentra la **Baliza de Señales**, transmitiendo eventos a través de la red Stellar.

*"Los contratos que hablan son contratos que se entienden,"* dice el Guardián de la Baliza. *"Los eventos permiten que el mundo sepa lo que ocurrió."*

## Tu Misión

Crea un contrato que almacene datos clave-valor y emita eventos por cada cambio de estado:
- \`set_value\` — almacena un valor y emite un evento con la clave y el valor
- \`get_value\` — recupera un valor almacenado por su clave
- \`get_all_keys\` — devuelve todas las claves almacenadas

## Lo Que Aprenderás

- \`env.events().publish()\` para emitir eventos
- \`Vec<Symbol>\` para seguimiento dinámico de claves
- Arquitectura de contratos basada en eventos
- Patrones de publicador-suscriptor en Stellar

## Conceptos Clave

\`\`\`rust
// Emitir un evento
env.events().publish(
    &symbol_short!("set_value"),
    (key, value),
);

// Rastrear claves en un Vec
let mut keys = env.storage().instance()
    .get(&KEYS)
    .unwrap_or(Vec::new(&env));
keys.push_back(key);
\`\`\``,
                learningGoal: 'Implementa emisión de eventos en un contrato de almacén clave-valor',
                hints: [
                    'Usa env.events().publish() con un tema Symbol y los datos del evento',
                    'Usa Vec<Symbol> para rastrear todas las claves almacenadas',
                    'Añade nuevas claves con keys.push_back(key)',
                ],
            },
            ja: {
                title: 'イベントエミッター',
                story: `# 📡 信号標識

データ要塞の最上部には**信号標識**が立っている。Stellarネットワーク全体にイベントを放送している。

*「語るコントラクトは、理解されるコントラクトだ」*と標識の守護者は言う。*「イベントは、何が起きたかを世界に知らせる。」*

## ミッション

キーと値のデータを保存し、すべての状態変更に対してイベントを発行するコントラクトを作成せよ：
- \`set_value\` — 値を保存し、キーと値を持つイベントを発行する
- \`get_value\` — キーから保存された値を取得する
- \`get_all_keys\` — 保存されたすべてのキーを返す

## 学ぶこと

- イベント発行のための\`env.events().publish()\`
- 動的なキー追跡のための\`Vec<Symbol>\`
- イベント駆動型コントラクトアーキテクチャ
- Stellar上のパブリッシュ-サブスクライブパターン

## キーコンセプト

\`\`\`rust
// イベントを発行
env.events().publish(
    &symbol_short!("set_value"),
    (key, value),
);

// Vecでキーを追跡
let mut keys = env.storage().instance()
    .get(&KEYS)
    .unwrap_or(Vec::new(&env));
keys.push_back(key);
\`\`\``,
                learningGoal: 'キーと値のストアコントラクトでイベント発行を実装する',
                hints: [
                    'トピックSymbolとイベントデータでenv.events().publish()を使用',
                    'すべての保存されたキーを追跡するにはVec<Symbol>を使用',
                    '新しいキーはkeys.push_back(key)で追加',
                ],
            },
        },
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
        i18n: {
            en: {
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
            es: {
                title: 'Gestor de Aprobaciones',
                story: `# ✋ La Cámara de la Delegación

Dentro de la Fortaleza de Datos yace la **Cámara de la Delegación**, donde la confianza se formaliza mediante autorizaciones.

*"No siempre puedes actuar tú mismo,"* explica el Maestro de la Delegación. *"A veces debes empoderar a otros para que actúen en tu nombre."*

## Tu Misión

Construye un contrato que permita a los usuarios aprobar a otros para gastar en su nombre:
- \`approve\` — el propietario autoriza a un gastador por un monto determinado
- \`transfer_from\` — el gastador transfiere del propietario a un destinatario
- \`allowance\` — consulta cuánto está autorizado a gastar un gastador

## Lo Que Aprenderás

- Patrones de clave-valor anidados (propietario -> gastador -> autorización)
- Autorización delegada
- Claves de almacenamiento con direcciones duales
- Patrón de decremento de autorización

## Conceptos Clave

\`\`\`rust
// Clave de almacenamiento compuesta para autorizaciones
let allowance_key = (owner.clone(), spender.clone());
env.storage().instance().set(&allowance_key, &amount);

// Leer autorización anidada
env.storage().instance().get(&(owner, spender))
    .unwrap_or(0)
\`\`\``,
                learningGoal: 'Implementa un sistema de autorización y transferencia delegada',
                hints: [
                    'Usa una tupla (Address, Address) como clave de almacenamiento compuesta',
                    'En approve: almacena la autorización para el par (owner, spender)',
                    'En transfer_from: require_auth del spender, verifica autorización, decrementa, actualiza saldos',
                ],
            },
            ja: {
                title: '承認マネージャー',
                story: `# ✋ 委任の間

データ要塞の中には**委任の間**がある。そこでは、許可を通じて信頼が形式化される。

*「常に自分で行動できるとは限らない」*と委任の達人は説明する。*「時には、他の人に代わりに行動する権限を与えなければならない。」*

## ミッション

ユーザーが他のユーザーを承認して自分の代わりに使用できるようにするコントラクトを構築せよ：
- \`approve\` — 所有者が指定された金額について支出者を承認する
- \`transfer_from\` — 支出者が所有者から受取人に転送する
- \`allowance\` — 支出者が使用を許可されている金額を確認する

## 学ぶこと

- ネストされたキーと値のパターン（所有者 -> 支出者 -> 許可）
- 委任された認可
- 二重アドレスストレージキー
- 許可減額パターン

## キーコンセプト

\`\`\`rust
// 許可のための複合ストレージキー
let allowance_key = (owner.clone(), spender.clone());
env.storage().instance().set(&allowance_key, &amount);

// ネストされた許可の読み取り
env.storage().instance().get(&(owner, spender))
    .unwrap_or(0)
\`\`\``,
                learningGoal: '許可と委任転送システムを実装する',
                hints: [
                    'タプル(Address, Address)を複合ストレージキーとして使用',
                    'approve: (owner, spender)ペアの許可を保存',
                    'transfer_from: spenderからrequire_auth、許可を確認、減額、残高を更新',
                ],
            },
        },
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
        i18n: {
            en: {
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
            es: {
                title: 'Campaña de Crowdfunding',
                story: `# 🎯 La Arena del Crowdforge

Entras en la **Arena del Crowdforge**, donde el poder colectivo da vida a las ideas.

*"Solo eres fuerte,"* anuncia el Subastador. *"Juntos, podéis mover estrellas. Construye una campaña que la gente pueda financiar."*

## Tu Misión

Crea un contrato de crowdfunding:
- \`init\` — establece el objetivo de financiación y la fecha límite (secuencia del ledger)
- \`contribute\` — añade fondos de un contribuyente
- \`check_goal\` — devuelve true si las contribuciones totales >= objetivo
- \`get_total_raised\` — devuelve el total de fondos recaudados

## Lo Que Aprenderás

- Secuencia del ledger para plazos basados en tiempo
- Acumulación de fondos tipo escrow
- Seguimiento de objetivos con comprobaciones condicionales
- Gestión de estado con múltiples contribuyentes

## Conceptos Clave

\`\`\`rust
// Rastrear el total recaudado
let total: i128 = env.storage().instance()
    .get(&TOTAL_RAISED)
    .unwrap_or(0);

env.storage().instance().set(&TOTAL_RAISED, &(total + amount));

// Verificar fecha límite
let deadline: u32 = env.storage().instance()
    .get(&DEADLINE)
    .unwrap_or(0);
if env.ledger().sequence() > deadline { panic!("Campaign ended"); }
\`\`\``,
                learningGoal: 'Construye un contrato de crowdfunding con seguimiento de objetivos y plazos',
                hints: [
                    'En init: almacena el monto objetivo y la secuencia del ledger de la fecha límite',
                    'En contribute: verifica que la fecha límite no haya pasado, añade el monto al total',
                    'En check_goal: compara el total recaudado contra el objetivo',
                ],
            },
            ja: {
                title: 'クラウドファンドキャンペーン',
                story: `# 🎯 クラウドフォージアリーナ

あなたは**クラウドフォージアリーナ**に入る。そこでは、集合的な力がアイデアに命を吹き込む。

*「一人でも強い」*と競売人は宣言する。*「しかし共にあれば、星をも動かせる。人々が資金を提供できるキャンペーンを構築せよ。」*

## ミッション

クラウドファンディングコントラクトを作成せよ：
- \`init\` — 資金調達目標と期限（台帳シーケンス）を設定する
- \`contribute\` — 貢献者から資金を追加する
- \`check_goal\` — 総貢献額が目標以上の場合にtrueを返す
- \`get_total_raised\` — 調達された総資金を返す

## 学ぶこと

- 時間ベースの期限のための台帳シーケンス
- エスクロー的な資金蓄積
- 条件付きチェックによる目標追跡
- マルチコントリビューター状態管理

## キーコンセプト

\`\`\`rust
// 調達総額の追跡
let total: i128 = env.storage().instance()
    .get(&TOTAL_RAISED)
    .unwrap_or(0);

env.storage().instance().set(&TOTAL_RAISED, &(total + amount));

// 期限の確認
let deadline: u32 = env.storage().instance()
    .get(&DEADLINE)
    .unwrap_or(0);
if env.ledger().sequence() > deadline { panic!("Campaign ended"); }
\`\`\``,
                learningGoal: '目標と期限の追跡を持つクラウドファンディングコントラクトを構築する',
                hints: [
                    'init: 目標金額と期限の台帳シーケンスを保存',
                    'contribute: 期限が過ぎていないことを確認し、総額に金額を追加',
                    'check_goal: 調達総額を目標と比較',
                ],
            },
        },
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
        i18n: {
            en: {
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
            es: {
                title: 'Agente de Escrow',
                story: `# 🤲 El Intercambio de Confianza

En lo profundo de la Arena del Crowdforge se encuentra el **Intercambio de Confianza**, donde se median las transacciones entre desconocidos.

*"La confianza es la moneda más rara,"* dice el Mediador de Escrow. *"Construye un sistema que retenga valor hasta que se cumplan las condiciones."*

## Tu Misión

Crea un contrato de escrow con comprador, vendedor y árbitro:
- \`init\` — configura el escrow con las direcciones del comprador, vendedor y árbitro
- \`deposit\` — el comprador deposita fondos en el escrow
- \`release\` — el árbitro libera los fondos al vendedor
- \`refund\` — el árbitro reembolsa al comprador

## Lo Que Aprenderás

- Inicialización de contratos con múltiples partes
- Patrones de autorización con tres actores
- Máquina de estados para el ciclo de vida del escrow
- Patrones de resolución de disputas

## Conceptos Clave

\`\`\`rust
// Init con múltiples partes
pub fn init(env: Env, buyer: Address, seller: Address, arbiter: Address) {
    env.storage().instance().set(&BUYER, &buyer);
    env.storage().instance().set(&SELLER, &seller);
    env.storage().instance().set(&ARBITER, &arbiter);
}

// Funciones solo para el árbitro
arbiter.require_auth();
\`\`\``,
                learningGoal: 'Implementa un contrato de escrow multipartito con resolución de disputas',
                hints: [
                    'En init: almacena las direcciones de comprador, vendedor y árbitro',
                    'En deposit: require_auth del comprador y almacena el monto',
                    'En release: require_auth del árbitro, transfiere al vendedor',
                    'En refund: require_auth del árbitro, devuelve al comprador',
                ],
            },
            ja: {
                title: 'エスクローエージェント',
                story: `# 🤲 信頼取引所

クラウドフォージアリーナの奥深くには**信頼取引所**がある。そこでは、見知らぬ者同士の取引が仲介される。

*「信頼は最も貴重な通貨だ」*とエスクロー仲介人は言う。*「条件が満たされるまで価値を保持するシステムを構築せよ。」*

## ミッション

買い手、売り手、調停者によるエスクローコントラクトを作成せよ：
- \`init\` — 買い手、売り手、調停者のアドレスでエスクローを設定する
- \`deposit\` — 買い手がエスクローに資金を預ける
- \`release\` — 調停者が売り手に資金を解放する
- \`refund\` — 調停者が買い手に返金する

## 学ぶこと

- マルチパーティコントラクト初期化
- 三者認証パターン
- エスクローライフサイクルの状態機械
- 紛争解決パターン

## キーコンセプト

\`\`\`rust
// マルチパーティ初期化
pub fn init(env: Env, buyer: Address, seller: Address, arbiter: Address) {
    env.storage().instance().set(&BUYER, &buyer);
    env.storage().instance().set(&SELLER, &seller);
    env.storage().instance().set(&ARBITER, &arbiter);
}

// 調停者のみの関数
arbiter.require_auth();
\`\`\``,
                learningGoal: '紛争解決機能付きマルチパーティエスクローコントラクトを実装する',
                hints: [
                    'init: 買い手、売り手、調停者のアドレスを保存',
                    'deposit: 買い手からの認証を要求し、金額を保存',
                    'release: 調停者からの認証を要求し、売り手に転送',
                    'refund: 調停者からの認証を要求し、買い手に返金',
                ],
            },
        },
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
        i18n: {
            en: {
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
            es: {
                title: 'Gestor de Suscripciones',
                story: `# 🔄 El Motor Recurrente

En el corazón del distrito de Protocolos Avanzados palpita el **Motor Recurrente**, alimentando acuerdos periódicos automatizados.

*"Los contratos más poderosos son los que funcionan sin atención constante,"* dice el Cuidador del Motor. *"Construye una suscripción que cobre pagos recurrentes."*

## Tu Misión

Crea un contrato de gestión de suscripciones:
- \`subscribe\` — el usuario se suscribe a un plan (almacena plan, próxima facturación)
- \`collect\` — cobra la cuota de suscripción si la facturación está vencida
- \`cancel\` — cancela la suscripción
- \`get_subscription\` — devuelve la información de suscripción de un usuario

## Lo Que Aprenderás

- Lógica de facturación recurrente con secuencia del ledger
- Gestión de estado de suscripciones
- Patrones de cancelación y reembolso
- Cálculos de intervalos de tiempo

## Conceptos Clave

\`\`\`rust
// Rastrear período de suscripción
let interval: u32 = 1000; // facturación cada ~1000 ledgers
let next_billing: u32 = env.ledger().sequence() + interval;

// Verificar si la facturación está vencida
if env.ledger().sequence() >= next_billing {
    // cobrar pago
}
\`\`\``,
                learningGoal: 'Construye un contrato de suscripción recurrente con facturación periódica',
                hints: [
                    'En subscribe: almacena el plan, establece next_billing a sequence + intervalo',
                    'En collect: verifica si sequence >= next_billing, si es así cobra y actualiza next_billing',
                    'En cancel: limpia los datos de suscripción del almacenamiento',
                ],
            },
            ja: {
                title: 'サブスクリプションマネージャー',
                story: `# 🔄 定期エンジン

高度なプロトコル地区の中心部で**定期エンジン**が唸っている。自動化された定期的な合意を動かしている。

*「最も強力なコントラクトとは、絶え間ない注意なしに機能するものだ」*とエンジン管理者は言う。*「定期的な支払いを徴収するサブスクリプションを構築せよ。」*

## ミッション

サブスクリプション管理コントラクトを作成せよ：
- \`subscribe\` — ユーザーがプランに登録する（プラン、次回請求時期を保存）
- \`collect\` — 請求が期限の場合にサブスクリプション料を徴収する
- \`cancel\` — サブスクリプションをキャンセルする
- \`get_subscription\` — ユーザーのサブスクリプション情報を返す

## 学ぶこと

- 台帳シーケンスによる定期請求ロジック
- サブスクリプション状態管理
- キャンセルと返金のパターン
- 時間間隔の計算

## キーコンセプト

\`\`\`rust
// サブスクリプション期間の追跡
let interval: u32 = 1000; // 約1000台帳ごとに請求
let next_billing: u32 = env.ledger().sequence() + interval;

// 請求期限の確認
if env.ledger().sequence() >= next_billing {
    // 支払いを徴収
}
\`\`\``,
                learningGoal: '定期的な請求を持つ定期サブスクリプションコントラクトを構築する',
                hints: [
                    'subscribe: プランを保存し、next_billingを現在のsequence + intervalに設定',
                    'collect: 現在のsequence >= next_billingを確認し、徴収してnext_billingを更新',
                    'cancel: ストレージからサブスクリプションデータをクリア',
                ],
            },
        },
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
        i18n: {
            en: {
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
            es: {
                title: 'Pool de Préstamos Flash',
                story: `# ⚡ La Bóveda del Relámpago

En la capa más profunda de la Ciudadela yace la **Bóveda del Relámpago**, donde el capital se mueve a la velocidad de la luz.

*"Los préstamos flash son la prueba definitiva del diseño de contratos,"* dice el Arquero del Relámpago. *"Pide prestado, úsalo y devuélvelo en una sola transacción."*

## Tu Misión

Construye un pool de préstamos flash simplificado:
- \`init\` — establece el saldo del pool
- \`flash_loan\` — pide prestado del pool (debe devolverse dentro de la llamada)
- \`get_pool_balance\` — devuelve el saldo actual del pool
- \`repay\` — devuelve el monto prestado más una pequeña comisión

## Lo Que Aprenderás

- Mecánica de préstamos flash (simplificada para validación)
- Gestión del saldo del pool
- Seguimiento del ciclo de vida del préstamo
- Patrones de comisión al devolver

## Conceptos Clave

\`\`\`rust
// Rastrear préstamo activo
let loan: i128 = env.storage().instance()
    .get(&(borrower.clone(), LOAN_AMOUNT))
    .unwrap_or(0);

// Devolver con comisión
let fee = amount / 100; // 1% de comisión
env.storage().instance().set(&POOL, &(pool_bal + amount + fee));
\`\`\``,
                learningGoal: 'Construye un contrato de pool de préstamos flash simplificado',
                hints: [
                    'En init: almacena el saldo inicial del pool',
                    'En flash_loan: verifica que el pool tenga suficiente, descuenta del pool, registra el préstamo',
                    'En repay: verifica que exista el préstamo, devuelve fondos más comisión al pool, limpia el préstamo',
                ],
            },
            ja: {
                title: 'フラッシュローンプール',
                story: `# ⚡ 稲妻の保管庫

城塞の最深層には**稲妻の保管庫**がある。そこでは資本が光の速さで移動する。

*「フラッシュローンはコントラクト設計の究極の試練だ」*と稲妻のアークコンは言う。*「借りて、使い、そして単一のトランザクション内で返済するのだ。」*

## ミッション

簡略化されたフラッシュローンプールを構築せよ：
- \`init\` — プール残高を設定する
- \`flash_loan\` — プールから借りる（呼び出し内で返済必須）
- \`get_pool_balance\` — 現在のプール残高を返す
- \`repay\` — 借りた金額に少額の手数料を加えて返済する

## 学ぶこと

- フラッシュローンの仕組み（検証用に簡略化）
- プール残高管理
- ローンのライフサイクル追跡
- 返済時の手数料パターン

## キーコンセプト

\`\`\`rust
// アクティブなローンの追跡
let loan: i128 = env.storage().instance()
    .get(&(borrower.clone(), LOAN_AMOUNT))
    .unwrap_or(0);

// 手数料付き返済
let fee = amount / 100; // 1%の手数料
env.storage().instance().set(&POOL, &(pool_bal + amount + fee));
\`\`\``,
                learningGoal: '簡略化されたフラッシュローンプールコントラクトを構築する',
                hints: [
                    'init: 初期プール残高を保存',
                    'flash_loan: プールに十分な残高があることを確認、プールから差し引き、ローンを記録',
                    'repay: ローンが存在することを確認、手数料を加えてプールに戻し、ローンをクリア',
                ],
            },
        },
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
        i18n: {
            en: {
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
            es: {
                title: 'RBAC de Permisos',
                story: `# 🛡️ El Salón de los Roles

Más allá de la Bóveda del Relámpago se alza el **Salón de los Roles**, donde el acceso se gobierna mediante permisos estructurados.

*"No todos los que vagan están destinados a acceder a todas las puertas,"* declara el Maestro de Roles. *"Construye un sistema donde los roles definan lo que uno puede hacer."*

## Tu Misión

Crea un contrato de control de acceso basado en roles:
- \`grant_role\` — el admin concede un rol a un usuario
- \`revoke_role\` — el admin revoca un rol de un usuario
- \`has_role\` — verifica si un usuario tiene un rol específico
- \`get_admin\` — devuelve el admin del contrato

## Lo Que Aprenderás

- Patrones de control de acceso basado en roles (RBAC)
- Funciones privilegiadas solo para admin
- Claves compuestas para membresía de roles
- Arquitectura de permisos flexible

## Conceptos Clave

\`\`\`rust
// Conceder un rol
let role_key = (user.clone(), role.clone());
env.storage().instance().set(&role_key, &true);

// Verificar membresía de rol
env.storage().instance()
    .get(&(user.clone(), role.clone()))
    .unwrap_or(false)
\`\`\``,
                learningGoal: 'Implementa un contrato de control de acceso basado en roles',
                hints: [
                    'En init: almacena la dirección del admin',
                    'En grant_role: require_auth del admin, almacena la membresía del rol para el usuario',
                    'En revoke_role: require_auth del admin, elimina la membresía del rol',
                    'En has_role: verifica si la clave del rol existe y es true',
                ],
            },
            ja: {
                title: 'パーミッションRBAC',
                story: `# 🛡️ 役割の間

稲妻の保管庫の先に**役割の間**がそびえている。そこでは、構造化された権限によってアクセスが管理されている。

*「さまよう者すべてが、すべての扉にアクセスできるわけではない」*と役割の達人は宣言する。*「役割が何をできるかを定義するシステムを構築せよ。」*

## ミッション

役割ベースのアクセス制御コントラクトを作成せよ：
- \`grant_role\` — 管理者がユーザーに役割を付与する
- \`revoke_role\` — 管理者がユーザーから役割を剥奪する
- \`has_role\` — ユーザーが特定の役割を持っているか確認する
- \`get_admin\` — コントラクトの管理者を返す

## 学ぶこと

- 役割ベースのアクセス制御（RBAC）パターン
- 管理者のみの特権関数
- 役割メンバーシップのための複合キー
- 柔軟な権限アーキテクチャ

## キーコンセプト

\`\`\`rust
// 役割を付与
let role_key = (user.clone(), role.clone());
env.storage().instance().set(&role_key, &true);

// 役割メンバーシップの確認
env.storage().instance()
    .get(&(user.clone(), role.clone()))
    .unwrap_or(false)
\`\`\``,
                learningGoal: '役割ベースのアクセス制御コントラクトを実装する',
                hints: [
                    'init: 管理者アドレスを保存',
                    'grant_role: 管理者からの認証を要求し、ユーザーの役割メンバーシップを保存',
                    'revoke_role: 管理者からの認証を要求し、役割メンバーシップを削除',
                    'has_role: 役割キーが存在しtrueであるか確認',
                ],
            },
        },
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
        i18n: {
            en: {
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
            es: {
                title: 'Feed de Oráculo',
                story: `# 📊 La Aguja del Oráculo

En la cúspide del distrito de Sistemas de Producción se alza la **Aguja del Oráculo**, donde los datos fuera de la cadena entran en la blockchain.

*"Los contratos inteligentes son ciegos sin datos,"* dice el Sabio del Oráculo. *"Construye un puente entre los mundos on-chain y off-chain."*

## Tu Misión

Crea un contrato de oráculo de precios:
- \`update_price\` — el admin actualiza el precio de un par de activos
- \`get_price\` — devuelve el precio actual de un par de activos
- \`get_last_updated\` — devuelve cuándo se actualizó el precio por última vez
- \`get_all_assets\` — devuelve todos los pares de activos rastreados

## Lo Que Aprenderás

- Patrones de alimentación de datos de oráculo
- Funciones de actualización solo para admin
- Seguimiento de marcas de tiempo/secuencia
- Gestión de pares de activos con Vec<Symbol>

## Conceptos Clave

\`\`\`rust
// Almacenar precio con metadatos
pub fn update_price(env: Env, asset: Symbol, price: i128) {
    admin.require_auth();
    env.storage().instance().set(&asset, &price);
    env.storage().instance()
        .set(&(asset.clone(), TIMESTAMP), &env.ledger().sequence());
}
\`\`\``,
                learningGoal: 'Construye un oráculo de precios on-chain con actualizaciones del admin',
                hints: [
                    'En update_price: require_auth del admin, almacena el precio y la secuencia',
                    'En get_price: busca y devuelve el precio del activo',
                    'En get_last_updated: devuelve la secuencia almacenada para el activo',
                    'En get_all_assets: usa un rastreador Vec<Symbol> similar al event-emitter',
                ],
            },
            ja: {
                title: 'オラクルフィード',
                story: `# 📊 オラクルの尖塔

プロダクションシステム地区の頂点には**オラクルの尖塔**が立っている。そこでは、オフチェーンデータがブロックチェーンに入力される。

*「データなしではスマートコントラクトは盲目だ」*とオラクルの賢者は言う。*「オンチェーンとオフチェーンの世界の間に橋を構築せよ。」*

## ミッション

価格オラクルコントラクトを作成せよ：
- \`update_price\` — 管理者が資産ペアの価格を更新する
- \`get_price\` — 資産ペアの現在の価格を返す
- \`get_last_updated\` — 価格が最後に更新された時期を返す
- \`get_all_assets\` — 追跡中のすべての資産ペアを返す

## 学ぶこと

- オラクルデータフィードパターン
- 管理者のみの更新関数
- タイムスタンプ/シーケンス追跡
- Vec<Symbol>による資産ペア管理

## キーコンセプト

\`\`\`rust
// メタデータ付きで価格を保存
pub fn update_price(env: Env, asset: Symbol, price: i128) {
    admin.require_auth();
    env.storage().instance().set(&asset, &price);
    env.storage().instance()
        .set(&(asset.clone(), TIMESTAMP), &env.ledger().sequence());
}
\`\`\``,
                learningGoal: '管理者更新によるオンチェーン価格オラクルを構築する',
                hints: [
                    'update_price: 管理者からの認証を要求し、価格とシーケンスを保存',
                    'get_price: 資産の価格を検索して返す',
                    'get_last_updated: 資産の保存されたシーケンスを返す',
                    'get_all_assets: event-emitterと同様にVec<Symbol>トラッカーを使用',
                ],
            },
        },
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
        i18n: {
            en: {
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
            es: {
                title: 'Gobernador Simple',
                story: `# 🏛️ El Salón de la Gobernanza

La cámara final aguarda — el **Salón de la Gobernanza**, donde el destino de todo el reino se decide por la voluntad colectiva.

*"Los mejores contratos inteligentes empoderan a las comunidades para gobernarse a sí mismas,"* proclama el Gran Anciano. *"Construye un sistema donde las propuestas se convierten en ley mediante la votación."*

## Tu Misión

Crea un contrato de gobernanza con propuestas y votación:
- \`create_proposal\` — crea una propuesta con una descripción y un período de votación
- \`vote\` — emite un voto (sí/no) sobre una propuesta activa
- \`execute\` — ejecuta una propuesta si se aprueba
- \`get_proposal\` — devuelve los detalles de la propuesta

## Lo Que Aprenderás

- Mecanismos de gobernanza on-chain
- Ciclo de vida de propuestas (crear → votar → ejecutar)
- Conteo de votos con Map<Address, bool>
- Lógica de quórum y umbral de aprobación

## Conceptos Clave

\`\`\`rust
// Rastrear votos por propuesta
let mut votes: Map<Address, bool> = env.storage().instance()
    .get(&VOTES)
    .unwrap_or(Map::new(&env));
votes.set(&voter, &support);

// Contar aprobación
let yes_votes: u32 = /* contar votos donde value es true */
let no_votes: u32 = /* contar votos donde value es false */
\`\`\``,
                learningGoal: 'Construye un sistema de gobernanza on-chain completo con propuestas y votación',
                hints: [
                    'En create_proposal: almacena descripción, fecha límite, conteos de sí/no',
                    'En vote: verifica que la propuesta esté activa, registra la elección del votante, actualiza los totales',
                    'En execute: verifica que la propuesta se haya aprobado (sí > no), márcala como ejecutada',
                ],
            },
            ja: {
                title: 'シンプルガバナー',
                story: `# 🏛️ ガバナンスの間

最後の部屋が待っている — **ガバナンスの間**。そこでは、領域全体の運命が集合的な意志によって決定される。

*「最高のスマートコントラクトは、コミュニティが自己統治する力を与える」*と大長老は宣言する。*「投票によって提案が法律となるシステムを構築せよ。」*

## ミッション

提案と投票を行うガバナンスコントラクトを作成せよ：
- \`create_proposal\` — 説明と投票期間を持つ提案を作成する
- \`vote\` — アクティブな提案に対して投票（賛成/反対）する
- \`execute\` — 可決された場合に提案を実行する
- \`get_proposal\` — 提案の詳細を返す

## 学ぶこと

- オンチェーンガバナンスのメカニズム
- 提案のライフサイクル（作成 → 投票 → 実行）
- Map<Address, bool>による投票集計
- 定足数と承認閾値のロジック

## キーコンセプト

\`\`\`rust
// 提案ごとの投票を追跡
let mut votes: Map<Address, bool> = env.storage().instance()
    .get(&VOTES)
    .unwrap_or(Map::new(&env));
votes.set(&voter, &support);

// 承認の集計
let yes_votes: u32 = /* 値がtrueの投票をカウント */
let no_votes: u32 = /* 値がfalseの投票をカウント */
\`\`\``,
                learningGoal: '提案と投票を持つ完全なオンチェーンガバナンスシステムを構築する',
                hints: [
                    'create_proposal: 説明、期限、賛成/反対カウントを保存',
                    'vote: 提案がアクティブであることを確認し、投票者の選択を記録、集計を更新',
                    'execute: 提案が可決されたか確認（yes > no）、実行済みとしてマーク',
                ],
            },
        },
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
        i18n: {
            en: {
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
            es: {
                title: 'Guardia de Reentrancia',
                story: `# 🛡️ La Forja de Vulnerabilidades

En las profundidades de la Ciudadela yace la **Forja de Vulnerabilidades**, donde los contratos rotos se restauran.

*"La vulnerabilidad más peligrosa en los contratos inteligentes,"* advierte el Sabio de Seguridad, *"es la reentrancia. Un contrato que llama código externo mientras mantiene estado puede ser explotado."*

## Tu Misión

El contrato de bóveda que ves abajo es vulnerable a reentrancia — actualiza su saldo DESPUÉS de enviar fondos. Tu trabajo es arreglarlo usando un patrón de **guardia mutex**: una bandera booleana que previene la reentrancia.

El código vulnerable tiene:
- \`withdraw\` que envía fondos ANTES de actualizar el estado (el bug)
- Sin protección de reentrancia

Arrégialo:
1. Añade una clave de almacenamiento \`MUTEX\` booleana inicializada a \`false\`
2. Al inicio de \`withdraw\`, establécela a \`true\`
3. Al final de \`withdraw\`, vuelve a \`false\`
4. Verifica el mutex al entrar y haz panic si ya está bloqueado

## Lo Que Aprenderás

- Identificación de vulnerabilidad de reentrancia
- Patrón de guardia mutex para prevención
- Patrón check-effects-interaction
- Mentalidad de desarrollo orientada a la seguridad

## Conceptos Clave

\`\`\`rust
// Patrón de guardia mutex
if env.storage().instance().get(&MUTEX).unwrap_or(false) {
    panic!("Reentrancy detected");
}
env.storage().instance().set(&MUTEX, &true);
// ... operaciones vulnerables ...
env.storage().instance().set(&MUTEX, &false);
\`\`\``,
                learningGoal: 'Arregla una vulnerabilidad de reentrancia usando el patrón de guardia mutex',
                hints: [
                    'Añade una constante MUTEX: `const MUTEX: Symbol = symbol_short!("MUTEX");`',
                    'Al inicio de withdraw, verifica si mutex es true y haz panic si es así',
                    'Establece mutex a true antes de actualizar el saldo, false después',
                ],
            },
            ja: {
                title: 'リエントランシーガード',
                story: `# 🛡️ 脆弱性鍛造所

城塞の深部には**脆弱性鍛造所**がある。そこで、壊れたコントラクトが修復される。

*「スマートコントラクトにおける最も危険な脆弱性は」*とセキュリティの賢者は警告する。*「リエントランシーだ。状態を保持したまま外部コードを呼び出すコントラクトは悪用される可能性がある。」*

## ミッション

以下の保管庫コントラクトはリエントランシーに対して脆弱である — 資金を送信した後に残高を更新している。あなたの仕事は、**ミューテックスガード**パターンを使用して修正することだ：リエントランシーを防ぐブール値フラグである。

脆弱なコードの特徴：
- \`withdraw\`が状態を更新する**前に**資金を送信する（バグ）
- リエントランシー保護がない

以下のように修正せよ：
1. \`false\`に初期化された\`MUTEX\`ブール値ストレージキーを追加する
2. \`withdraw\`の開始時に\`true\`に設定する
3. \`withdraw\`の終了時に\`false\`に戻す
4. エントリ時にミューテックスを確認し、すでにロックされていればパニックする

## 学ぶこと

- リエントランシー脆弱性の特定
- 予防のためのミューテックス/ガードパターン
- チェック-効果-相互作用パターン
- セキュリティ第一の開発マインドセット

## キーコンセプト

\`\`\`rust
// ミューテックスガードパターン
if env.storage().instance().get(&MUTEX).unwrap_or(false) {
    panic!("Reentrancy detected");
}
env.storage().instance().set(&MUTEX, &true);
// ... 脆弱な操作 ...
env.storage().instance().set(&MUTEX, &false);
\`\`\``,
                learningGoal: 'ミューテックスガードパターンを使用してリエントランシーの脆弱性を修正する',
                hints: [
                    'MUTEX定数を追加: `const MUTEX: Symbol = symbol_short!("MUTEX");`',
                    'withdrawの開始時に、ミューテックスがtrueであればパニック',
                    '残高更新の前にミューテックスをtrueに、後にfalseに設定',
                ],
            },
        },
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
        i18n: {
            en: {
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
            es: {
                title: 'Corrección de Control de Acceso',
                story: `# 🔓 La Brecha de Permisos

La **Brecha de Permisos** es un campo de entrenamiento donde se repara la lógica de autorización rota.

*"La segunda vulnerabilidad más común,"* explica el Sabio de Seguridad, *"es la falta de control de acceso. Funciones que deberían estar restringidas a administradores son invocables por cualquiera."*

## Tu Misión

El contrato de abajo tiene una dirección \`admin\` almacenada pero NUNCA usa \`require_auth()\` en funciones privilegiadas. Tu trabajo es añadir el control de acceso adecuado.

El código vulnerable tiene:
- Una constante \`ADMIN\` definida pero nunca verificada
- \`set_fee\` y \`pause\` invocables por cualquiera
- Sin llamadas a \`require_auth()\` en ninguna parte

Arrégialo:
1. Añade comprobaciones \`require_auth()\` en \`set_fee\` y \`pause\`
2. Lee la dirección admin del almacenamiento antes de verificar la autenticación

## Lo Que Aprenderás

- Identificación de vulnerabilidad de control de acceso
- Colocación correcta de \`require_auth()\`
- Patrones de funciones solo para admin
- Principios de defensa en profundidad

## Conceptos Clave

\`\`\`rust
// Control de acceso correcto
let admin: Address = env.storage().instance().get(&ADMIN).unwrap();
admin.require_auth();

// Ahora realiza la operación privilegiada
env.storage().instance().set(&FEE, &new_fee);
\`\`\``,
                learningGoal: 'Arregla la falta de control de acceso añadiendo comprobaciones require_auth()',
                hints: [
                    'En set_fee: lee ADMIN del almacenamiento, llama a admin.require_auth()',
                    'En pause: lee ADMIN del almacenamiento, llama a admin.require_auth()',
                    'La función init está bien — ya almacena el admin correctamente',
                ],
            },
            ja: {
                title: 'アクセス制御修正',
                story: `# 🔓 権限侵害

**権限侵害**は、壊れた認可ロジックを修復するための訓練場である。

*「2番目に一般的な脆弱性は」*とセキュリティの賢者は説明する。*「アクセス制御の欠如だ。管理者に制限されるべき関数が誰でも呼び出せてしまう。」*

## ミッション

以下のコントラクトには\`admin\`アドレスが保存されているが、特権関数で\`require_auth()\`を**決して**使用していない。あなたの仕事は、適切なアクセス制御を追加することだ。

脆弱なコードの特徴：
- \`ADMIN\`定数が定義されているが、決してチェックされていない
- \`set_fee\`と\`pause\`関数が誰でも呼び出せる
- どこにも\`require_auth()\`の呼び出しがない

以下のように修正せよ：
1. \`set_fee\`と\`pause\`に\`require_auth()\`チェックを追加する
2. 認証を確認する前に、ストレージから管理者アドレスを読み取る

## 学ぶこと

- アクセス制御の脆弱性の特定
- 適切な\`require_auth()\`の配置
- 管理者のみの関数パターン
- 多層防御の原則

## キーコンセプト

\`\`\`rust
// 正しいアクセス制御
let admin: Address = env.storage().instance().get(&ADMIN).unwrap();
admin.require_auth();

// 特権操作を実行
env.storage().instance().set(&FEE, &new_fee);
\`\`\``,
                learningGoal: 'require_auth()チェックを追加してアクセス制御の欠如を修正する',
                hints: [
                    'set_fee: ストレージからADMINを読み取り、admin.require_auth()を呼び出す',
                    'pause: ストレージからADMINを読み取り、admin.require_auth()を呼び出す',
                    'init関数はそのままで問題ない — すでに管理者を正しく保存している',
                ],
            },
        },
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
];

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
