export const DEFAULT_THEORY_QUEST_LANG = 'en';

export interface TheoryQuestI18n {
  title: string;
  story: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export interface TheoryQuest {
  id: string;
  type: 'theory';
  chapter: number;
  order: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  xpReward: number;
  i18n: Record<string, Partial<TheoryQuestI18n>>;
}

export const theoryQuests: TheoryQuest[] = [
  {
    id: 'fund-account-model',
    type: 'theory',
    chapter: 1,
    order: 1,
    difficulty: 'beginner',
    xpReward: 80,
    i18n: {
      en: {
        title: 'Account Model',
        story: `# 🔐 Account Basics

Stellar accounts are the foundation behind every transaction. Before writing a contract, it helps to understand who is allowed to sign, hold balances, and authorize changes.

This quick check covers the basic model users and contracts rely on daily.`,
        question: 'Which statement best describes the Stellar account model?',
        options: [
          'Accounts are only wallets and cannot hold balances or sign transactions.',
          'Accounts can hold balances, use signing keys, and authorize operations such as payments or trustline changes.',
          'Accounts are automatically created by every contract and cannot be controlled by users.',
          'Accounts exist only on Soroban, not on the Stellar network itself.',
        ],
        correctAnswer: 'Accounts can hold balances, use signing keys, and authorize operations such as payments or trustline changes.',
        explanation: 'A Stellar account is the unit of identity and balance. It can hold XLM and assets, have authorization keys, and approve operations such as transactions or trustline updates.',
      },
      es: {
        title: 'Modelo de cuenta',
        story: `# 🔐 Fundamentos de la cuenta

Las cuentas de Stellar son la base de cada transacción. Antes de escribir un contrato, ayuda comprender quién puede firmar, mantener saldos y autorizar cambios.

Esta comprobación rápida cubre el modelo básico en el que confían usuarios y contratos a diario.`,
        question: '¿Qué afirmación describe mejor el modelo de cuentas de Stellar?',
        options: [
          'Las cuentas solo son wallets y no pueden tener saldos ni firmar transacciones.',
          'Las cuentas pueden mantener saldos, usar claves de firma y autorizar operaciones como pagos o cambios de trustline.',
          'Las cuentas se crean automáticamente en cada contrato y no pueden ser controladas por usuarios.',
          'Las cuentas existen solo en Soroban, no en la red Stellar.',
        ],
        correctAnswer: 'Las cuentas pueden mantener saldos, usar claves de firma y autorizar operaciones como pagos o cambios de trustline.',
        explanation: 'Una cuenta de Stellar es la unidad de identidad y saldo. Puede mantener XLM y activos, tener claves de autorización y aprobar operaciones como transacciones o cambios de trustline.',
      },
    },
  },
  {
    id: 'trustline-basics',
    type: 'theory',
    chapter: 1,
    order: 2,
    difficulty: 'beginner',
    xpReward: 90,
    i18n: {
      en: {
        title: 'Trustlines',
        story: `# 🤝 Asset Trustlines

Trustlines let an account opt into holding a specific asset issued by a counterparty. They are one of the core building blocks of Stellar's asset model and are common in token flows.`,
        question: 'What is the main purpose of a trustline?',
        options: [
          'To store contract code permanently on-chain.',
          'To let an account explicitly approve holding and transferring a specific asset.',
          'To replace the need for account signatures entirely.',
          'To allow a Soroban contract to skip authorization checks.',
        ],
        correctAnswer: 'To let an account explicitly approve holding and transferring a specific asset.',
        explanation: 'A trustline is an authorization entry between an account and an asset issuer. It allows the account to hold, receive, and send that asset under the issuer\'s rules.',
      },
      es: {
        title: 'Trustlines',
        story: `# 🤝 Trustlines de activos

Los trustlines permiten que una cuenta se adhiera a mantener un activo específico emitido por una contraparte. Son uno de los pilares del modelo de activos de Stellar y aparecen con frecuencia en flujos de tokens.`,
        question: '¿Cuál es la finalidad principal de un trustline?',
        options: [
          'Guardar código de contrato permanentemente en la cadena.',
          'Permitir que una cuenta apruebe explícitamente mantener y transferir un activo específico.',
          'Reemplazar por completo la necesidad de firmas de cuenta.',
          'Permitir que un contrato de Soroban omita comprobaciones de autorización.',
        ],
        correctAnswer: 'Permitir que una cuenta apruebe explícitamente mantener y transferir un activo específico.',
        explanation: 'Un trustline es una entrada de autorización entre una cuenta y un emisor de activos. Permite que la cuenta reciba, mantenga y envíe ese activo según las reglas del emisor.',
      },
    },
  },
  {
    id: 'fee-bump-overview',
    type: 'theory',
    chapter: 2,
    order: 1,
    difficulty: 'intermediate',
    xpReward: 100,
    i18n: {
      en: {
        title: 'Fee Bumping',
        story: `# ⚡ Fee Bump Basics

When a transaction is close to timing out or competing with other network traffic, fee bumping can help. It adjusts the fee strategy without changing the underlying intent of the original transaction.`,
        question: 'Why would a developer use fee bumping in Stellar?',
        options: [
          'To permanently replace the original transaction with a different one.',
          'To increase the priority of a transaction by paying a higher fee associated with a wrapper transaction.',
          'To remove the need for signatures from the original account.',
          'To encrypt all transaction data before it is sent to the network.',
        ],
        correctAnswer: 'To increase the priority of a transaction by paying a higher fee associated with a wrapper transaction.',
        explanation: 'Fee bumping wraps a transaction in a second transaction that pays a higher fee. This can help the underlying operation get mined or processed sooner without altering the original intent.',
      },
      es: {
        title: 'Fee bumping',
        story: `# ⚡ Fundamentos del fee bumping

Cuando una transacción está cerca de caducar o compite con otro tráfico de red, el fee bumping puede ayudar. Ajusta la estrategia de tarifa sin cambiar la intención subyacente de la transacción original.`,
        question: '¿Por qué usaría un desarrollador fee bumping en Stellar?',
        options: [
          'Para reemplazar permanentemente la transacción original por otra distinta.',
          'Para aumentar la prioridad de una transacción pagando una tarifa más alta asociada a una transacción envolvente.',
          'Para eliminar la necesidad de firmas de la cuenta original.',
          'Para cifrar todos los datos de la transacción antes de enviarlos a la red.',
        ],
        correctAnswer: 'Para aumentar la prioridad de una transacción pagando una tarifa más alta asociada a una transacción envolvente.',
        explanation: 'El fee bumping envuelve una transacción en otra segunda transacción que paga una tarifa más alta. Esto ayuda a que la operación subyacente se procese antes sin cambiar la intención original.',
      },
    },
  },
  {
    id: 'consensus-basics',
    type: 'theory',
    chapter: 2,
    order: 2,
    difficulty: 'intermediate',
    xpReward: 110,
    i18n: {
      en: {
        title: 'Consensus Basics',
        story: `# 🧭 Consensus in Stellar

Stellar's consensus protocol is designed to reach agreement among validators. The point is not to require every node to agree on everything, but to reach a quorum-based decision efficiently.`,
        question: 'What is the main role of consensus in Stellar?',
        options: [
          'To make every validator run the same contract bytecode in isolation.',
          'To let validators agree on a set of transactions and state changes accepted by the network.',
          'To create permanent private keys for all transactions.',
          'To prevent all users from submitting transactions at the same time.',
        ],
        correctAnswer: 'To let validators agree on a set of transactions and state changes accepted by the network.',
        explanation: 'Consensus is the process by which validators agree on which transactions and state changes are valid and should be accepted by the network, ensuring shared agreement without a proof-of-work design.',
      },
      es: {
        title: 'Fundamentos de consenso',
        story: `# 🧭 Consenso en Stellar

El protocolo de consenso de Stellar está diseñado para llegar a un acuerdo entre validadores. No se trata de que cada nodo esté de acuerdo en todo, sino de tomar una decisión basada en un quorum de forma eficiente.`,
        question: '¿Cuál es la función principal del consenso en Stellar?',
        options: [
          'Hacer que cada validador ejecute el mismo bytecode de contrato de forma aislada.',
          'Permitir que los validadores acuerden qué transacciones y cambios de estado acepta la red.',
          'Crear claves privadas permanentes para todas las transacciones.',
          'Impedir que todos los usuarios envíen transacciones al mismo tiempo.',
        ],
        correctAnswer: 'Permitir que los validadores acuerden qué transacciones y cambios de estado acepta la red.',
        explanation: 'El consenso es el proceso por el que los validadores acuerdan qué transacciones y cambios de estado son válidos y deben aceptarse por la red, asegurando acuerdo compartido sin un diseño de proof-of-work.',
      },
    },
  },
  {
    id: 'soroban-storage-scope',
    type: 'theory',
    chapter: 3,
    order: 1,
    difficulty: 'beginner',
    xpReward: 120,
    i18n: {
      en: {
        title: 'Storage & Scoping',
        story: `# 🗃️ Contract State Basics

Soroban contracts persist data through storage. The important idea is that state is scoped to the contract and must be managed carefully to support safe access patterns.`,
        question: 'Why is storage scoping important in a Soroban contract?',
        options: [
          'Because all data is shared globally and cannot be isolated by contract.',
          'Because it helps keep state organized and prevents accidental collisions or unauthorized access patterns.',
          'Because it removes the need to think about keys or data types.',
          'Because Soroban stores every value in the browser instead of on-chain.',
        ],
        correctAnswer: 'Because it helps keep state organized and prevents accidental collisions or unauthorized access patterns.',
        explanation: 'Storage in Soroban is scoped so a contract can maintain its own data keys and state without interfering with other contracts. This keeps state consistent and helps enforce access rules.',
      },
      es: {
        title: 'Almacenamiento y alcance',
        story: `# 🗃️ Fundamentos del estado del contrato

Los contratos de Soroban persisten datos mediante almacenamiento. La idea importante es que el estado está acotado al contrato y debe gestionarse con cuidado para mantener patrones de acceso seguros.`,
        question: '¿Por qué es importante el alcance del almacenamiento en un contrato de Soroban?',
        options: [
          'Porque todos los datos se comparten globalmente y no pueden aislarse por contrato.',
          'Porque ayuda a mantener el estado ordenado y evita colisiones accidentales o patrones de acceso no autorizados.',
          'Porque elimina la necesidad de pensar en claves o tipos de datos.',
          'Porque Soroban guarda cada valor en el navegador en lugar de on-chain.',
        ],
        correctAnswer: 'Porque ayuda a mantener el estado ordenado y evita colisiones accidentales o patrones de acceso no autorizados.',
        explanation: 'El almacenamiento en Soroban está acotado para que cada contrato mantenga sus propias claves y estado sin interferir con otros contratos. Esto mantiene la consistencia del estado y ayuda a reforzar reglas de acceso.',
      },
    },
  },
];

interface LocalizedTheoryQuest extends Partial<TheoryQuestI18n> {
  id: string;
  type: string;
  chapter: number;
  order: number;
  difficulty: string;
  xpReward: number;
}

export function localizeTheoryQuest(quest: TheoryQuest | null | undefined, lang: string = DEFAULT_THEORY_QUEST_LANG): LocalizedTheoryQuest | null | undefined {
  if (!quest) return quest;

  const { i18n, ...neutral } = quest;
  const locale = (i18n && (i18n[lang] || i18n[DEFAULT_THEORY_QUEST_LANG])) || {};
  const fallback = (i18n && i18n[DEFAULT_THEORY_QUEST_LANG]) || {};

  const pick = (field: keyof TheoryQuestI18n): unknown =>
    locale[field] != null
      ? locale[field]
      : fallback[field] != null
        ? fallback[field]
        : neutral[field as never];

  return {
    ...neutral,
    title: (pick('title') as string) || '',
    story: (pick('story') as string) || '',
    question: (pick('question') as string) || '',
    options: (pick('options') as string[]) || [],
    correctAnswer: (pick('correctAnswer') as string) || '',
    explanation: (pick('explanation') as string) || '',
  };
}

export function localizeTheoryQuests(list: TheoryQuest[] | null | undefined, lang: string = DEFAULT_THEORY_QUEST_LANG): LocalizedTheoryQuest[] {
  return (list || []).map((quest) => localizeTheoryQuest(quest, lang)).filter((q): q is LocalizedTheoryQuest => q !== null && q !== undefined);
}
