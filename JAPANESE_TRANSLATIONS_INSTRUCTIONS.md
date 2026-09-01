# Japanese (ja) i18n Translations for 17 Missions

This document provides str_replace commands for adding Japanese translations to missions 3-19 in `src/data/missions.js`.

## Mission 3: counter-vault

**Location**: After the French (fr) section, before `template:`

**oldStr** (Find this French closing section):
```javascript
                learningGoal: 'Utilise le stockage persistant pour créer un contrat compteur avec état',
                hints: [
                    'Utilise `env.storage().instance().get(&COUNTER)` pour lire le décompte',
                    'Utilise `.unwrap_or(0)` pour renvoyer 0 par défaut quand aucune valeur n\'existe',
                    'Utilise `env.storage().instance().set(&COUNTER, &new_count)` pour enregistrer le nouveau décompte',
                ],
            },
```

**newStr** (Replace with French + Japanese):
```javascript
                learningGoal: 'Utilise le stockage persistant pour créer un contrat compteur avec état',
                hints: [
                    'Utilise `env.storage().instance().get(&COUNTER)` pour lire le décompte',
                    'Utilise `.unwrap_or(0)` pour renvoyer 0 par défaut quand aucune valeur n\'existe',
                    'Utilise `env.storage().instance().set(&COUNTER, &new_count)` pour enregistrer le nouveau décompte',
                ],
            },
            ja: {
                title: '数の庫',
                story: `# 🔐 永遠の記憶を手に入れる...

記憶の庫へと下降するあなた。ここは、古代の賢者たちが時を超えて続く叡智を保管した場所です。

*「記憶のないコントラクトは、魂のない意識体のようなもんじゃ」* と庫番は呟きました。*「どうやってデータを保存し取り出すかを学ぶべし — それが『思い出す』ということなのじゃ」*

## あなたの使命

その値を永続的に保存するカウンターコントラクトを作成してください:
- \`increment\` — カウンターを1増やす
- \`get_count\` — 現在のカウント値を返す

## これから学ぶこと

- \`env.storage().instance()\`による**永続的ストレージ**
- 状態の読み書き
- ストレージ用の\`Symbol\`キーパターン
- \`.unwrap_or()\`によるデフォルト値設定

## 重要なコンセプト

\`\`\`rust
env.storage().instance().set(&key, &value)  // 書き込み
env.storage().instance().get(&key)          // 読み込み (Optionを返す)
.unwrap_or(default)                         // Noneの場合のデフォルト
\`\`\``,
                learningGoal: 'スマートコントラクト内で永続的な状態を管理し、その値を変更・取得する',
                hints: [
                    'Envの`storage()`メソッドを使うことで、ブロックチェーン上に永遠にデータを保存できます',
                    'Symbol型をキーとして使うことで、異なる値を区別することができます',
                    '`unwrap_or()`メソッドは、値が存在しない場合のデフォルト値を指定するのに便利です',
                ],
            },
```

---

## Mission 4: guardian-ledger

**Location**: After the French (fr) section, before `template:`

**oldStr** (Find this French closing section):
```javascript
                learningGoal: 'Implémente le contrôle d\'accès avec Address et require_auth',
                hints: [
                    'La fonction init stocke l\'admin : `env.storage().instance().set(&ADMIN, &admin)`',
                    'Dans register, appelle `who.require_auth()` avant de stocker',
                    'Stocke avec : `env.storage().instance().set(&who, &name)`',
                ],
            },
```

**newStr** (Replace with French + Japanese):
```javascript
                learningGoal: 'Implémente le contrôle d\'accès avec Address et require_auth',
                hints: [
                    'La fonction init stocke l\'admin : `env.storage().instance().set(&ADMIN, &admin)`',
                    'Dans register, appelle `who.require_auth()` avant de stocker',
                    'Stocke avec : `env.storage().instance().set(&who, &name)`',
                ],
            },
            ja: {
                title: '守護者の記録簿',
                story: `# 📋 複数の秘密を守る責任...

評議会の間は先祖からの光で輝いています。あなたの前には**守護者の記録簿**があります — 自分の価値を証明した全ての者の登録簿です。

*「王国を守るためには、誰が行動できるかをコントロールしなければならん」* と評議会の長は宣言します。*「アクセス制御の技を学べ」*

## あなたの使命

アクセス制御機能を持つレジストリコントラクトを構築してください:
- \`register\` — 新しい守護者を登録（その名前を保存）
- \`get_guardian\` — アドレスから守護者の名前を取得
- 初期化時に設定される\`admin\`アドレス

## これから学ぶこと

- ユーザーの身元を表す\`Address\`型
- アクセス制御のための\`require_auth()\`
- キー値ペアのための\`Map\`型の使用方法
- コントラクト初期化パターン

## 重要なコンセプト

\`\`\`rust
Address                     // アカウント/身元を表す
address.require_auth()      // 呼び出し元が認可されていることを確認
Map<Address, Symbol>        // キー値マッピング
\`\`\``,
                learningGoal: 'マップストレージを使用して複数のキーと値を管理し、ユーザーごとの状態を追跡する',
                hints: [
                    'Mapは多くの異なるユーザーやアカウントの情報を効率的に管理するために設計されています',
                    '`unwrap_or_else()`を使うことで、Mapが存在しない場合に新しいMapを作成できます',
                    'Address型は、スマートコントラクト内でユーザーを一意に識別するための標準的な方法です',
                ],
            },
```

---

## Mission 5: token-forge

**Location**: After the French (fr) section, before `template:`

**oldStr** (Find this French closing section):
```javascript
                learningGoal: 'Construis un token de base avec les fonctions mint, balance et transfer',
                hints: [
                    'Pour mint : récupère l\'admin depuis le stockage, appelle admin.require_auth(), puis mets à jour le solde',
                    'Pour balance : `env.storage().persistent().get(&account).unwrap_or(0)`',
                    'Pour transfer : require_auth de l\'expéditeur, lis les deux soldes, mets à jour les deux',
                ],
            },
