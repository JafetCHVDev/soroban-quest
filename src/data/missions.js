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
import enLocale from '../i18n/locales/en.json';
import esLocale from '../i18n/locales/es.json';
import { missionsZhCN } from './missions.zh-CN.js';

const authoredMissions = Object.values(
    import.meta.glob('./missions/authored/*.json', { eager: true, import: 'default' }),
);
const missionLocales = { en: enLocale, es: esLocale };

export const DEFAULT_MISSION_LANG = 'en';

const helloSorobanContent = createMissionFromMarkdown(helloSorobanMarkdown);

/* eslint-disable no-useless-escape */
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


            ja: {
                title: 'はじめての契約',
                story: `# 🌌 目覚めの刻

未知の星系へと流れ着いたあなた。古い魔法書『Stellar』の中に、強大な力を秘めたスマートコントラクトの技術が眠っていることを知りました。

Sorobanの領地に到着したあなたの前に、一人の老賢者が現れました。「ようこそ、契約魔法師よ。まずはこの基本の力を習得しなければならん。『hello』という最も単純な呪文を唱える準備はできているか？」

## あなたの使命

あなたの最初の任務は、\`hello\`という関数を持つスマートコントラクトを作成することです。このシンプルな契約は、Sorobanの世界での基本的な魔法の力を象徴しています。

## これから学ぶこと

- Rustでスマートコントラクトを記述する基本的な構文
- \`#[contractimpl]\`マクロを使用した関数の定義方法
- Soroban環境での最初の展開と実行

## 重要なコンセプト

契約の基本構造を理解することが、すべての冒険の第一歩です。

\`\`\`rust
#[contract]          // structを契約としてマーク
#[contractimpl]      // 契約実装ブロック
Env                  // 実行環境
Symbol               // 効率的な文字列型
\`\`\`

テンプレートコードを完成させ、すべての検証に合格してください。老賢者があなたの契約を待っています！ ⚔️`,
                learningGoal: 'Sorobanで最初のスマートコントラクトを作成し、基本的な関数を実装する',
                hints: [
                    '\`pub fn hello(env: Env, to: Symbol) -> Vec<Symbol>\`から始める',
                    '第一引数として\`&env\`を持つ\`vec!\`マクロを使用する',
                    '完全な戻り文: \`vec![&env, symbol_short!("Hello"), to]\`',
                ],
            },
            'zh-CN': missionsZhCN['hello-soroban'],
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


            ja: {
                title: '挨拶のプロトコル',
                story: `# 📡 信号塔

最初の門が開きました。**信号塔**へ進むあなた。Stellarネットワーク中にメッセージが波及しています。

*"通信は力だ,"* 塔の管理人は言います。*"君のコントラクトはデータを管理することを学ばねばならない — 入力を受け入れ、構造化された応答を返すのだ。"*

## あなたの使命

複数の関数を持つコントラクトを構築してください:
- \`greet\` — 名前を受け取り、パーソナライズされた挨拶を返す
- \`count_chars\` — 文字列を受け取り、その長さをu32として返す

## これから学ぶこと

- 単一コントラクト内に複数の関数を実装する方法
- Soroban内で\`String\`型を使用すること
- 関数から異なるタイプを返す方法
- \`symbol_short!\`マクロ

## 重要なコンセプト

\`\`\`rust
String              // Soroban内のフル文字列型
symbol_short!()     // 短いリテラルからSymbolを作成
u32                 // 符号なし32ビット整数
\`\`\``,
                learningGoal: '異なる戻り値型を持つマルチ関数コントラクトを構築する',
                hints: [
                    'greet関数の署名: \`pub fn greet(env: Env, name: Symbol) -> Vec<Symbol>\`',
                    'count_charsの場合: \`pub fn count_chars(env: Env, text: String) -> u32\`',
                    '\`text.len()\`を使用して文字列の長さを取得する',
                ],
            },
            'zh-CN': missionsZhCN['greetings-protocol'],
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


            ja: {
                title: '数の庫',
                story: `# 🔐 永遠の記憶の金庫

**メモリの金庫**へ下ります。ここに古代人たちが時を超えて存続する知恵を保管しました。

*"記憶のない契約は、魂のない意識のある者のようだ,"* 金庫の守護者はつぶやきます。*"保存と取得を学ぶのだ — 記憶することを。"*

## あなたの使命

その値を保存するカウンターコントラクトを作成してください:
- \`increment\` — カウンターを1増やす
- \`get_count\` — 現在のカウント値を返す

## これから学ぶこと

- \`env.storage().instance()\`を使用した**永続的ストレージ**
- 状態の読み書き
- ストレージのための\`Symbol\`キーパターン
- \`.unwrap_or()\`を使用したデフォルト値

## 重要なコンセプト

\`\`\`rust
env.storage().instance().set(&key, &value)  // 書き込み
env.storage().instance().get(&key)          // 読み取り（Optionを返す）
.unwrap_or(default)                         // Noneの場合はデフォルト
\`\`\``,
                learningGoal: '永続的ストレージを使用して状態を持つカウンターコントラクトを作成する',
                hints: [
                    '\`env.storage().instance().get(&COUNTER)\`を使用してカウントを読み取る',
                    '値が存在しない場合のデフォルトとして\`.unwrap_or(0)\`を使用する',
                    '\`env.storage().instance().set(&COUNTER, &new_count)\`を使用して新しいカウントを保存する',
                ],
            },
            'zh-CN': missionsZhCN['counter-vault'],
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


            ja: {
                title: '守護者の記録簿',
                story: `# 📋 守護者の記録簿

評議会の会議室は古代の光で輝いています。あなたの前には**守護者の記録簿**が横たわっています — 自分たちの価値を証明したすべての者の国勢調査。

*"王国を保護するには、誰が行動できるかを制御する必要がある,"* 評議会の首長が宣言します。*"アクセス制御の芸術を学ぶのだ。"*

## あなたの使命

アクセス制御付きのレジストリコントラクトを構築してください:
- \`register\` — 新しい守護者を登録（その名前を保存）
- \`get_guardian\` — アドレスで守護者の名前を取得
- 初期化時に設定される\`admin\`アドレス

## これから学ぶこと

- ユーザーアイデンティティの\`Address\`型
- アクセス制御のための\`require_auth()\`
- キーと値のペアのために\`Map\`型で作業する
- コントラクト初期化パターン

## 重要なコンセプト

\`\`\`rust
Address                     // アカウント/アイデンティティを表す
address.require_auth()      // 呼び出し元が認可されていることを保証
Map<Address, Symbol>        // キー・値マッピング
\`\`\``,
                learningGoal: 'AddressとrequireAuthを使用したアクセス制御を実装する',
                hints: [
                    'init関数はadminを保存する: \`env.storage().instance().set(&ADMIN, &admin)\`',
                    'registerで、保存する前に\`who.require_auth()\`を呼び出す',
                    '保存: \`env.storage().instance().set(&who, &name)\`',
                ],
            },
            'zh-CN': missionsZhCN['guardian-ledger'],
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


            ja: {
                title: 'トークン鍛造所',
                story: `# ⚒️ トークン鍛造所

シタデルの最奥部には**トークン鍛造所**があります。ここで、デジタル資産が純粋なロジックから鋳造されます。

*"通貨はあらゆる経済の生命の血だ,"* 鍛冶職人は言います。*"君はアカウント間で転送できるトークンを作成するのだ。"*

## あなたの使命

シンプルなトークンコントラクトを作成してください:
- \`mint\` — アドレス用のトークンを作成（管理者のみ）
- \`balance\` — アドレスの残高を返す
- \`transfer\` — トークンを1つのアドレスから別のアドレスに移動

## これから学ぶこと

- トークン残高管理
- 認可付き転送ロジック
- 管理者制限機能
- 残高のための整数演算

## 重要なコンセプト

\`\`\`rust
// 管理者確認パターン
admin.require_auth();

// 残高管理
let bal: i128 = env.storage().persistent().get(&from).unwrap_or(0);
\`\`\``,
                learningGoal: 'mint、balance、transfer機能を持つ基本的なトークンを構築する',
                hints: [
                    'mintの場合: ストレージからadminを取得し、admin.require_auth()を呼び出し、残高を更新',
                    'balanceの場合: \`env.storage().persistent().get(&account).unwrap_or(0)\`',
                    'transferの場合: 送信者からrequire_auth、両方の残高を読み取り、両方を更新',
                ],
            },
            'zh-CN': missionsZhCN['token-forge'],
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


            ja: {
                title: '時間の鍵',
                story: `# ⏳ 時間の門

**時間の門**があなたの前に立ちはだかります。その機構はグレートブックのリズムで動いています。

*"時間は武器だ,"* 時間の守護者が言います。*"ブロックの流れに従ってロックと解除を学ぶのだ。"*

## あなたの使命

時間ロック付きの金庫を作成してください:
- \`lock\` — 特定のレッジャーシーケンス番号までトークンをロック
- \`unlock\` — ロック期間が過ぎたらトークンを解放
- \`get_lock_info\` — ロックが有効期限切れになるときを返す

## これから学ぶこと

- 時間的ロジックのためのレッジャーシーケンス/タイムスタンプ
- ブロックチェーン状態に基づく条件付き実行
- 現在のブロック用\`env.ledger().sequence()\`
- エラー処理のpanic!パターン

## 重要なコンセプト

\`\`\`rust
env.ledger().sequence()  // 現在のレッジャーシーケンス番号
panic!("message")        // エラーで中止
\`\`\``,
                learningGoal: 'レッジャーシーケンスを使用した時間ベースの条件付きロジックを実装する',
                hints: [
                    '現在のレッジャー番号を取得するために\`env.ledger().sequence()\`を使用する',
                    '比較: \`if current_seq < unlock_at { panic!("Still locked"); }\`',
                    'ロック解除後ストレージをクリア: \`env.storage().instance().remove(&key)\`',
                ],
            },
            'zh-CN': missionsZhCN['time-lock'],
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


            ja: {
                title: '多者協約',
                story: `# 🤝 協約の間

**協約の間**に到達しました。これはガーディアンの中であなたの場所を獲得する前の最終的な課題です。

*"スマートコントラクトの真の力,"* グレートエルダーが宣言します。*"それは見知らぬ者同士の間に信頼を生み出すことなのだ。"*

## あなたの使命

複数署名を持つ協約コントラクトを作成してください:
- \`create_pact\` — N個の署名を必要とする協約を作成
- \`sign_pact\` — 当事者が協約に署名することを許可
- \`is_complete\` — すべての必要な署名が集まったかどうかを確認
- \`get_signers\` — 誰が署名したかを返す

## これから学ぶこと

- コントラクト内の複雑なデータ構造
- マルチパーティ認可
- ストレージでのカウントと追跡
- 実世界のガバナンスパターンの構築

## 重要なコンセプト

\`\`\`rust
// 署名者数を追跡
let count: u32 = env.storage().instance()
    .get(&SIGNER_COUNT).unwrap_or(0);

// 動的キーで保存
env.storage().instance().set(&signer_key, &true);
\`\`\``,
                learningGoal: '複雑な状態管理を持つ複数署名協約コントラクトを構築する',
                hints: [
                    'create_pactで: 説明、必要な数、初期署名カウント0を保存',
                    'sign_pactで: 現在のカウントを読み取り、1を加算し、戻す',
                    'is_completeで: signed >= requiredを比較',
                ],
            },
            'zh-CN': missionsZhCN['multi-party-pact'],
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


            ja: {
                title: '金庫番',
                story: `# 🏦 データの砦

協約の間を超えて**データの砦**が広がります。ここで無数のユーザー残高が保存され、保護されます。

*"単一の残高は取るに足らないものだ,"* 金庫のアーキテクトが言います。*"多くを管理する — これはストレージアーキテクチャの芸術なのだ。"*

## あなたの使命

複数のユーザー残高を管理する金庫コントラクトを構築してください:
- \`deposit\` — ユーザーの残高に資金を追加（ユーザーが認証される必要あり）
- \`withdraw\` — ユーザーの残高から資金を差し引く（ユーザーが認証される必要あり）
- \`get_balance\` — ユーザーの現在の残高を返す

## これから学ぶこと

- マルチユーザー状態用の\`Map<Address, i128>\`
- ユーザーごとの認可用\`Env::require_auth()\`
- 複雑なキーを持つ永続ストレージ
- 安全な算術パターン

## 重要なコンセプト

\`\`\`rust
// 複数残高用Map
let mut balances: Map<Address, i128> = env.storage()
    .instance()
    .get(&BALANCES)
    .unwrap_or(Map::new(&env));

// ユーザーごとの認可
user.require_auth();

// 更新と永続化
balances.set(user, &(current + amount));
env.storage().instance().set(&BALANCES, &balances);
\`\`\``,
                learningGoal: 'Mapストレージパターンを使用したマルチユーザー金庫を構築する',
                hints: [
                    'Map<Address, i128>を使用してユーザー残高を保存',
                    'ユーザー残高を変更する前にuser.require_auth()を呼び出す',
                    '.unwrap_or(Map::new(&env))でストレージからMapを読み取る',
                    'depositの場合: 現在の残高を取得、金額を追加、戻す',
                ],
            },
            'zh-CN': missionsZhCN['vault-manager'],
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


            ja: {
                title: '事象の放射',
                story: `# 📡 信号の灯台

データの砦のてっぺんに立つ**信号の灯台**は、Stellarネットワーク中にイベントを放送しています。

*"話す契約は理解される契約だ,"* 灯台の管理人が言います。*"イベントは世界に何が起きたかを知らせるのだ。"*

## あなたの使命

キー・バリューデータを保存し、状態変更ごとにイベントを発行するコントラクトを作成してください:
- \`set_value\` — 値を保存し、キーと値を含むイベントを発行
- \`get_value\` — キーで保存された値を取得
- \`get_all_keys\` — すべての保存されたキーを返す

## これから学ぶこと

- イベント発行用\`env.events().publish()\`
- 動的キー追跡用\`Vec<Symbol>\`
- イベント駆動型コントラクトアーキテクチャ
- Stellarのパブリッシュ・サブスクライブパターン

## 重要なコンセプト

\`\`\`rust
// イベント発行
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
                learningGoal: 'キー・バリューストアコントラクトにイベント発行を実装する',
                hints: [
                    'env.events().publish()をトピックSymbolとイベントデータで使用',
                    'Vec<Symbol>を使用してすべての保存されたキーを追跡',
                    'keys.push_back(key)で新しいキーを追加',
                ],
            },
            'zh-CN': missionsZhCN['event-emitter'],
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


            ja: {
                title: '許可管理者',
                story: `# ✋ 委譲の間

データの砦の中に**委譲の間**があります。ここで信頼は指定によって形式化されます。

*"常に自分自身で行動することはできない,"* 委譲の主人が説明します。*"時には他の者に自分の名前で行動する力を与える必要があるのだ。"*

## あなたの使命

ユーザーが他の者に自分の代わりに支出するよう承認できるコントラクトを構築してください:
- \`approve\` — オーナーは指定された金額で支出者を認可
- \`transfer_from\` — 支出者はオーナーから受取人に転送
- \`allowance\` — 支出者がいくら支出するよう認可されているかを確認

## これから学ぶこと

- ネストされたキー・バリューパターン（owner -> spender -> allowance）
- 委譲された認可
- 二重アドレス・ストレージキー
- 指定額減少パターン

## 重要なコンセプト

\`\`\`rust
// 指定用複合ストレージキー
let allowance_key = (owner.clone(), spender.clone());
env.storage().instance().set(&allowance_key, &amount);

// ネストされた指定を読み取る
env.storage().instance().get(&(owner, spender))
    .unwrap_or(0)
\`\`\``,
                learningGoal: '指定と委譲転送システムを実装する',
                hints: [
                    'タプル(Address, Address)を複合ストレージキーとして使用',
                    'approveで: (owner, spender)ペアの指定を保存',
                    'transfer_fromで: spenderからrequire_auth、指定を確認、減少、残高更新',
                ],
            },
            'zh-CN': missionsZhCN['approval-manager'],
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


            ja: {
                title: '群衆からの資金',
                story: `# 🎯 Crowdforgeの競技場

**Crowdforgeの競技場**に入ります。ここで集団的な力はアイデアに生命を与えます。

*"単独ではお前は強いが,"* 競売人が発表します。*"一緒なら、お前たちは星を動かせるのだ。人々が資金提供できるキャンペーンを構築するのだ。"*

## あなたの使命

クラウドファンディングコントラクトを作成してください:
- \`init\` — 資金調達目標と期限（レッジャーシーケンス）を設定
- \`contribute\` — 貢献者からの資金を追加
- \`check_goal\` — 総貢献度 >= 目標の場合trueを返す
- \`get_total_raised\` — 集めた総資金を返す

## これから学ぶこと

- 時間ベースの期限用レッジャーシーケンス
- エスクロー型資金累積
- 条件付きチェックによる目標追跡
- 複数貢献者との状態管理

## 重要なコンセプト

\`\`\`rust
// 集めた総額を追跡
let total: i128 = env.storage().instance()
    .get(&TOTAL_RAISED)
    .unwrap_or(0);

env.storage().instance().set(&TOTAL_RAISED, &(total + amount));

// 期限を確認
let deadline: u32 = env.storage().instance()
    .get(&DEADLINE)
    .unwrap_or(0);
if env.ledger().sequence() > deadline { panic!("Campaign ended"); }
\`\`\``,
                learningGoal: '目標と期限追跡を備えたクラウドファンディングコントラクトを構築する',
                hints: [
                    'initで: 目標金額と期限レッジャーシーケンスを保存',
                    'contributeで: 期限が過ぎていないことを確認、金額を総計に追加',
                    'check_goalで: 集めた総額を目標と比較',
                ],
            },
            'zh-CN': missionsZhCN['crowdfund'],
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


            ja: {
                title: 'エスクローの使者',
                story: `# 🤲 信頼の交換

Crowdforgeの競技場の奥深くには**信頼の交換**があります。ここで見知らぬ者間の取引が仲介されます。

*"信頼はもっとも希少な通貨だ,"* エスクロー仲介者が言います。*"条件が満たされるまで価値を保持するシステムを構築するのだ。"*

## あなたの使命

買い手、売り手、仲介者を持つエスクロー契約を作成してください:
- \`init\` — 買い手、売り手、仲介者のアドレスでエスクローを設定
- \`deposit\` — 買い手がエスクローに資金を預ける
- \`release\` — 仲介者が売り手へ資金を解放
- \`refund\` — 仲介者が買い手に払い戻す

## これから学ぶこと

- マルチパーティコントラクト初期化
- 3者認可パターン
- エスクロー・ライフサイクル用ステートマシン
- 紛争解決パターン

## 重要なコンセプト

\`\`\`rust
// マルチパーティ初期化
pub fn init(env: Env, buyer: Address, seller: Address, arbiter: Address) {
    env.storage().instance().set(&BUYER, &buyer);
    env.storage().instance().set(&SELLER, &seller);
    env.storage().instance().set(&ARBITER, &arbiter);
}

// 仲介者のみの機能
arbiter.require_auth();
\`\`\``,
                learningGoal: '紛争解決を備えたマルチパーティエスクロー契約を実装する',
                hints: [
                    'initで: 買い手、売り手、仲介者のアドレスを保存',
                    'depositで: 買い手からrequire_auth、金額を保存',
                    'releaseで: 仲介者からrequire_auth、売り手に転送',
                    'refundで: 仲介者からrequire_auth、買い手に払い戻す',
                ],
            },
            'zh-CN': missionsZhCN['escrow-agent'],
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


            ja: {
                title: '継続の契約',
                story: `# 🔄 周期エンジン

先進プロトコルの地区の中核に**周期エンジン**が鼓動しています。自動化された周期的な協約に電力を供給しています。

*"最も強力なコントラクトは、注意を払わずに機能するもだ,"* エンジンの番人が言います。*"定期的な支払いを集めるサブスクリプションを構築するのだ。"*

## あなたの使命

サブスクリプション管理コントラクトを作成してください:
- \`subscribe\` — ユーザーがプランを購読（プラン、次の請求を保存）
- \`collect\` — 請求が期限切れの場合、サブスクリプション料金を徴収
- \`cancel\` — サブスクリプションをキャンセル
- \`get_subscription\` — ユーザーのサブスクリプション情報を返す

## これから学ぶこと

- レッジャーシーケンス付き定期請求ロジック
- サブスクリプション状態管理
- キャンセルと払い戻しパターン
- 時間間隔計算

## 重要なコンセプト

\`\`\`rust
// サブスクリプション期間を追跡
let interval: u32 = 1000; // 約1000レッジャーごとに請求
let next_billing: u32 = env.ledger().sequence() + interval;

// 請求が期限切れかを確認
if env.ledger().sequence() >= next_billing {
    // 支払いを徴収
}
\`\`\``,
                learningGoal: '定期請求を備えた定期サブスクリプションコントラクトを構築する',
                hints: [
                    'subscribeで: プランを保存、next_billingをsequence + intervalに設定',
                    'collectで: sequence >= next_billingを確認、その場合は徴収して更新',
                    'cancelで: ストレージからサブスクリプションデータをクリア',
                ],
            },
            'zh-CN': missionsZhCN['subscription'],
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


            ja: {
                title: '閃光の融資',
                story: `# ⚡ 稲妻の金庫

シタデルの最下層には**稲妻の金庫**があります。ここで資本は光の速度で動きます。

*"フラッシュローンはコントラクト設計の最終試験だ,"* 稲妻の統治者が言います。*"借りて、使い、一つのトランザクション内に返すのだ。"*

## あなたの使命

簡略化されたフラッシュローンプールを構築してください:
- \`init\` — プール残高を設定
- \`flash_loan\` — プールから借りる（呼び出し内に返す必要あり）
- \`get_pool_balance\` — 現在のプール残高を返す
- \`repay\` — 借りた金額と小額の手数料を返す

## これから学ぶこと

- フラッシュローン機構（簡略版）
- プール残高管理
- ローンライフサイクル追跡
- 返済時の手数料パターン

## 重要なコンセプト

\`\`\`rust
// アクティブなローンを追跡
let loan: i128 = env.storage().instance()
    .get(&(borrower.clone(), LOAN_AMOUNT))
    .unwrap_or(0);

// 手数料を払い戻す
let fee = amount / 100; // 1%手数料
env.storage().instance().set(&POOL, &(pool_bal + amount + fee));
\`\`\``,
                learningGoal: '簡略化されたフラッシュローンプールコントラクトを構築する',
                hints: [
                    'initで: 初期プール残高を保存',
                    'flash_loanで: プールが十分あることを確認、プールから差引、ローンを記録',
                    'repayで: ローンが存在することを確認、手数料付き資金をプールに返す、ローンをクリア',
                ],
            },
            'zh-CN': missionsZhCN['flash-loan'],
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


            ja: {
                title: '許可と役割',
                story: `# 🛡️ 役割の間

稲妻の金庫を超えて**役割の間**が立ちはだかります。ここでアクセスは構造化された許可によって統治されます。

*"さまよう者がすべてのドアへのアクセスを意図されていない,"* 役割の主人が宣言します。*"役割がしたり来ないことを定義するシステムを構築するのだ。"*

## あなたの使命

ロールベースアクセス制御コントラクトを作成してください:
- \`grant_role\` — 管理者がユーザーにロールを付与
- \`revoke_role\` — 管理者がユーザーからロールを取得
- \`has_role\` — ユーザーが特定のロールを持っているかを確認
- \`get_admin\` — コントラクトの管理者を返す

## これから学ぶこと

- ロールベースアクセス制御（RBAC）パターン
- 管理者のみの特権機能
- ロールメンバーシップ用複合キー
- 柔軟な許可アーキテクチャ

## 重要なコンセプト

\`\`\`rust
// ロールを付与
let role_key = (user.clone(), role.clone());
env.storage().instance().set(&role_key, &true);

// ロールメンバーシップを確認
env.storage().instance()
    .get(&(user.clone(), role.clone()))
    .unwrap_or(false)
\`\`\``,
                learningGoal: 'ロールベースアクセス制御コントラクトを実装する',
                hints: [
                    'initで: 管理者アドレスを保存',
                    'grant_roleで: 管理者からrequire_auth、ユーザーのロールメンバーシップを保存',
                    'revoke_roleで: 管理者からrequire_auth、ロールメンバーシップを削除',
                    'has_roleで: ロールキーが存在してtrueであることを確認',
                ],
            },
            'zh-CN': missionsZhCN['permissions-rbac'],
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


            ja: {
                title: 'オラクルフィード',
                story: `# 📊 オラクルの塔

本番システムの集落の頂上に立つ**オラクルの塔**は、オフチェーンデータがブロックチェーンに入る場所です。

*「スマートコントラクトはデータなしでは盲目です」* と、オラクルの賢者は言います。*「オンチェーンとオフチェーンの世界の間に橋を架けてください。」*

## あなたのミッション

価格オラクルコントラクトを作成してください：
- \`update_price\` — 管理者がアセットペアの価格を更新します
- \`get_price\` — アセットペアの現在の価格を返します
- \`get_last_updated\` — 価格が最後に更新された時刻を返します
- \`get_all_assets\` — 追跡されているすべてのアセットペアを返します

## 学ぶこと

- オラクルデータフィードパターン
- 管理者専用の更新関数
- タイムスタンプ/シーケンス追跡
- Vec<Symbol>を使用したアセットペア管理

## 重要な概念

\`\`\`rust
// メタデータ付きの価格を保存
pub fn update_price(env: Env, asset: Symbol, price: i128) {
    admin.require_auth();
    env.storage().instance().set(&asset, &price);
    env.storage().instance()
        .set(&(asset.clone(), TIMESTAMP), &env.ledger().sequence());
}
\`\`\``,
                learningGoal: '管理者アップデートを使用したオンチェーン価格オラクルを構築してください',
                hints: [
                    'update_priceで：管理者からrequire_auth、価格とシーケンスを保存',
                    'get_priceで：資産の価格をルックアップして返す',
                    'get_last_updatedで：資産用に保存されたシーケンスを返す',
                    'get_all_assetsで：event-emitterと同様のVec<Symbol>トラッカーを使用',
                ],
            },
            'zh-CN': missionsZhCN['oracle-feed'],
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


            ja: {
                title: 'シンプルガバナー',
                story: `# 🏛️ 統治の殿堂

最後の部屋が待っています — **統治の殿堂**は、全王国の運命が集団の意志によって決定される場所です。

*「最高のスマートコントラクトはコミュニティに自分たちを統治する権限を与えます」* と、大長老は宣言します。*「提案が投票を通じて法律になるシステムを構築してください。」*

## あなたのミッション

提案と投票を備えたガバナンスコントラクトを作成してください：
- \`create_proposal\` — 説明と投票期間を含む提案を作成します
- \`vote\` — アクティブな提案に投票（はい/いいえ）を投じます
- \`execute\` — 提案が可決された場合、その提案を実行します
- \`get_proposal\` — 提案の詳細を返します

## 学ぶこと

- オンチェーン統治メカニズム
- 提案ライフサイクル（作成→投票→実行）
- Map<Address, bool>での投票集計
- 定足数と承認閾値ロジック

## 重要な概念

\`\`\`rust
// 提案ごとの投票を追跡
let mut votes: Map<Address, bool> = env.storage().instance()
    .get(&VOTES)
    .unwrap_or(Map::new(&env));
votes.set(&voter, &support);

// 承認を数える
let yes_votes: u32 = /* valueがtrueの投票を数える */
let no_votes: u32 = /* valueがfalseの投票を数える */
\`\`\``,
                learningGoal: '提案と投票を備えた完全なオンチェーン統治システムを構築してください',
                hints: [
                    'create_proposalで：説明、期限、はい/いいえのカウントを保存',
                    'voteで：提案がアクティブかどうかを確認し、投票者の選択を記録し、合計を更新',
                    'executeで：提案が可決されたことを確認し（はい>いいえ）、実行済みとしてマーク',
                ],
            },
            'zh-CN': missionsZhCN['governor-simple'],
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


            ja: {
                title: 'リエントランシーガード',
                story: `# 🛡️ 脆弱性の鍛冶場

シタデルの奥深くに**脆弱性の鍛冶場**があります。ここは壊れたコントラクトが修復される場所です。

*「スマートコントラクトで最も危険な脆弱性は」* と、セキュリティの賢者は警告します、*「リエントランシーです。状態を保持しながら外部コードを呼び出すコントラクトは悪用される可能性があります。」*

## あなたのミッション

以下のvaultコントラクトはリエントランシーに対して脆弱です — 資金を送信した後に残高を更新します。**ミューテックスガード**パターンを使用してそれを修正してください：リエントランシーを防止するブール値フラグです。

脆弱なコードは以下のものです：
- \`withdraw\`は状態を更新する前に資金を送信します（バグ）
- リエントランシー保護がない

以下のように修正してください：
1. \`false\`に初期化されたミューテックスブール値ストレージキーを追加
2. \`withdraw\`の開始時に\`true\`に設定
3. \`withdraw\`の終了時に\`false\`に設定
4. エントリでミューテックスをチェックし、ロック済みの場合はpanicをトリガー

## 学ぶこと

- リエントランシー脆弱性の特定
- 予防のためのミューテックス/ガードパターン
- チェック・エフェクト・インタラクションパターン
- セキュリティファースト開発の考え方

## 重要な概念

\`\`\`rust
// ミューテックスガードパターン
if env.storage().instance().get(&MUTEX).unwrap_or(false) {
    panic!("Reentrancy detected");
}
env.storage().instance().set(&MUTEX, &true);
// ... 脆弱な操作 ...
env.storage().instance().set(&MUTEX, &false);
\`\`\``,
                learningGoal: 'ミューテックスガードパターンを使用してリエントランシー脆弱性を修正',
                hints: [
                    'ミューテックス定数を追加：`const MUTEX: Symbol = symbol_short!("MUTEX");`',
                    'withdrawの開始時、ミューテックスがtrueか確認し、その場合panicをトリガー',
                    'ミューテックスを残高更新前にtrueに、その後falseに設定',
                ],
            },
            'zh-CN': missionsZhCN['reentrancy-guard'],
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

            fr: {
                title: 'Correction du Contrôle d\'Accès',
                story: `# 🔓 La Brèche des Permissions

La **Brèche des Permissions** est un terrain d'entraînement où l'on répare la logique d'autorisation défaillante.

*"La deuxième vulnérabilité la plus courante,"* explique le Sage de la Sécurité, *"est l'absence de contrôle d'accès. Des fonctions qui devraient être réservées aux administrateurs sont appelables par n'importe qui."*

## Ta Mission

Le contrat ci-dessous stocke une adresse \`admin\` mais n'utilise JAMAIS \`require_auth()\` sur les fonctions privilégiées. Ta tâche est d'ajouter un contrôle d'accès approprié.

Le code vulnérable comporte :
- Une constante \`ADMIN\` définie mais jamais vérifiée
- Les fonctions \`set_fee\` et \`pause\` appelables par n'importe qui
- Aucun appel à \`require_auth()\` où que ce soit

            'zh-CN': missionsZhCN['access-control-fix'],
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
        i18n: {

            fr: {
                title: 'Dojo de Stockage',
                story: `# 🥋 Dojo de Stockage

Bienvenue au **Dojo de Stockage** — une salle d'entraînement paisible en dehors du chemin de campagne.

*"Avant de maîtriser les protocoles complexes, répète les bases jusqu'au réflexe,"* dit le Maître du Dojo.

## Ta Mission

Construis un contrat minimal capable de sauvegarder et récupérer une seule valeur :

- \`set_value\` — stocke un \`u32\` sous une clé fixe
- \`get_value\` — récupère la valeur stockée (par défaut \`0\` si vide)

## Ce Que Tu Apprendras

- \`env.storage().instance().set(&key, &value)\` — écrire
- \`env.storage().instance().get(&key).unwrap_or(0)\` — lire avec défaut
- La macro \`symbol_short!\` pour les clés de stockage

## Concepts Clés

\`\`\`rust
const VALUE: Symbol = symbol_short!("VALUE");
env.storage().instance().set(&VALUE, &value);
env.storage().instance().get(&VALUE).unwrap_or(0)
\`\`\``,
                learningGoal: 'Pratique le stockage instance de base : enregistrer et récupérer une valeur u32',
                hints: [
                    'Définis `const VALUE: Symbol = symbol_short!("VALUE");` en haut',
                    'Dans set_value : `env.storage().instance().set(&VALUE, &value)`',
                    'Dans get_value : `env.storage().instance().get(&VALUE).unwrap_or(0)`',
                ],
            },
            'zh-CN': missionsZhCN['standalone-storage-dojo'],
        },
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
        i18n: {

            fr: {
                title: "Exercice du Garde d'Autorisation",
                story: `# 🛡️ Exercice du Garde d'Autorisation

Entre dans le **Poste de Garde** — un exercice isolé pour l'autorisation.

*"Chaque changement d'état doit prouver qui l'a demandé,"* avertit le Capitaine de la Garde.

## Ta Mission

Construis un contrat qui protège une action privilégiée avec \`require_auth\` :

- \`init\` — enregistre une adresse admin
- \`protected_action\` — exige l'auth de l'appelant, met le drapeau \`DONE\` à \`true\`
- \`is_done\` — renvoie si le drapeau est activé

## Ce Que Tu Apprendras

- Le type \`Address\` pour les identités
- Le garde \`address.require_auth()\`
- Stocker et vérifier un drapeau booléen

## Concepts Clés

\`\`\`rust
let admin: Address = env.storage().instance().get(&ADMIN).unwrap();
admin.require_auth();
env.storage().instance().set(&DONE, &true);
\`\`\``,
                learningGoal: "Pratique le contrôle require_auth pour un changement d'état protégé",
                hints: [
                    "Stocke admin dans init : `env.storage().instance().set(&ADMIN, &admin)`",
                    "Dans protected_action : vérifie avec `user.require_auth()`",
                    "Active le drapeau : `env.storage().instance().set(&DONE, &true)`",
                ],
            },
            'zh-CN': missionsZhCN['standalone-auth-guard'],
        },
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
        i18n: {

            fr: {
                title: 'Laboratoire de Vecteurs',
                story: `# 🧪 Laboratoire de Vecteurs

Entre dans le **Laboratoire de Vecteurs** — un atelier pratique pour la collection la plus flexible de Soroban.

*"Les vecteurs contiennent le multiple, ordonnent le multiple, renvoient le multiple,"* dit le Technicien de Laboratoire.

## Ta Mission

Crée un contrat qui construit et inspecte des Vecteurs :

- \`make_sequence\` — renvoie un \`Vec<u32>\` contenant \`[1, 2, 3]\`
- \`get_length\` — reçoit un \`Vec<u32>\` et renvoie sa longueur en \`u32\`

## Ce Que Tu Apprendras

- Le type \`Vec\` et la macro \`vec![&env, ...]\`
- \`Vec::len()\` pour la longueur
- Passer des Vecteurs entre les fonctions

## Concepts Clés

\`\`\`rust
use soroban_sdk::{vec, Vec};
vec![&env, 1u32, 2u32, 3u32]
vals.len()
\`\`\``,
                learningGoal: 'Pratique la création et l\'inspection de collections Vec<u32>',
                hints: [
                    'Utilise `vec![&env, 1u32, 2u32, 3u32]` pour construire la séquence',
                    'Signature pour get_length : `pub fn get_length(env: Env, vals: Vec<u32>) -> u32`',
                    'Renvoie la longueur avec `vals.len()`',
                ],
            },
            'zh-CN': missionsZhCN['standalone-vector-lab'],
        },
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

    const resolve = (value, language) => {
        if (typeof value !== 'string' || !value.startsWith('missions.')) return value;
        return value.split('.').reduce((current, part) => current?.[part], missionLocales[language]);
    };

    // Resolve each field against the locale it actually came from, so a
    // field that falls back to English never looks up the requested
    // language's locale file (e.g. 'zh-CN', which has no mission keys).
    const pick = (field) => {
        if (locale[field] != null) {
            return resolve(locale[field], locale === i18n?.[lang] ? lang : DEFAULT_MISSION_LANG);
        }
        if (fallback[field] != null) return resolve(fallback[field], DEFAULT_MISSION_LANG);
        return resolve(neutral[field], DEFAULT_MISSION_LANG);
    };

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
