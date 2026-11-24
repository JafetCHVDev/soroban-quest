/* ==========================================
   Simplified Chinese (zh-CN) mission content

   Kept in its own module (and its own build chunk, see manualChunks in
   vite.config.ts)
   so the shared missions chunk stays within the CI bundle budget.
   Merged into each mission's i18n['zh-CN'] in missions.js.
   Code blocks, Rust identifiers and Soroban SDK names are intentionally
   left untranslated.
   ========================================== */

export const missionsZhCN = {
    'hello-soroban': {
    title: '第一份合约',
    story: `# 觉醒

你站在**星辰城堡**的大门前，这座闪耀的要塞环绕着已知宇宙的边缘运行。Soroban 守护者们已经察觉到你的到来。

*"又一位求道者，"* 长老守护者低语道。*"若要证明你的价值，你必须锻造出你的第一份智能合约。"*

## 你的任务

创建你的第一个 Soroban 智能合约：一个简单的合约，其中的 \`hello\` 函数接收一个名字并返回一句问候。

## 你将学到

- \`#[contract]\` 和 \`#[contractimpl]\` 属性
- \`Env\` 类型，你通往区块链的大门
- 用于类字符串值的 \`Symbol\` 类型
- 如何返回 \`Vec<Symbol>\`

## 核心概念

\`\`\`rust
#[contract]          // Marks your struct as a contract
#[contractimpl]      // Contains the contract methods
Env                  // The execution environment
Symbol               // A small, efficient string type
\`\`\`

完成代码模板以通过所有检查。守护者们正在等待你的第一份合约。`,
    learningGoal: '创建你的第一个带有 hello 函数的 Soroban 智能合约',
    hints: [
        '从 `pub fn hello(env: Env, to: Symbol) -> Vec<Symbol>` 开始',
        '使用 `vec![]` 宏，并将 `&env` 作为第一个参数',
        '完整的返回语句：`vec![&env, symbol_short!("Hello"), to]`',
    ],
    },
    'greetings-protocol': {
    title: '问候协议',
    story: `# 📡 信号塔

第一道大门已经开启。你前往**信号塔**，在那里，消息如涟漪般传遍整个 Stellar 网络。

*"沟通就是力量，"* 塔楼守护者说道。*"你的合约必须学会管理数据：接收输入并返回结构化的响应。"*

## 你的任务

构建一个包含多个函数的合约：
- \`greet\`：接收一个名字并返回个性化的问候
- \`count_chars\`：接收一个字符串并以 u32 返回其长度

## 你将学到

- 在单个合约中编写多个函数
- 在 Soroban 中使用 \`String\` 类型
- 从函数返回不同的类型
- \`symbol_short!\` 宏

## 核心概念

\`\`\`rust
String              // Full string type in Soroban
symbol_short!()     // Create a Symbol from a short literal
u32                 // Unsigned 32-bit integer
\`\`\``,
    learningGoal: '构建一个具有不同返回类型的多函数合约',
    hints: [
        'greet 函数签名：`pub fn greet(env: Env, name: Symbol) -> Vec<Symbol>`',
        'count_chars 函数：`pub fn count_chars(env: Env, text: String) -> u32`',
        '使用 `text.len()` 获取字符串长度',
    ],
    },
    'counter-vault': {
    title: '计数器金库',
    story: `# 🔐 记忆金库

你下行进入**记忆金库**，古人在这里储存着跨越时间而长存的智慧。

*"没有记忆的合约，就像没有灵魂的生灵，"* 金库守护者喃喃道。*"学会存储与读取，学会记住。"*

## 你的任务

创建一个能持久保存其值的计数器合约：
- \`increment\`：将计数器加 1
- \`get_count\`：返回当前计数

## 你将学到

- 使用 \`env.storage().instance()\` 进行**持久化存储**
- 读取和写入状态
- 用作存储键的 \`Symbol\` 模式
- 使用 \`.unwrap_or()\` 设置默认值

## 核心概念

\`\`\`rust
env.storage().instance().set(&key, &value)  // Write
env.storage().instance().get(&key)          // Read (returns Option)
.unwrap_or(default)                         // Default if None
\`\`\``,
    learningGoal: '使用持久化存储创建一个有状态的计数器合约',
    hints: [
        '使用 `env.storage().instance().get(&COUNTER)` 读取计数',
        '使用 `.unwrap_or(0)` 在没有值时默认为 0',
        '使用 `env.storage().instance().set(&COUNTER, &new_count)` 保存新的计数',
    ],
    },
    'guardian-ledger': {
    title: '守护者账本',
    story: `# 📋 守护者账本

议会大厅闪耀着古老的光芒。你面前是**守护者账本**，记录着所有已证明自己的人。

*"若要守护这片领域，你必须控制谁可以行动，"* 议会领袖宣告道。*"学习访问控制之道吧。"*

## 你的任务

构建一个带有访问控制的登记合约：
- \`register\`：登记一位新的守护者（保存其名字）
- \`get_guardian\`：根据地址获取守护者的名字
- 一个在初始化时设置的 \`admin\` 地址

## 你将学到

- 用于用户身份的 \`Address\` 类型
- 用于访问控制的 \`require_auth()\`
- 使用 \`Map\` 类型处理键值对
- 合约初始化模式

## 核心概念

\`\`\`rust
Address                     // Represents an account/identity
address.require_auth()      // Ensures the caller is authorized
Map<Address, Symbol>        // Key-value mapping
\`\`\``,
    learningGoal: '使用 Address 和 require_auth 实现访问控制',
    hints: [
        'init 函数保存管理员：`env.storage().instance().set(&ADMIN, &admin)`',
        '在 register 中，存储之前先调用 `who.require_auth()`',
        '使用以下方式存储：`env.storage().instance().set(&who, &name)`',
    ],
    },
    'token-forge': {
    title: '代币熔炉',
    story: `# ⚒️ 代币熔炉

城堡深处坐落着**代币熔炉**，数字资产在这里由纯粹的逻辑铸造而成。

*"货币是任何经济的命脉，"* 熔炉大师说道。*"你将创造一种可以在账户之间转移的代币。"*

## 你的任务

创建一个简单的代币合约：
- \`mint\`：为某个地址铸造代币（仅限管理员）
- \`balance\`：返回某个地址的余额
- \`transfer\`：将代币从一个地址转移到另一个地址

## 你将学到

- 代币余额管理
- 带授权的转账逻辑
- 仅限管理员的函数
- 余额的整数运算

## 核心概念

\`\`\`rust
// Admin check pattern
admin.require_auth();

// Balance management
let bal: i128 = env.storage().persistent().get(&from).unwrap_or(0);
\`\`\``,
    learningGoal: '构建一个具有铸造、余额和转账功能的基础代币',
    hints: [
        'mint：从存储中读取 admin，调用 admin.require_auth()，然后更新余额',
        'balance：`env.storage().persistent().get(&account).unwrap_or(0)`',
        'transfer：要求发送方授权（require_auth），读取双方余额并同时更新',
    ],
    },
    'time-lock': {
    title: '时间锁',
    story: `# ⏳ 时空之门

**时空之门**矗立在你面前，它的机关随着账本的节奏滴答作响。

*"时间是一种武器，"* 时空守护者说道。*"学会依据区块的流逝来锁定与解锁。"*

## 你的任务

创建一个时间锁金库：
- \`lock\`：锁定代币，直到指定的账本序列号
- \`unlock\`：如果锁定期已过，则释放代币
- \`get_lock_info\`：返回锁定何时到期

## 你将学到

- 使用账本序列号 / 时间戳实现基于时间的逻辑
- 基于区块链状态的条件执行
- 使用 \`env.ledger().sequence()\` 获取当前区块
- 用于错误处理的 panic 模式

## 核心概念

\`\`\`rust
env.ledger().sequence()  // Current ledger sequence number
panic!("message")        // Abort with error
\`\`\``,
    learningGoal: '使用账本序列号实现基于时间的条件逻辑',
    hints: [
        '使用 `env.ledger().sequence()` 获取当前账本编号',
        '比较：`if current_seq < unlock_at { panic!("Still locked"); }`',
        '解锁后清除存储：`env.storage().instance().remove(&key)`',
    ],
    },
    'multi-party-pact': {
    title: '多方契约',
    story: `# 🤝 契约大厅

你已抵达**契约大厅**，这是你在守护者中赢得一席之地前的最后挑战。

*"智能合约真正的力量，"* 大长老宣告道，*"在于让陌生人之间也能建立信任。"*

## 你的任务

创建一个多签名协议合约：
- \`create_pact\`：创建一个需要 N 个签名的协议
- \`sign_pact\`：允许一方签署协议
- \`is_complete\`：检查是否已收集到所有必需的签名
- \`get_signers\`：返回已签名的人

## 你将学到

- 合约中的复杂数据结构
- 多方授权
- 使用存储进行计数和追踪
- 构建真实世界的治理模式

## 核心概念

\`\`\`rust
// Track signer count
let count: u32 = env.storage().instance()
    .get(&SIGNER_COUNT).unwrap_or(0);

// Store with dynamic keys
env.storage().instance().set(&signer_key, &true);
\`\`\``,
    learningGoal: '构建一个具有复杂状态管理的多签名契约合约',
    hints: [
        '在 create_pact 中：保存描述、所需数量，以及初始为 0 的已签名数量',
        '在 sign_pact 中：读取当前计数，加 1，再存回去',
        '在 is_complete 中：比较 signed >= required',
    ],
    },
    'vault-manager': {
    title: '金库管理器',
    story: `# 🏦 数据要塞

在契约大厅之外坐落着**数据要塞**，无数用户的余额都在这里被保存和保护。

*"管理一个余额微不足道，"* 金库建筑师说道。*"管理众多余额，才是存储架构的艺术。"*

## 你的任务

构建一个管理多个用户余额的金库合约：
- \`deposit\`：向用户余额中存入资金（用户必须授权）
- \`withdraw\`：从用户余额中取出资金（用户必须授权）
- \`get_balance\`：返回用户当前的余额

## 你将学到

- 用于多用户状态的 \`Map<Address, i128>\`
- 用于逐个用户授权的 \`Env::require_auth()\`
- 使用复杂键的持久化存储
- 安全的算术模式

## 核心概念

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
    learningGoal: '使用 Map 存储模式构建一个多用户金库',
    hints: [
        '使用 Map<Address, i128> 保存用户余额',
        '修改用户余额之前先调用 user.require_auth()',
        '使用 .unwrap_or(Map::new(&env)) 从存储中读取 Map',
        'deposit：获取当前余额，加上金额，再写回',
    ],
    },
    'event-emitter': {
    title: '事件发射器',
    story: `# 📡 信号灯塔

数据要塞的顶端矗立着**信号灯塔**，向整个 Stellar 网络广播事件。

*"会说话的合约，才是被理解的合约，"* 灯塔守护者说道。*"事件让世界知道发生了什么。"*

## 你的任务

创建一个存储键值数据、并为每次状态变更发布事件的合约：
- \`set_value\`：保存一个值，并发布包含键和值的事件
- \`get_value\`：根据键获取已保存的值
- \`get_all_keys\`：返回所有已保存的键

## 你将学到

- 使用 \`env.events().publish()\` 发布事件
- 使用 \`Vec<Symbol>\` 动态追踪键
- 事件驱动的合约架构
- Stellar 上的发布-订阅模式

## 核心概念

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
    learningGoal: '在键值存储合约中实现事件发布',
    hints: [
        '使用 env.events().publish()，传入一个主题 Symbol 和事件数据',
        '使用 Vec<Symbol> 追踪所有已存储的键',
        '使用 keys.push_back(key) 添加新键',
    ],
    },
    'approval-manager': {
    title: '授权管理器',
    story: `# ✋ 委托之厅

数据要塞之中坐落着**委托之厅**，信任在这里通过授权额度被正式确立。

*"你不可能事事亲力亲为，"* 委托大师解释道。*"有时你必须授权他人代你行事。"*

## 你的任务

构建一个允许用户授权他人代其支出的合约：
- \`approve\`：所有者授权某个支出者使用指定金额
- \`transfer_from\`：支出者从所有者处转账给接收者
- \`allowance\`：查询某个支出者被授权的支出额度

## 你将学到

- 嵌套的键值模式（owner -> spender -> allowance）
- 委托授权
- 双地址存储键
- 授权额度扣减模式

## 核心概念

\`\`\`rust
// Compound storage key for allowances
let allowance_key = (owner.clone(), spender.clone());
env.storage().instance().set(&allowance_key, &amount);

// Read nested allowance
env.storage().instance().get(&(owner, spender))
    .unwrap_or(0)
\`\`\``,
    learningGoal: '实现额度授权与委托转账系统',
    hints: [
        '使用元组 (Address, Address) 作为复合存储键',
        '在 approve 中：为 (owner, spender) 这一对保存授权额度',
        '在 transfer_from 中：要求 spender 授权，检查额度，扣减额度，更新余额',
    ],
    },
    'crowdfund': {
    title: '众筹活动',
    story: `# 🎯 众铸竞技场

你走进**众铸竞技场**，集体的力量在这里让创意成为现实。

*"独自一人，你已强大，"* 拍卖师宣布道。*"齐心协力，你们能撼动群星。构建一个大众可以资助的活动吧。"*

## 你的任务

创建一个众筹合约：
- \`init\`：设置筹款目标和截止时间（账本序列号）
- \`contribute\`：添加来自贡献者的资金
- \`check_goal\`：如果贡献总额 >= 目标，则返回 true
- \`get_total_raised\`：返回已筹集的资金总额

## 你将学到

- 使用账本序列号实现基于时间的截止期限
- 类似托管的资金累积
- 通过条件检查追踪目标
- 多贡献者的状态管理

## 核心概念

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
    learningGoal: '构建一个追踪目标和截止时间的众筹合约',
    hints: [
        '在 init 中：保存目标金额和截止账本序列号',
        '在 contribute 中：检查截止时间未过，将金额加到总额中',
        '在 check_goal 中：比较已筹集总额与目标',
    ],
    },
    'escrow-agent': {
    title: '托管代理',
    story: `# 🤲 信任交易所

众铸竞技场深处坐落着**信任交易所**，陌生人之间的交易在这里得到调解。

*"信任是最稀有的货币，"* 托管调解人说道。*"构建一个在条件满足之前一直保管价值的系统。"*

## 你的任务

创建一个包含买方、卖方和仲裁者的托管合约：
- \`init\`：使用买方、卖方和仲裁者的地址设置托管
- \`deposit\`：买方将资金存入托管
- \`release\`：仲裁者将资金释放给卖方
- \`refund\`：仲裁者将资金退还给买方

## 你将学到

- 多方合约初始化
- 三方授权模式
- 托管生命周期的状态机
- 争议解决模式

## 核心概念

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
    learningGoal: '实现一个具有争议解决机制的多方托管合约',
    hints: [
        '在 init 中：保存买方、卖方和仲裁者的地址',
        '在 deposit 中：要求买方授权并保存金额',
        '在 release 中：要求仲裁者授权，将资金转给卖方',
        '在 refund 中：要求仲裁者授权，将资金退还给买方',
    ],
    },
    'subscription': {
    title: '订阅管理器',
    story: `# 🔄 循环引擎

在高级协议区的中心，**循环引擎**嗡嗡运转，驱动着自动化的周期性协议。

*"最强大的合约，是那些无需时刻照看也能运行的合约，"* 引擎看护者说道。*"构建一个能收取定期付款的订阅吧。"*

## 你的任务

创建一个订阅管理合约：
- \`subscribe\`：用户订阅某个套餐（保存套餐和下次计费时间）
- \`collect\`：如果计费已到期，则收取订阅费用
- \`cancel\`：取消订阅
- \`get_subscription\`：返回某个用户的订阅信息

## 你将学到

- 使用账本序列号实现定期计费逻辑
- 订阅状态管理
- 取消与退款模式
- 时间间隔计算

## 核心概念

\`\`\`rust
// Track subscription period
let interval: u32 = 1000; // billing every ~1000 ledgers
let next_billing: u32 = env.ledger().sequence() + interval;

// Check if billing is due
if env.ledger().sequence() >= next_billing {
    // collect payment
}
\`\`\``,
    learningGoal: '构建一个按周期计费的定期订阅合约',
    hints: [
        '在 subscribe 中：保存套餐，并将 next_billing 设为当前序列号 + 间隔',
        '在 collect 中：检查当前序列号是否 >= next_billing，若是则收费并更新 next_billing',
        '在 cancel 中：从存储中清除订阅数据',
    ],
    },
    'flash-loan': {
    title: '闪电贷资金池',
    story: `# ⚡ 闪电金库

城堡最深处坐落着**闪电金库**，资本在这里以光速流动。

*"闪电贷是对合约设计的终极考验，"* 闪电执政官说道。*"在一笔交易中完成借款、使用和还款。"*

## 你的任务

构建一个简化的闪电贷资金池：
- \`init\`：设置资金池余额
- \`flash_loan\`：从资金池借款（必须在本次调用内还款）
- \`get_pool_balance\`：返回当前资金池余额
- \`repay\`：偿还借款金额外加少量手续费

## 你将学到

- 闪电贷机制（为便于验证而简化）
- 资金池余额管理
- 贷款生命周期追踪
- 还款时收取手续费的模式

## 核心概念

\`\`\`rust
// Track active loan
let loan: i128 = env.storage().instance()
    .get(&(borrower.clone(), LOAN_AMOUNT))
    .unwrap_or(0);

// Repay with fee
let fee = amount / 100; // 1% fee
env.storage().instance().set(&POOL, &(pool_bal + amount + fee));
\`\`\``,
    learningGoal: '构建一个简化的闪电贷资金池合约',
    hints: [
        '在 init 中：保存资金池的初始余额',
        '在 flash_loan 中：检查资金池余额是否充足，从资金池中扣除，并记录贷款',
        '在 repay 中：检查贷款是否存在，将资金连同手续费一起还回资金池，并清除贷款',
    ],
    },
    'permissions-rbac': {
    title: '权限 RBAC',
    story: `# 🛡️ 角色殿堂

闪电金库之外耸立着**角色殿堂**，这里的访问由结构化的权限来管理。

*"并非每个漫游者都能打开每一扇门，"* 角色大师宣告道。*"构建一个由角色决定能做什么的系统。"*

## 你的任务

创建一个基于角色的访问控制合约：
- \`grant_role\`：管理员向用户授予角色
- \`revoke_role\`：管理员撤销用户的角色
- \`has_role\`：检查用户是否拥有特定角色
- \`get_admin\`：返回合约管理员

## 你将学到

- 基于角色的访问控制（RBAC）模式
- 仅限管理员的特权函数
- 用于角色成员关系的复合键
- 灵活的权限架构

## 核心概念

\`\`\`rust
// Grant a role
let role_key = (user.clone(), role.clone());
env.storage().instance().set(&role_key, &true);

// Check role membership
env.storage().instance()
    .get(&(user.clone(), role.clone()))
    .unwrap_or(false)
\`\`\``,
    learningGoal: '实现基于角色的访问控制合约',
    hints: [
        '在 init 中：保存管理员地址',
        '在 grant_role 中：要求管理员授权，为用户保存角色成员关系',
        '在 revoke_role 中：要求管理员授权，移除角色成员关系',
        '在 has_role 中：检查角色键是否存在且为 true',
    ],
    },
    'oracle-feed': {
    title: '预言机数据源',
    story: `# 📊 预言机尖塔

在生产系统区的顶峰矗立着**预言机尖塔**，链下数据从这里进入区块链。

*"没有数据，智能合约就是盲目的，"* 预言机贤者说道。*"在链上与链下世界之间架起一座桥梁吧。"*

## 你的任务

创建一个价格预言机合约：
- \`update_price\`：管理员更新某个资产对的价格
- \`get_price\`：返回某个资产对的当前价格
- \`get_last_updated\`：返回价格最后一次更新的时间
- \`get_all_assets\`：返回所有被追踪的资产对

## 你将学到

- 预言机数据源模式
- 仅限管理员的更新函数
- 时间戳 / 序列号追踪
- 使用 Vec<Symbol> 管理资产对

## 核心概念

\`\`\`rust
// Store price with metadata
pub fn update_price(env: Env, asset: Symbol, price: i128) {
    admin.require_auth();
    env.storage().instance().set(&asset, &price);
    env.storage().instance()
        .set(&(asset.clone(), TIMESTAMP), &env.ledger().sequence());
}
\`\`\``,
    learningGoal: '构建一个由管理员更新的链上价格预言机',
    hints: [
        '在 update_price 中：要求管理员授权，保存价格和序列号',
        '在 get_price 中：查找并返回该资产的价格',
        '在 get_last_updated 中：返回该资产已保存的序列号',
        '在 get_all_assets 中：使用类似 event-emitter 的 Vec<Symbol> 追踪器',
    ],
    },
    'governor-simple': {
    title: '简易治理器',
    story: `# 🏛️ 治理大厅

最后的殿堂正在等待：**治理大厅**，整个领域的命运在这里由集体意志决定。

*"最伟大的智能合约，能让社区实现自我治理，"* 大长老宣告道。*"构建一个让提案通过投票成为法律的系统。"*

## 你的任务

创建一个包含提案与投票的治理合约：
- \`create_proposal\`：创建一个带有描述和投票期的提案
- \`vote\`：对活跃的提案投票（赞成/反对）
- \`execute\`：如果提案通过则执行
- \`get_proposal\`：返回提案详情

## 你将学到

- 链上治理机制
- 提案生命周期（创建 → 投票 → 执行）
- 使用 Map<Address, bool> 计票
- 法定人数与通过门槛逻辑

## 核心概念

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
    learningGoal: '构建一个包含提案与投票的完整链上治理系统',
    hints: [
        '在 create_proposal 中：保存描述、截止时间，以及赞成/反对票数',
        '在 vote 中：检查提案处于活跃状态，记录投票者的选择，更新计票',
        '在 execute 中：检查提案是否通过（yes > no），并将其标记为已执行',
    ],
    },
    'reentrancy-guard': {
    title: '重入防护',
    story: `# 🛡️ 漏洞熔炉

城堡深处坐落着**漏洞熔炉**，破损的合约在这里被修复完整。

*"智能合约中最危险的漏洞，"* 安全贤者警告道，*"就是重入。一个在持有状态时调用外部代码的合约可能会被利用。"*

## 你的任务

下面的金库合约存在重入漏洞：它在发送资金之后才更新余额。你的工作是使用**互斥锁防护**模式修复它：用一个布尔标志来阻止重入。

这段有漏洞的代码包含：
- 在更新状态之前就发送资金的 \`withdraw\`（这就是漏洞）
- 没有任何重入防护

修复方法：
1. 添加一个初始化为 \`false\` 的 \`MUTEX\` 布尔存储键
2. 在 \`withdraw\` 开头将其设为 \`true\`
3. 在 \`withdraw\` 结尾将其设回 \`false\`
4. 在入口处检查互斥锁，如果已被锁定则 panic

## 你将学到

- 识别重入漏洞
- 用于防范的互斥锁/防护模式
- 检查-生效-交互（Check-effects-interaction）模式
- 安全优先的开发思维

## 核心概念

\`\`\`rust
// Mutex guard pattern
if env.storage().instance().get(&MUTEX).unwrap_or(false) {
    panic!("Reentrancy detected");
}
env.storage().instance().set(&MUTEX, &true);
// ... vulnerable operations ...
env.storage().instance().set(&MUTEX, &false);
\`\`\``,
    learningGoal: '使用互斥锁防护模式修复重入漏洞',
    hints: [
        '添加一个 MUTEX 常量：`const MUTEX: Symbol = symbol_short!("MUTEX");`',
        '在 withdraw 开头检查互斥锁是否为 true，若是则 panic',
        '在更新余额之前将互斥锁设为 true，之后设为 false',
    ],
    },
    'access-control-fix': {
    title: '访问控制修复',
    story: `# 🔓 权限漏洞

**权限漏洞**是一个训练场，破损的授权逻辑在这里得到修复。

*"第二常见的漏洞，"* 安全贤者解释道，*"是缺失访问控制。本应仅限管理员调用的函数，任何人都能调用。"*

## 你的任务

下面的合约保存了一个 \`admin\` 地址，但从未在特权函数上使用 \`require_auth()\`。你的工作是添加正确的访问控制。

这段有漏洞的代码包含：
- 一个已定义但从未被检查的 \`ADMIN\` 常量
- 任何人都能调用的 \`set_fee\` 和 \`pause\` 函数
- 任何地方都没有 \`require_auth()\` 调用

修复方法：
1. 在 \`set_fee\` 和 \`pause\` 上添加 \`require_auth()\` 检查
2. 在检查授权之前，从存储中读取管理员地址

## 你将学到

- 识别访问控制漏洞
- 正确放置 \`require_auth()\`
- 仅限管理员的函数模式
- 纵深防御原则

## 核心概念

\`\`\`rust
// Correct access control
let admin: Address = env.storage().instance().get(&ADMIN).unwrap();
admin.require_auth();

// Now perform privileged operation
env.storage().instance().set(&FEE, &new_fee);
\`\`\``,
    learningGoal: '通过添加 require_auth() 检查来修复缺失的访问控制',
    hints: [
        '在 set_fee 中：从存储中读取 ADMIN，调用 admin.require_auth()',
        '在 pause 中：从存储中读取 ADMIN，调用 admin.require_auth()',
        'init 函数没有问题，它已经正确地保存了管理员',
    ],
    },
    'standalone-storage-dojo': {
    title: '存储道场',
    story: `# 🥋 存储道场

欢迎来到**存储道场**，这是战役路线之外一座安静的训练馆。

*"在掌握复杂协议之前，先把基础练到成为本能，"* 道场大师说道。

## 你的任务

构建一个最小化的存储合约，能够保存并读取一个值：

- \`set_value\`：在固定的键下保存一个 \`u32\`
- \`get_value\`：读取已保存的值（为空时默认为 \`0\`）

## 你将学到

- \`env.storage().instance().set(&key, &value)\`：写入
- \`env.storage().instance().get(&key).unwrap_or(0)\`：带默认值读取
- 用于存储键的 \`symbol_short!\` 宏

## 核心概念

\`\`\`rust
const VALUE: Symbol = symbol_short!("VALUE");
env.storage().instance().set(&VALUE, &value);
env.storage().instance().get(&VALUE).unwrap_or(0)
\`\`\``,
    learningGoal: '练习基础的实例存储：设置并读取一个 u32 值',
    hints: [
        '在顶部定义 `const VALUE: Symbol = symbol_short!("VALUE");`',
        '在 set_value 中：`env.storage().instance().set(&VALUE, &value)`',
        '在 get_value 中：`env.storage().instance().get(&VALUE).unwrap_or(0)`',
    ],
    },
    'standalone-auth-guard': {
    title: '授权防护演练',
    story: `# 🛡️ 授权防护演练

走进**守卫哨所**，这是一项独立的授权演练。

*"每一次状态变更，都必须证明是谁发起的，"* 守卫队长警告道。

## 你的任务

构建一个用 \`require_auth\` 保护特权操作的合约：

- \`init\`：保存一个管理员地址
- \`protected_action\`：要求调用者授权，并将 \`DONE\` 标志设为 \`true\`
- \`is_done\`：返回该标志是否已设置

## 你将学到

- 用于身份的 \`Address\` 类型
- \`address.require_auth()\` 防护
- 保存和检查布尔标志

## 核心概念

\`\`\`rust
let admin: Address = env.storage().instance().get(&ADMIN).unwrap();
admin.require_auth();
env.storage().instance().set(&DONE, &true);
\`\`\``,
    learningGoal: '练习使用 require_auth 保护状态变更',
    hints: [
        '在 init 中保存管理员：`env.storage().instance().set(&ADMIN, &admin)`',
        '在 protected_action 中：使用 `user.require_auth()` 检查调用者授权',
        '设置标志：`env.storage().instance().set(&DONE, &true)`',
    ],
    },
    'standalone-vector-lab': {
    title: '向量实验室',
    story: `# 🧪 向量实验室

走进**向量实验室**，这是一间专为 Soroban 最灵活的集合类型而设的动手工坊。

*"向量容纳众多，排列众多，返回众多，"* 实验室技师说道。

## 你的任务

创建一个构建并检查向量的合约：

- \`make_sequence\`：返回一个包含 \`[1, 2, 3]\` 的 \`Vec<u32>\`
- \`get_length\`：接收一个 \`Vec<u32>\` 并以 \`u32\` 返回其长度

## 你将学到

- \`Vec\` 类型和 \`vec![&env, ...]\` 宏
- 使用 \`Vec::len()\` 获取长度
- 在函数之间传递向量

## 核心概念

\`\`\`rust
use soroban_sdk::{vec, Vec};
vec![&env, 1u32, 2u32, 3u32]
vals.len()
\`\`\``,
    learningGoal: '练习创建和检查 Vec<u32> 集合',
    hints: [
        '使用 `vec![&env, 1u32, 2u32, 3u32]` 构建序列',
        'get_length 的签名：`pub fn get_length(env: Env, vals: Vec<u32>) -> u32`',
        '使用 `vals.len()` 返回长度',
    ],
    },
};