```

**newStr**:
```javascript
                learningGoal: 'Construis un token de base avec les fonctions mint, balance et transfer',
                hints: [
                    'Pour mint : récupère l\'admin depuis le stockage, appelle admin.require_auth(), puis mets à jour le solde',
                    'Pour balance : `env.storage().persistent().get(&account).unwrap_or(0)`',
                    'Pour transfer : require_auth de l\'expéditeur, lis les deux soldes, mets à jour les deux',
                ],
            },
            ja: {
                title: 'トークン鍛造所',
                story: `# ⚒️ 新しい通貨を生み出す力...

シタデルの最深部にある**トークン鍛造所**では、デジタル資産が純粋なロジックから鋳造されます。

*「通貨は全ての経済の血液だ」* と鍛造マスターは言います。*「アカウント間で転送できるトークンを作成するのだ」*

## あなたの使命

シンプルなトークンコントラクトを作成してください:
- \`mint\` — あるアドレス用のトークンを作成（管理者のみ）
- \`balance\` — あるアドレスの残高を返す
- \`transfer\` — あるアドレスから別のアドレスにトークンを移動

## これから学ぶこと

- トークン残高管理
- 認可による転送ロジック
- 管理者限定機能
- 残高のための整数演算

## 重要なコンセプト

\`\`\`rust
// 管理者チェックパターン
admin.require_auth();

// 残高管理
let bal: i128 = env.storage().persistent().get(&from).unwrap_or(0);
\`\`\``,
                learningGoal: 'トークン転送ロジックを含む実用的なトークンコントラクトを実装する',
                hints: [
                    '転送を実行する前に、送信者に十分な残高があることを常に確認してください',
                    'トークンの総供給量と各アカウントのバランスを正確に追跡することが重要です',
                    '転送が成功または失敗したことを明確に示す戻り値やイベントが重要です',
                ],
            },
```

---

## Mission 6: time-lock

**Location**: After the French (fr) section, before `template:`

**oldStr**:
```javascript
                learningGoal: 'Implémente une logique conditionnelle basée sur le temps en utilisant la séquence du grand livre',
                hints: [
                    'Utilise `env.ledger().sequence()` pour obtenir le numéro de grand livre actuel',
                    'Compare : `if current_seq < unlock_at { panic!("Still locked"); }`',
                    'Nettoie le stockage après le déverrouillage : `env.storage().instance().remove(&key)`',
                ],
            },
```

**newStr**:
```javascript
                learningGoal: 'Implémente une logique conditionnelle basée sur le temps en utilisant la séquence du grand livre',
                hints: [
                    'Utilise `env.ledger().sequence()` pour obtenir le numéro de grand livre actuel',
                    'Compare : `if current_seq < unlock_at { panic!("Still locked"); }`',
                    'Nettoie le stockage après le déverrouillage : `env.storage().instance().remove(&key)`',
                ],
            },
            ja: {
                title: '時間の鍵',
                story: `# ⏳ 時を味方にする...

**Chrono Gate**があなたの前に立ちはだかります。その機構はレジャーのリズムで刻々と動いています。

*「時間は武器だ」* とChrono Guardianは言います。*「ブロックの経過に基づいてロックとアンロックする方法を学ぶのだ」*

## あなたの使命

時間ロック金庫を作成してください:
- \`lock\` — 指定したレジャーシーケンス番号まで資金をロック
- \`unlock\` — ロック期間が経過した場合は資金を解放
- \`get_lock_info\` — ロック解除時期を返す

## これから学ぶこと

- ブロックチェーンの時間ベースロジック用のレジャーシーケンス/タイムスタンプ
- ブロックチェーン状態に基づく条件付き実行
- 現在ブロック用の\`env.ledger().sequence()\`
- パニックパターンのエラーハンドリング

## 重要なコンセプト

\`\`\`rust
env.ledger().sequence()  // 現在のレジャーシーケンス番号
panic!("message")        // エラー付きで中止
\`\`\``,
                learningGoal: '時間ベースのアクセス制御を実装し、特定の時刻までアクセスを制限する',
                hints: [
                    '`env.ledger().sequence()`を使用することで、現在のブロックチェーン時刻を取得できます',
                    'タイムロックは、資金のリリースやアクションの遅延実行に有用です',
                    '解除時間を保存する際は、必ずそれをストレージに永続化してください',
                ],
            },
```

---

## Mission 7: multi-party-pact

**Location**: After the French (fr) section, before `template:`

**oldStr**:
```javascript
                learningGoal: 'Construis un contrat de pacte à signatures multiples avec une gestion d\'état complexe',
                hints: [
                    'Dans create_pact : stocke la description, le nombre requis et un décompte initial de signatures à 0',
                    'Dans sign_pact : lis le décompte actuel, incrémente-le de 1, enregistre-le à nouveau',
                    'Dans is_complete : compare signed >= required',
                ],
            },
