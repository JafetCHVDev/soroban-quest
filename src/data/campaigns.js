/* ==========================================
   Campaign Data — Thematic chapters with lore and progression
   ========================================== */

export const campaigns = [
    {
        id: 'awakening',
        title: 'The Awakening',
        chapterNumber: 1,
        description: 'Begin your journey as a Soroban Guardian, mastering the fundamentals of smart contract development.',
        lore: `# 🌌 The Awakening

You stand at the gates of the **Stellar Citadel**, a shimmering fortress orbiting the edge of known space. The ancient Guardians of Soroban have sensed your arrival through the cosmic ether.

*"Another seeker emerges from the void,"* whispers the Elder Guardian, their form materializing as pure starlight. *"The blockchain calls to those with the spark of creation. Will you answer?"*

## The First Trials

Your journey begins with the most fundamental rites of contract creation. You must prove your understanding of the Soroban language - the sacred tongue that binds code to the immutable ledger.

### Chapter 1: Foundation
- **The First Contract**: Forge your initial smart contract, a simple vessel for the "hello" protocol
- **Greetings Protocol**: Master communication across the stellar network, learning to send and receive structured messages

These trials will test your grasp of:
- Contract structure and attributes
- Data types and their cosmic representations
- Function signatures and return values

*"Complete these rites, and the Citadel's first gate shall open to you. The path of the Guardian awaits."*

— Elder Guardian of Soroban`,
        heroImage: '/images/campaigns/awakening.jpg', // Placeholder
        missionIds: ['hello-soroban', 'greetings-protocol'],
        requiredLevel: 1,
        xpReward: 250,
        estimatedTime: '30-45 minutes',
    },
    {
        id: 'vault-of-memory',
        title: 'Vault of Memory',
        chapterNumber: 2,
        description: 'Descend into the Vault of Memory and learn the sacred arts of persistent storage and state management.',
        lore: `# 🔐 The Vault of Memory

The first gate stands open. You descend deeper into the **Vault of Memory**, where the ancients stored wisdom that persists across the eons. Here, time itself seems to bend as data flows through crystalline matrices.

*"Memory is the soul of the contract,"* murmurs the Vault Keeper, their voice echoing through chambers of liquid data. *"Without persistence, your creations are but fleeting dreams in the cosmic wind."*

## The Memory Trials

Having mastered the basic rites of contract creation, you now face the deeper mysteries of state. The blockchain's true power lies not just in computation, but in the ability to remember, to persist, to evolve.

### Chapter 2: Persistence
- **The Counter Vault**: Learn to store and retrieve data that endures beyond a single transaction
- **Guardian Ledger**: Master the sacred ledgers that record the deeds of the Guardians

These trials will reveal:
- The storage APIs and their proper usage
- Key-value patterns for data organization
- Authorization and access control mechanisms

*"The vault holds many secrets. Some are treasures to claim, others are warnings etched in code. Choose wisely, Guardian."*

— Keeper of the Vault`,
        heroImage: '/images/campaigns/vault.jpg', // Placeholder
        missionIds: ['counter-vault', 'guardian-ledger'],
        requiredLevel: 2,
        xpReward: 400,
        estimatedTime: '45-60 minutes',
    },
    {
        id: 'alliance-of-signatures',
        title: 'Alliance of Signatures',
        chapterNumber: 3,
        description: 'Form alliances through multi-party contracts and collective decision-making in the complex web of stellar diplomacy.',
        lore: `# 🤝 The Alliance of Signatures

The Vault's wisdom now flows through you. You emerge into the **Grand Assembly**, where representatives from across the galaxy gather to forge agreements that shape the future of the network.

*"Alliances are the strongest contracts,"* proclaims the Assembly Speaker, their holographic form addressing the gathered Guardians. *"One voice may whisper, but many voices together can command the stars themselves."*

## The Alliance Trials

Your final trials test your mastery of complex interactions. No longer do you work alone - now you must create contracts that serve communities, that require consensus, that bind multiple parties to shared purpose.

### Chapter 3: Consensus
- **Token Forge**: Create transferable assets that can be minted, burned, and exchanged across the network
- **Time Lock**: Master temporal contracts that enforce waiting periods and scheduled executions
- **Multi-Party Pact**: Build binding agreements that require multiple signatures to activate

These trials will challenge you with:
- Multi-party authorization patterns
- Complex state machines and workflows
- Economic mechanisms and incentive design

*"The greatest contracts are not written in code alone, but in the trust they inspire. Build well, Guardian, for the galaxy watches."*

— Speaker of the Grand Assembly`,
        heroImage: '/images/campaigns/alliance.jpg', // Placeholder
        missionIds: ['token-forge', 'time-lock', 'multi-party-pact'],
        requiredLevel: 3,
        xpReward: 600,
        estimatedTime: '60-90 minutes',
    },
];
