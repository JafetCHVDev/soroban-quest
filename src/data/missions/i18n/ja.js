/* eslint-disable no-useless-escape */
export const missionLocale = {
  "hello-soroban": {
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
  "greetings-protocol": {
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
  "counter-vault": {
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
  "guardian-ledger": {
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
  "token-forge": {
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
  "time-lock": {
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
  "multi-party-pact": {
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
  "vault-manager": {
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
  "event-emitter": {
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
  "approval-manager": {
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
  "crowdfund": {
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
  "escrow-agent": {
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
  "subscription": {
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
  "flash-loan": {
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
  "permissions-rbac": {
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
  "oracle-feed": {
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
  "governor-simple": {
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
  "reentrancy-guard": {
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
  "access-control-fix": {
                title: 'アクセス制御の修正',
                story: `# 🔓 パーミッション侵害

**パーミッション侵害**は、故障した認可ロジックが修復される訓練場です。

*「最も一般的な2番目の脆弱性は」* と、セキュリティの賢者は説明します、*「アクセス制御の欠落です。管理者に限定されるべき関数は誰でも呼び出すことができます。」*

## あなたのミッション

以下のコントラクトは\`admin\`アドレスを保存していますが、特権関数で\`require_auth()\`を使用することはありません。適切なアクセス制御を追加してください。

脆弱なコードは以下のものです：
- 定義されているが検証されない\`ADMIN\`定数
- 誰でも呼び出せる\`set_fee\`および\`pause\`関数
- どこにも\`require_auth()\`呼び出しがない

以下のように修正してください：
1. \`set_fee\`と\`pause\`に\`require_auth()\`チェックを追加
2. 認証をチェックする前にストレージから管理者アドレスを読み込む

## 学ぶこと

- アクセス制御脆弱性の特定
- 適切な\`require_auth()\`配置
- 管理者専用関数パターン
- 多層防御の原則

## 重要な概念

\`\`\`rust
// 正しいアクセス制御
let admin: Address = env.storage().instance().get(&ADMIN).unwrap();
admin.require_auth();

// 現在、特権操作を実行
env.storage().instance().set(&FEE, &new_fee);
\`\`\``,
                learningGoal: 'require_auth()チェックを追加してアクセス制御の欠落を修正',
                hints: [
                    'set_feeで：ストレージからADMINを読み込み、admin.require_auth()を呼び出す',
                    'pauseで：ストレージからADMINを読み込み、admin.require_auth()を呼び出す',
                    'init関数は大丈夫です — 既に管理者を正しく保存しています',
                ],
            },
};