```

**newStr**:
```javascript
                learningGoal: 'Construis un contrat de pacte à signatures multiples avec une gestion d\'état complexe',
                hints: [
                    'Dans create_pact : stocke la description, le nombre requis et un décompte initial de signatures à 0',
                    'Dans sign_pact : lis le décompte actuel, incrémente-le de 1, enregistre-le à nouveau',
                    'Dans is_complete : compare signed >= required',
                ],
            },
            ja: {
                title: '多者協約',
                story: `# 🤝 複数の意思を一つに統める...

あなたは**Pacts の Hall**に到達しました。これはガーディアンの間で自分の地位を獲得する前の最終的な挑戦です。

*「スマートコントラクトの真の力」* とGrand Elderは宣言します。*「は、見知らぬ者同士の間で信頼を可能にすることなのだ」*

## あなたの使命

N個の署名を必要とするマルチシグ契約を作成してください:
- \`create_pact\` — N個の署名が必要な契約を作成
- \`sign_pact\` — 関係者が契約に署名可能
- \`is_complete\` — 必要な署名がすべて収集されたかを確認
- \`get_signers\` — 誰が署名したかを返す

## これから学ぶこと

- コントラクト内の複雑なデータ構造
- マルチパーティ認可
- ストレージでのカウント追跡
- 実世界のガバナンスパターン構築

## 重要なコンセプト

\`\`\`rust
// 署名者数を追跡
let count: u32 = env.storage().instance()
    .get(&SIGNER_COUNT).unwrap_or(0);

// 動的キーで保存
env.storage().instance().set(&signer_key, &true);
\`\`\``,
                learningGoal: '複数の署名者からの承認を必要とするマルチシグコントラクトを実装する',
                hints: [
                    'すべての要求される署名者がトランザクションに署名したことを確認する必要があります',
                    'Vecを使用して、複数の署名者のリストを管理することができます',
                    'セキュリティのため、すべての署名者が合意するまでアクションは実行されません',
                ],
            },
```

---

## Mission 8: vault-manager

**Location**: After the French (fr) section, before `template:`

**oldStr**:
```javascript
                learningGoal: 'Construis un coffre multi-utilisateur avec le motif de stockage Map',
                hints: [
                    'Utilise Map<Address, i128> pour stocker les soldes des utilisateurs',
                    'Appelle user.require_auth() avant de modifier le solde d\'un utilisateur',
                    'Lis le Map depuis le stockage avec .unwrap_or(Map::new(&env))',
                    'Pour deposit : récupère le solde actuel, ajoute le montant, enregistre à nouveau',
                ],
            },
```

**newStr**:
```javascript
                learningGoal: 'Construis un coffre multi-utilisateur avec le motif de stockage Map',
                hints: [
                    'Utilise Map<Address, i128> pour stocker les soldes des utilisateurs',
                    'Appelle user.require_auth() avant de modifier le solde d\'un utilisateur',
                    'Lis le Map depuis le stockage avec .unwrap_or(Map::new(&env))',
                    'Pour deposit : récupère le solde actuel, ajoute le montant, enregistre à nouveau',
                ],
            },
            ja: {
                title: '金庫番',
                story: `# 🏦 複雑な財宝の管理...

Pacts の Hall の向こうにそびえ立つのは**Data Fortress**です。ここには数えきれないユーザーの残高が保管・保護されています。

*「一つの残高は些細なことだ」* Vault Architectは言います。*「多くのものを管理すること — それが本当のストレージアーキテクチャの技なのだ」*

## あなたの使命

複数のユーザー残高を管理する金庫コントラクトを構築してください:
- \`deposit\` — 資金をユーザーの残高に追加（ユーザーは認可が必要）
- \`withdraw\` — 資金をユーザーの残高から差引（ユーザーは認可が必要）
- \`get_balance\` — ユーザーの現在の残高を返す

## これから学ぶこと

- マルチユーザー状態用の\`Map<Address, i128>\`
- ユーザーごと認可用の\`Env::require_auth()\`
- 複雑なキーを持つ永続ストレージ
- 安全な演算パターン

## 重要なコンセプト

\`\`\`rust
// 複数残高用のMap
let mut balances: Map<Address, i128> = env.storage()
    .instance()
    .get(&BALANCES)
    .unwrap_or(Map::new(&env));

// ユーザーごと認可
user.require_auth();

// 更新と永続化
balances.set(user, &(current + amount));
env.storage().instance().set(&BALANCES, &balances);
\`\`\``,
                learningGoal: '複数のユーザーと複数のアセットを含む複雑な金庫システムを実装する',
                hints: [
                    '複合キー（タプル）を使うことで、ユーザーとアセットの両方を一つのマップキーとして使用できます',
                    '各操作の前に、必要な条件（十分な残高など）が満たされていることを確認してください',
                    '状態管理は、一貫性と正確さを保つために重要です',
                ],
            },
```

---

## Mission 9: event-emitter

**Location**: After the French (fr) section, before `template:`

**oldStr**:
```javascript
                learningGoal: 'Implémente l\'émission d\'événements dans un contrat de stockage clé-valeur',
                hints: [
                    'Utilise env.events().publish() avec un sujet Symbol et les données de l\'événement',
                    'Utilise Vec<Symbol> pour suivre toutes les clés stockées',
                    'Ajoute de nouvelles clés avec keys.push_back(key)',
                ],
            },
```

**newStr**:
```javascript
                learningGoal: 'Implémente l\'émission d\'événements dans un contrat de stockage clé-valeur',
                hints: [
                    'Utilise env.events().publish() avec un sujet Symbol et les données de l\'événement',
                    'Utilise Vec<Symbol> pour suivre toutes les clés stockées',
                    'Ajoute de nouvelles clés avec keys.push_back(key)',
                ],
            },
            ja: {
                title: '事象の放射',
                story: `# 📡 外の世界への知らせ...

Data Fortress の頂上に高くそびえているのが**Signal Beacon**です。Stellar ネットワーク中にイベントを放送しています。

*「コントラクトが話しかけるコントラクトは理解されるコントラクトだ」* Beacon Keeperは言います。*「イベントは世界に何が起きたかを知らせる」*

## あなたの使命

キー値データを保存し、あらゆる状態変化でイベントを発行するコントラクトを作成してください:
- \`set_value\` — 値を保存しキーと値を含むイベントを発行
- \`get_value\` — キーで保存された値を取得
- \`get_all_keys\` — 保存されたすべてのキーを返す

## これから学ぶこと

- イベント発行用の\`env.events().publish()\`
- 動的キー追跡用の\`Vec<Symbol>\`
- イベント駆動コントラクトアーキテクチャ
- Stellar上のパブリッシュ・サブスクライブパターン

## 重要なコンセプト

\`\`\`rust
// イベントを発行
env.events().publish(
    &symbol_short!("set_value"),
    (key, value),
);

// Vec で キーを追跡
let mut keys = env.storage().instance()
    .get(&KEYS)
    .unwrap_or(Vec::new(&env));
keys.push_back(key);
\`\`\``,
                learningGoal: 'スマートコントラクト内で重要なイベントを発行し、外部システムに通知する',
                hints: [
                    '`env.events().publish()`を使用することで、重要な出来事を記録できます',
                    'イベントトピックは、複数の値のタプルで構成されます',
                    'イベントはブロックチェーン上に永遠に記録され、外部でも監視できます',
                ],
            },
```

---

## Mission 10: approval-manager

**Location**: After the French (fr) section, before `template:`

**oldStr**:
```javascript
                learningGoal: 'Implémente un système d\'allocation et de transfert délégué',
                hints: [
                    'Utilise un tuple (Address, Address) comme clé de stockage composée',
                    'Dans approve : stocke l\'allocation pour la paire (owner, spender)',
                    'Dans transfer_from : require_auth du spender, vérifie l\'allocation, décrémente-la, mets à jour les soldes',
                ],
            },
```

**newStr**:
```javascript
                learningGoal: 'Implémente un système d\'allocation et de transfert délégué',
                hints: [
                    'Utilise un tuple (Address, Address) comme clé de stockage composée',
                    'Dans approve : stocke l\'allocation pour la paire (owner, spender)',
                    'Dans transfer_from : require_auth du spender, vérifie l\'allocation, décrémente-la, mets à jour les soldes',
                ],
            },
            ja: {
                title: '許可管理者',
                story: `# ✋ 委譲された力...

Data Fortress の中に**Delegation Chamber**があります。ここでは信頼が手当てを通じて形式化されます。

*「あなたは常に自分で行動することはできない」* Delegation Masterは説明します。*「ときには、自分に代わって行動できるように他人を権限付与しなければならん」*

## あなたの使命

ユーザーが他の者が自分に代わって支出できるように承認できるコントラクトを構築してください:
- \`approve\` — オーナーが支出者に特定金額の支出を認可
- \`transfer_from\` — 支出者がオーナーから受取人へ転送
- \`allowance\` — 支出者が支出を認可された金額を確認

## これから学ぶこと

- ネストされたキー値パターン（オーナー → 支出者 → 許可）
- 委譲認可
- デュアルアドレスストレージキー
- 許可デクリメントパターン

## 重要なコンセプト

\`\`\`rust
// 許可の複合ストレージキー
let allowance_key = (owner.clone(), spender.clone());
env.storage().instance().set(&allowance_key, &amount);

// ネストされた許可を読み込み
env.storage().instance().get(&(owner, spender))
    .unwrap_or(0)
\`\`\``,
                learningGoal: 'アローアンスパターンを実装し、ユーザーが他のアドレスに限定的な権限を委譲できるようにする',
                hints: [
                    'アローアンスは、オーナーと支出者のペアをキーとして管理されます',
                    'transferFromを使用する前に、アローアンスの量を確認する必要があります',
                    'アローアンスの使用後は、残りの額を正確に更新することが重要です',
                ],
            },
```

---

## Mission 11: crowdfund

**Location**: After the French (fr) section, before `template:`

**oldStr**:
```javascript
                learningGoal: 'Construis un contrat de financement participatif avec suivi d\'objectif et d\'échéance',
                hints: [
                    'Dans init : stocke le montant objectif et la séquence de grand livre de la date limite',
                    'Dans contribute : vérifie que la date limite n\'est pas passée, ajoute le montant au total',
                    'Dans check_goal : compare le total collecté à l\'objectif',
                ],
            },
```

**newStr**:
```javascript
                learningGoal: 'Construis un contrat de financement participatif avec suivi d\'objectif et d\'échéance',
                hints: [
                    'Dans init : stocke le montant objectif et la séquence de grand livre de la date limite',
                    'Dans contribute : vérifie que la date limite n\'est pas passée, ajoute le montant au total',
                    'Dans check_goal : compare le total collecté à l\'objectif',
                ],
            },
            ja: {
                title: '群衆からの資金',
                story: `# 🎯 多くの者の力を集める...

あなたは**Crowdforge Arena**に入ります。ここでは集団の力がアイデアに命を吹き込みます。

*「ひとりでは強い」* Auctioneerはアナウンスします。*「一緒なら、星さえ動かすことができる。人々が資金提供できるキャンペーンを構築しろ」*

## あなたの使命

クラウドファンディングコントラクトを作成してください:
- \`init\` — 資金調達目標と期限（レジャーシーケンス）を設定
- \`contribute\` — 提供者から資金を追加
- \`check_goal\` — 合計寄付金 >= 目標の場合、trueを返す
- \`get_total_raised\` — 集められた合計資金を返す

## これから学ぶこと

- 時間ベースの期限用レジャーシーケンス
- エスクロー的な資金蓄積
- 条件付きチェックを使用した目標追跡
- マルチ提供者状態管理

## 重要なコンセプト

\`\`\`rust
// 集められた合計を追跡
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
                learningGoal: 'クラウドファンディングキャンペーンの基本的なロジックを実装し、資金集約と目標達成を管理する',
                hints: [
                    '複数の支援者からの寄付を追跡するには、Mapを使用してください',
                    'キャンペーンの成功または失敗を判定するためのロジックが重要です',
                    '期限と目標額の両方を確認してから、返金または資金の解放を行ってください',
                ],
            },
```

---

## Mission 12: escrow-agent

**Location**: After the French (fr) section, before `template:`

**oldStr**:
```javascript
                learningGoal: 'Implémente un contrat de séquestre multipartite avec résolution de litiges',
                hints: [
                    'Dans init : stocke les adresses de l\'acheteur, du vendeur et de l\'arbitre',
                    'Dans deposit : require_auth de l\'acheteur et stocke le montant',
                    'Dans release : require_auth de l\'arbitre, transfère au vendeur',
                    'Dans refund : require_auth de l\'arbitre, rembourse à l\'acheteur',
                ],
            },
```

**newStr**:
```javascript
                learningGoal: 'Implémente un contrat de séquestre multipartite avec résolution de litiges',
                hints: [
                    'Dans init : stocke les adresses de l\'acheteur, du vendeur et de l\'arbitre',
                    'Dans deposit : require_auth de l\'acheteur et stocke le montant',
                    'Dans release : require_auth de l\'arbitre, transfère au vendeur',
                    'Dans refund : require_auth de l\'arbitre, rembourse à l\'acheteur',
                ],
            },
            ja: {
                title: 'エスクローの使者',
                story: `# 🤲 信頼の中間者になる...

Crowdforge Arena の深部にある**Trust Exchange**では、見知らぬ者同士の取引を仲介します。

*「信頼は最も稀な通貨だ」* Escrow Mediatorは言います。*「条件が満たされるまで価値を保つシステムを構築しろ」*

## あなたの使命

買い手、売り手、仲裁者を含むエスクロー契約を作成してください:
- \`init\` — 買い手、売り手、仲裁者のアドレスでエスクローを設定
- \`deposit\` — 買い手がエスクローに資金をデポジット
- \`release\` — 仲裁者が売り手に資金をリリース
- \`refund\` — 仲裁者が買い手にリファンド

## これから学ぶこと

- マルチパーティコントラクト初期化
- 3アクター認可パターン
- エスクロー生命周期の状態マシン
- 紛争解決パターン

## 重要なコンセプト

\`\`\`rust
// マルチパーティ初期化
pub fn init(env: Env, buyer: Address, seller: Address, arbiter: Address) {
    env.storage().instance().set(&BUYER, &buyer);
    env.storage().instance().set(&SELLER, &seller);
    env.storage().instance().set(&ARBITER, &arbiter);
}

// 仲裁者のみの機能
arbiter.require_auth();
\`\`\``,
                learningGoal: 'エスクロー契約ロジックを実装し、買い手と売り手の間で資金を安全に管理する',
                hints: [
                    'エスクロー契約では、両者の承認を待つことが重要です',
                    '資金は、両者が合意するまで動いてはいけません',
                    '各エスクロー契約には、独自のIDと状態が必要です',
                ],
            },
```

---

## Mission 13: subscription

**Location**: After the French (fr) section, before `template:`

**oldStr**:
```javascript
                learningGoal: 'Construis un contrat d\'abonnement récurrent avec facturation périodique',
                hints: [
                    'Dans subscribe : stocke le plan, définis next_billing à sequence + intervalle',
                    'Dans collect : vérifie si sequence >= next_billing, si c\'est le cas collecte et mets à jour next_billing',
                    'Dans cancel : nettoie les données d\'abonnement du stockage',
                ],
            },
```

**newStr**:
```javascript
                learningGoal: 'Construis un contrat d\'abonnement récurrent avec facturation périodique',
                hints: [
                    'Dans subscribe : stocke le plan, définis next_billing à sequence + intervalle',
                    'Dans collect : vérifie si sequence >= next_billing, si c\'est le cas collecte et mets à jour next_billing',
                    'Dans cancel : nettoie les données d\'abonnement du stockage',
                ],
            },
            ja: {
                title: '継続の契約',
                story: `# 🔄 繰り返される約束...

Advanced Protocols 地区の心臓で鼓動しているのが**Recurring Engine**です。自動周期的契約に力を与えています。

*「最も強力なコントラクトは、絶え間ない注意なしに機能するもの」* Engine Tenderは言います。*「定期的な支払いを集める購読を構築しろ」*

## あなたの使命

購読管理コントラクトを作成してください:
- \`subscribe\` — ユーザーがプランに購読（プランと次の請求を保存）
- \`collect\` — 請求が期限の場合、購読料を集める
- \`cancel\` — 購読をキャンセル
- \`get_subscription\` — ユーザーの購読情報を返す

## これから学ぶこと

- レジャーシーケンスを使用した定期請求ロジック
- 購読状態管理
- キャンセルとリファンドパターン
- 時間間隔計算

## 重要なコンセプト

\`\`\`rust
// 購読期間を追跡
let interval: u32 = 1000; // ~1000レジャーごとに請求
let next_billing: u32 = env.ledger().sequence() + interval;

// 請求が期限かチェック
if env.ledger().sequence() >= next_billing {
    // 支払いを集める
}
\`\`\``,
                learningGoal: 'サブスクリプション・支払いシステムを実装し、定期的な更新と支払いを管理する',
                hints: [
                    '各サブスクリプションの更新時刻を追跡することが重要です',
                    '現在のレッジャーシーケンスと次の更新時刻を比較してください',
                    'サブスクリプションの状態（アクティブ、非アクティブ）を管理する必要があります',
                ],
            },
```

---

## Mission 14: flash-loan

**Location**: After the French (fr) section, before `template:`

**oldStr**:
```javascript
                learningGoal: 'Construis un contrat de pool de prêts flash simplifié',
                hints: [
                    'Dans init : stocke le solde initial du pool',
                    'Dans flash_loan : vérifie que le pool en a assez, déduis du pool, enregistre le prêt',
                    'Dans repay : vérifie que le prêt existe, rends les fonds plus les frais au pool, nettoie le prêt',
                ],
            },
```

**newStr**:
```javascript
                learningGoal: 'Construis un contrat de pool de prêts flash simplifié',
                hints: [
                    'Dans init : stocke le solde initial du pool',
                    'Dans flash_loan : vérifie que le pool en a assez, déduis du pool, enregistre le prêt',
                    'Dans repay : vérifie que le prêt existe, rends les fonds plus les frais au pool, nettoie le prêt',
                ],
            },
            ja: {
                title: '閃光の融資',
                story: `# ⚡ 一瞬の力を借りる...

Citadel の最も深い層にある**Lightning Vault**では、資本が光の速度で動きます。

*「フラッシュローンはコントラクト設計の究極のテストだ」* Lightning Archonは言います。*「借り、使い、そして一度の取引内で返すのだ」*

## あなたの使命

簡略化されたフラッシュローンプールを構築してください:
- \`init\` — プール残高を設定
- \`flash_loan\` — プールから借り入れ（呼び出し内で返却必須）
- \`get_pool_balance\` — 現在のプール残高を返す
- \`repay\` — 借用額と小額の手数料を返金

## これから学ぶこと

- フラッシュローン機構（検証用に簡略化）
- プール残高管理
- ローン生命周期追跡
- 返却時手数料パターン

## 重要なコンセプト

\`\`\`rust
// アクティブなローンを追跡
let loan: i128 = env.storage().instance()
    .get(&(borrower.clone(), LOAN_AMOUNT))
    .unwrap_or(0);

// 手数料付きで返却
let fee = amount / 100; // 1% の手数料
env.storage().instance().set(&POOL, &(pool_bal + amount + fee));
\`\`\``,
                learningGoal: 'フラッシュローン機能を実装し、一瞬だけ大額の資金を借り、同一トランザクション内で返却する',
                hints: [
                    'フラッシュローンはロック機構を使用して、再入攻撃を防ぎます',
                    '借用人は、トランザクション内に資金を返す必要があります',
                    'プール内の利用可能な資金を確認してから、融資を承認してください',
                ],
            },
```

---

## Mission 15: permissions-rbac

**Location**: After the French (fr) section, before `template:`

**oldStr**:
```javascript
                learningGoal: 'Implémente un contrat de contrôle d\'accès basé sur les rôles',
                hints: [
                    'Dans init : stocke l\'adresse de l\'admin',
                    'Dans grant_role : require_auth de l\'admin, stocke l\'appartenance au rôle pour l\'utilisateur',
                    'Dans revoke_role : require_auth de l\'admin, supprime l\'appartenance au rôle',
                    'Dans has_role : vérifie si la clé du rôle existe et est true',
                ],
            },
```

**newStr**:
```javascript
                learningGoal: 'Implémente un contrat de contrôle d\'accès basé sur les rôles',
                hints: [
                    'Dans init : stocke l\'adresse de l\'admin',
                    'Dans grant_role : require_auth de l\'admin, stocke l\'appartenance au rôle pour l\'utilisateur',
                    'Dans revoke_role : require_auth de l\'admin, supprime l\'appartenance au rôle',
                    'Dans has_role : vérifie si la clé du rôle existe et est true',
                ],
            },
            ja: {
                title: '許可と役割',
                story: `# 🛡️ 階級制度を統治する...

Lightning Vault の向こうに立ちあがるのが**Role Hall**です。ここではアクセスが構造化された権限によって統治されます。

*「さまよう全ての者がすべてのドアにアクセスする運命にあるわけではない」* Role Masterは宣言します。*「役割が何ができるかを定義するシステムを構築しろ」*

## あなたの使命

ロールベースアクセス制御コントラクトを作成してください:
- \`grant_role\` — 管理者がユーザーにロールを付与
- \`revoke_role\` — 管理者がユーザーからロールを剥奪
- \`has_role\` — ユーザーが特定のロールを持っているかチェック
- \`get_admin\` — コントラクト管理者を返す

## これから学ぶこと

- ロールベースアクセス制御（RBAC）パターン
- 管理者のみ権限機能
- ロール所属の複合キー
- 柔軟な権限アーキテクチャ

## 重要なコンセプト

\`\`\`rust
// ロールを付与
let role_key = (user.clone(), role.clone());
env.storage().instance().set(&role_key, &true);

// ロール所属をチェック
env.storage().instance()
    .get(&(user.clone(), role.clone()))
    .unwrap_or(false)
\`\`\``,
                learningGoal: 'ロールベースアクセスコントロールを実装し、ユーザーの役割に基づいて権限を管理する',
                hints: [
                    '各ユーザーに一つまたは複数のロールを割り当てることができます',
                    '管理者ロールは、すべての権限を持つべきです',
                    '権限チェックは、ユーザーのロールに基づいて行われます',
                ],
            },
```

---

## Mission 16: oracle-feed

**Location**: After the French (fr) section, before `template:`

**oldStr**:
```javascript
                learningGoal: 'Construis un oracle de prix on-chain avec des mises à jour de l\'admin',
                hints: [
                    'Dans update_price : require_auth de l\'admin, stocke le prix et la séquence',
                    'Dans get_price : recherche et renvoie le prix de l\'actif',
                    'Dans get_last_updated : renvoie la séquence stockée pour l\'actif',
                    'Dans get_all_assets : utilise un traqueur Vec<Symbol> similaire à event-emitter',
                ],
            },
```

**newStr**:
```javascript
                learningGoal: 'Construis un oracle de prix on-chain avec des mises à jour de l\'admin',
                hints: [
                    'Dans update_price : require_auth de l\'admin, stocke le prix et la séquence',
                    'Dans get_price : recherche et renvoie le prix de l\'actif',
                    'Dans get_last_updated : renvoie la séquence stockée pour l\'actif',
                    'Dans get_all_assets : utilise un traqueur Vec<Symbol> similaire à event-emitter',
                ],
            },
            ja: {
                title: '託宣の情報源',
                story: `# 📊 外の世界の知識を取り込む...\n\nProduction Systems 地区の頂頂に立つのが**Oracle Spire**です。ここではオフチェーンデータがブロックチェーンに入ります。\n\n*「スマートコントラクトはデータなしには盲目だ」* Oracle Sageは言います。*「オンチェーンとオフチェーンの世界の間に橋を構築しろ」*\n\n## あなたの使命\n\n価格オラクルコントラクトを作成してください:\n- \\`update_price\\` — 管理者がアセットペアの価格を更新\n- \\`get_price\\` — アセットペアの現在の価格を返す\n- \\`get_last_updated\\` — 価格が最後に更新された時刻を返す\n- \\`get_all_assets\\` — すべての追跡されたアセットペアを返す\n\n## これから学ぶこと\n\n- オラクルデータフィードパターン\n- 管理者のみの更新機能\n- タイムスタンプ/シーケンス追跡\n- Vec<Symbol>によるアセットペア管理\n\n## 重要なコンセプト\n\n\\`\\`\\`rust\n// メタデータ付きで価格を保存\npub fn update_price(env: Env, asset: Symbol, price: i128) {\n    admin.require_auth();\n    env.storage().instance().set(&asset, &price);\n    env.storage().instance()\n        .set(&(asset.clone(), TIMESTAMP), &env.ledger().sequence());\n}\n\\`\\`\\``,\n                learningGoal: 'オラクル統合を実装し、外部データソースの情報をスマートコントラクト内で使用する',\n                hints: [\n                    'オラクルデータは定期的に更新される必要があります',\n                    'データの信頼性を確保するため、複数のオラクルを使用することが推奨されます',\n                    '価格データなどのオラクル情報は、時間経過により変わる可能性があります',\n                ],\n            },
```

---

## Mission 17: governor-simple

**Location**: After the French (fr) section, before `template:`

**oldStr**:
```javascript
                learningGoal: 'Construis un système de gouvernance on-chain complet avec propositions et vote',
                hints: [
                    'Dans create_proposal : stocke la description, la date limite, les décomptes oui/non',
                    'Dans vote : vérifie que la proposition est active, enregistre le choix du votant, mets à jour les totaux',
                    'Dans execute : vérifie que la proposition est adoptée (oui > non), marque-la comme exécutée',
                ],
            },
```

**newStr**:
```javascript
                learningGoal: 'Construis un système de gouvernance on-chain complet avec propositions et vote',
                hints: [
                    'Dans create_proposal : stocke la description, la date limite, les décomptes oui/non',
                    'Dans vote : vérifie que la proposition est active, enregistre le choix du votant, mets à jour les totaux',
                    'Dans execute : vérifie que la proposition est adoptée (oui > non), marque-la comme exécutée',
                ],
            },
            ja: {
                title: '統治者の投票',\n                story: `# 🏛️ 集団の意思を決定する...\n\n最後の部屋が待っています — **Hall of Governance**。そこでは全ての王国の運命が集団の意思によって決定されます。\n\n*「最も素晴らしいスマートコントラクトはコミュニティが自分たち自身を統治できるようにする」* Grand Elderは宣言します。*「提案が投票を通じて法律になるシステムを構築しろ」*\n\n## あなたの使命\n\n提案と投票を持つガバナンスコントラクトを作成してください:\n- \\`create_proposal\\` — 説明と投票期間を持つ提案を作成\n- \\`vote\\` — アクティブな提案に投票（賛成/反対）\n- \\`execute\\` — 提案が可決された場合は実行\n- \\`get_proposal\\` — 提案の詳細を返す\n\n## これから学ぶこと\n\n- オンチェーンガバナンスメカニズム\n- 提案生命周期（作成 → 投票 → 実行）\n- Map<Address, bool>による投票集計\n- クォーラムと承認しきい値ロジック\n\n## 重要なコンセプト\n\n\\`\\`\\`rust\n// 提案ごとの投票を追跡\nlet mut votes: Map<Address, bool> = env.storage().instance()\n    .get(&VOTES)\n    .unwrap_or(Map::new(&env));\nvotes.set(&voter, &support);\n\n// 承認を数える\nlet yes_votes: u32 = /* 値がtrueの投票を数える */\nlet no_votes: u32 = /* 値がfalseの投票を数える */\n\\`\\`\\``,\n                learningGoal: '簡単なガバナンス投票メカニズムを実装し、提案に対する投票を追跡する',\n                hints: [\n                    '各提案には、賛成票と反対票を個別に追跡する必要があります',\n                    '提案ごとにユニークなIDを割り当てることが重要です',\n                    '投票の期限と結果を集計するロジックが必要です',\n                ],\n            },
```

---

## Mission 18: reentrancy-guard

**Location**: After the French (fr) section, before `template:`

**oldStr**:
```javascript
                learningGoal: 'Arregla una vulnerabilidad de reentrancia usando el patrón de guardia mutex',
                hints: [
                    'Añade una constante MUTEX: `const MUTEX: Symbol = symbol_short!("MUTEX");`',
                    'Al inicio de withdraw, verifica si mutex es true y haz panic si es así',
                    'Establece mutex a true antes de actualizar el saldo, false después',
                ],
```

**newStr**:
```javascript
                learningGoal: 'Arregla una vulnerabilidad de reentrancia usando el patrón de guardia mutex',
                hints: [
                    'Añade una constante MUTEX: `const MUTEX: Symbol = symbol_short!("MUTEX");`',
                    'Al inicio de withdraw, verifica si mutex es true y haz panic si es así',
                    'Establece mutex a true antes de actualizar el saldo, false después',
                ],
            },
            ja: {
                title: '再入防衛',
                story: `# 🛡️ 悪意ある循環を防ぐ...\n\nCitadel の下のさらに奥深くに**Vulnerability Forge**があります。ここでは壊れたコントラクトが修復されます。\n\n*「スマートコントラクトで最も危険な脆弱性は」* Security Sageは警告します。*「再入性だ。状態を保持しながら外部コードを呼び出すコントラクトは悪用される可能性がある」*\n\n## あなたの使命\n\n下の金庫コントラクトは再入性の脆弱性があります — 資金を送った**後に**残高を更新します。あなたの仕事は**ミューテックスガード**パターンを使用して修正することです:再入性を防ぐ真偽値フラグ。\n\n脆弱なコードにはの:\n- 資金を送った**前に**状態を更新する\\`withdraw\\`（バグ）\n- 再入性保護なし\n\n修正:\n1. \\`false\\`で初期化される\\`MUTEX\\`真偽値ストレージキーを追加\n2. \\`withdraw\\`の開始で\\`true\\`に設定\n3. \\`withdraw\\`の終了で\\`false\\`に戻す\n4. エントリで mutex をチェックし、ロックされていたらパニック\n\n## これから学ぶこと\n\n- 再入性脆弱性の識別\n- 防止のためのミューテックス/ガード パターン\n- Check-Effects-Interaction パターン\n- セキュリティファースト開発マインドセット\n\n## 重要なコンセプト\n\n\\`\\`\\`rust\n// ミューテックスガード パターン\nif env.storage().instance().get(&MUTEX).unwrap_or(false) {\n    panic!("Reentrancy detected");\n}\nenv.storage().instance().set(&MUTEX, &true);\n// ... 脆弱な操作 ...\nenv.storage().instance().set(&MUTEX, &false);\n\\`\\`\\``,\n                learningGoal: '再入攻撃を防ぐためのガード機構を実装し、関数の再入を制御する',\n                hints: [\n                    'ロック機構を使用して、関数の実行中に別の呼び出しを防ぐことができます',\n                    '関数の最後にロックを解放することが重要です',\n                    'チェック・エフェクト・インタラクションパターンに従うことで、セキュリティを向上させることができます',\n                ],
            },
```

---

## Mission 19: access-control-fix

**Location**: After the French (fr) section, before `template:`

**oldStr** (This is the final mission, so look for the French version):
```javascript
                learningGoal: 'Fixe les vulnérabilités de contrôle d\'accès en utilisant des modèles sécurisés',
                hints: [
                    'Vérifie l\'appelant en utilisant require_auth()',
                    'Utilise le pattern check-effects-interactions',
                    'Enregistre tous les événements importants',
                ],
            },
        },
        template: `#![no_std]...
```

**newStr**:
```javascript
                learningGoal: 'Fixe les vulnérabilités de contrôle d\'accès en utilisant des modèles sécurisés',
                hints: [
                    'Vérifie l\'appelant en utilisant require_auth()',
                    'Utilise le pattern check-effects-interactions',
                    'Enregistre tous les événements importants',
                ],
            },
            ja: {
                title: 'アクセス制御の修復',
                story: `# 🛡️ セキュリティの穴をふさぐ...\n\nあなたはセキュリティの最終試練に達しました。**Vulnerability Forge**ではアクセス制御の脆弱性が修復される必要があります。\n\n*「アクセス制御の欠陥は最も一般的にして最も危険な脆弱性だ」* Security Masterは言います。*「呼び出し元を確認し、権限をチェックし、セキュアなパターンに従うのだ」*\n\n## あなたの使命\n\nアクセス制御の脆弱性を特定し、セキュアなパターンを使用して修正してください:\n- 呼び出し元をチェック（require_auth）\n- 権限レベルを検証\n- 重要なアクションをイベントとして記録\n- 状態変更前にすべてのチェックを完了\n\n## これから学ぶこと\n\n- 実際のセキュリティ脆弱性の特定\n- セキュアな認可パターン\n- 監査とロギング\n- セキュリティベストプラクティス\n\n## 重要なコンセプト\n\n\\`\\`\\`rust\n// Check-Effects-Interactions パターン\n// 1. 呼び出し元をチェック\ncaller.require_auth();\n\n// 2. 権限を検証\nif !has_permission(caller) { panic!("Unauthorized"); }\n\n// 3. 状態を変更\nupdate_state();\n\n// 4. イベントをログ\nenv.events().publish(&topic, &data);\n\\`\\`\\``,\n                learningGoal: 'アクセス制御の脆弱性を特定し、セキュアなパターンを使用して修正する',\n                hints: [\n                    '呼び出し元を確認することで、不正なアクセスを防ぐことができます',\n                    'チェック・エフェクト・インタラクションパターンに従うことで、再入攻撃を防ぎます',\n                    'すべての重要なアクションはイベントとして記録し、監査可能にしてください',\n                ],
            },
        },
        template: `#![no_std]...
```

---

## How to Apply These Changes

1. Open `src/data/missions.js` in your editor
2. For each mission (3-19), locate the French (fr) closing section
3. Use the provided `oldStr` to find the exact location
4. Replace it with the provided `newStr` which includes both French and Japanese sections
5. Verify that the indentation and syntax are correct

All translations follow the established i18n pattern with:
- `title`: Japanese mission title
- `story`: Full narrative in Japanese
- `learningGoal`: Main learning objective
- `hints`: Array of helpful hints for completing the mission
