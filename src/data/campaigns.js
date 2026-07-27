/* ==========================================
   Campaign System — Grouped mission chapters
   with lore, progression gates, hero images

   Phase 3 (i18n): Language-neutral fields (id, heroImage,
   chapterNumber, missionIds, requiredLevel, color) live at the top
   level. Localizable fields (title, description, lore) live under
   `i18n[locale]`. Use `localizeCampaign(campaign, lang)` to get a
   flat, render-ready object.
   ========================================== */

//import { missions } from './missions.js';

export const DEFAULT_CAMPAIGN_LANG = 'en';

export const campaigns = [
  {
    id: 'chapter-1-awakening',
    i18n: {
      en: {
        title: 'Chapter 1: The Awakening',
        description: 'Master your first Soroban contracts. Forge your path as a Stellar Guardian.',
        lore: `# 🌌 Chapter 1: The Awakening

You stand at the gates of the **Stellar Citadel**, orbiting the edge of known space. The ancient **Guardians of Soroban** have sensed your arrival.

*"Another seeker,"* whispers the Elder Guardian. *"The blockchain calls to those with the code to answer."*

## Your Destiny Awaits

Complete these foundational contracts to unlock **Chapter 2: Vault of Memory**.

**0/2 missions** • **Level 1 required**`,
      },
      es: {
        title: 'Capítulo 1: El Despertar',
        description: 'Domina tus primeros contratos de Soroban. Forja tu camino como Guardián Estelar.',
        lore: `# 🌌 Capítulo 1: El Despertar

Te encuentras ante las puertas de la **Ciudadela Estelar**, orbitando el confín del espacio conocido. Los antiguos **Guardianes de Soroban** han percibido tu llegada.

*"Otro buscador,"* susurra el Guardián Anciano. *"La blockchain llama a quienes tienen el código para responder."*

## Tu Destino Aguarda

Completa estos contratos fundamentales para desbloquear el **Capítulo 2: Bóveda de la Memoria**.

**0/2 misiones** • **Nivel 1 requerido**`,
      },
    },
    heroImage: 'linear-gradient(135deg, #06d6a0 0%, #8b5cf6 50%, #f59e0b 100%)',
    chapterNumber: 1,
    missionIds: ['hello-soroban', 'greetings-protocol'],
    requiredLevel: 1,
    color: 'cyan'
  },
  {
    id: 'chapter-2-memory',
    i18n: {
      en: {
        title: 'Chapter 2: Vault of Memory',
        description: 'Unlock persistent storage and access control. Memory defines true power.',
        lore: `# 🔐 Chapter 2: Vault of Memory

The **Signal Tower** fades behind you. You descend into the **Vault of Memory**, where ancient wisdom persists across eons.

*"A contract without memory is a fleeting thought,"* murmurs the Vault Keeper. *"To endure, you must store and protect."*

## The Second Trial

Master state management to access **Chapter 3: Token Forge**.

**0/2 missions** • **Level 3 required**`,
      },
      es: {
        title: 'Capítulo 2: Bóveda de la Memoria',
        description: 'Desbloquea el almacenamiento persistente y el control de acceso. La memoria define el verdadero poder.',
        lore: `# 🔐 Capítulo 2: Bóveda de la Memoria

La **Torre de Señales** se desvanece tras de ti. Desciendes a la **Bóveda de la Memoria**, donde la sabiduría ancestral perdura a través de eones.

*"Un contrato sin memoria es un pensamiento fugaz,"* murmura el Guardián de la Bóveda. *"Para perdurar, debes almacenar y proteger."*

## La Segunda Prueba

Domina la gestión de estado para acceder al **Capítulo 3: Forja de Tokens**.

**0/2 misiones** • **Nivel 3 requerido**`,
      },
    },
    heroImage: 'linear-gradient(135deg, #8b5cf6 0%, #f59e0b 50%, #ef4444 100%)',
    chapterNumber: 2,
    missionIds: ['counter-vault', 'guardian-ledger'],
    requiredLevel: 3,
    color: 'purple'
  },
  {
    id: 'chapter-3-forge',
    i18n: {
      en: {
        title: 'Chapter 3: Token Forge',
        description: 'Mint tokens, master time-locks, govern with multi-sig. Become the Master Guardian.',
        lore: `# ⚒️ Chapter 3: Token Forge

The **Chrono Gate** hums with power. You enter the **Token Forge** — heart of the Stellar economy.

*"True mastery creates value that endures,"* declares the Forgemaster. *"Tokens, time, trust — forge them all."*

## Final Challenge

Complete the Token Forge to earn **Legendary Guardian** status.

**0/3 missions** • **Level 5 required**`,
      },
      es: {
        title: 'Capítulo 3: Forja de Tokens',
        description: 'Acuña tokens, domina los cerrojos temporales, gobierna con multifirma. Conviértete en Guardián Maestro.',
        lore: `# ⚒️ Capítulo 3: Forja de Tokens

La **Puerta del Tiempo** vibra con poder. Entras en la **Forja de Tokens** — el corazón de la economía Stellar.

*"La verdadera maestría crea valor que perdura,"* declara el Maestro Forjador. *"Tokens, tiempo, confianza — fórjalos todos."*

## Desafío Final

Completa la Forja de Tokens para obtener el estatus de **Guardián Legendario**.

**0/3 misiones** • **Nivel 5 requerido**`,
      },
    },
    heroImage: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 50%, #06d6a0 100%)',
    chapterNumber: 3,
    missionIds: ['token-forge', 'time-lock', 'multi-party-pact'],
    requiredLevel: 5,
    color: 'gold'
  },
  {
    id: 'chapter-4-data',
    i18n: {
      en: {
        title: 'Chapter 4: Data Fortress',
        description: 'Master complex state management with Maps, events, and delegated approvals.',
        lore: `# 🏦 Chapter 4: Data Fortress

Beyond the Hall of Pacts, you discover the **Data Fortress** — a vast repository where sophisticated state is engineered.

*"Data is the foundation of all great contracts,"* declares the Architect. *"Learn to manage multi-user state, emit events, and delegate authority."*

## The Fourth Trial

Build data-driven contracts to unlock **Chapter 5: Advanced Protocols**.

**0/3 missions** • **Level 7 required**`,
      },
      es: {
        title: 'Capítulo 4: Fortaleza de Datos',
        description: 'Domina la gestión de estado compleja con Map, eventos y aprobaciones delegadas.',
        lore: `# 🏦 Capítulo 4: Fortaleza de Datos

Más allá del Salón de los Pactos, descubres la **Fortaleza de Datos** — un vasto repositorio donde se construye el estado sofisticado.

*"Los datos son los cimientos de todos los grandes contratos,"* declara el Arquitecto. *"Aprende a gestionar estado multiusuario, emitir eventos y delegar autoridad."*

## La Cuarta Prueba

Construye contratos basados en datos para desbloquear el **Capítulo 5: Protocolos Avanzados**.

**0/3 misiones** • **Nivel 7 requerido**`,
      },
    },
    heroImage: 'linear-gradient(135deg, #06d6a0 0%, #118ab2 50%, #073b4c 100%)',
    chapterNumber: 4,
    missionIds: ['vault-manager', 'event-emitter', 'approval-manager'],
    requiredLevel: 7,
    color: 'teal'
  },
  {
    id: 'chapter-5-protocols',
    i18n: {
      en: {
        title: 'Chapter 5: Advanced Protocols',
        description: 'Build real-world DeFi protocols — crowdfunding, escrow, and subscriptions.',
        lore: `# 🔄 Chapter 5: Advanced Protocols

The **Crowdforge Arena** buzzes with energy. You enter the realm of real-world DeFi protocols.

*"These are the contracts that power the new economy,"* says the Protocol Pioneer. *"Crowdfunding, escrow, subscriptions — build them all."*

## The Fifth Trial

Master advanced protocol patterns to reach **Chapter 6: Production Systems**.

**0/3 missions** • **Level 9 required**`,
      },
      es: {
        title: 'Capítulo 5: Protocolos Avanzados',
        description: 'Construye protocolos DeFi del mundo real — crowdfunding, escrow y suscripciones.',
        lore: `# 🔄 Capítulo 5: Protocolos Avanzados

La **Arena del Crowdforge** vibra con energía. Entras en el reino de los protocolos DeFi del mundo real.

*"Estos son los contratos que impulsan la nueva economía,"* dice el Pionero de Protocolos. *"Crowdfunding, escrow, suscripciones — constrúyelos todos."*

## La Quinta Prueba

Domina los patrones de protocolos avanzados para llegar al **Capítulo 6: Sistemas de Producción**.

**0/3 misiones** • **Nivel 9 requerido**`,
      },
    },
    heroImage: 'linear-gradient(135deg, #ef476f 0%, #ffd166 50%, #06d6a0 100%)',
    chapterNumber: 5,
    missionIds: ['crowdfund', 'escrow-agent', 'subscription'],
    requiredLevel: 9,
    color: 'red'
  },
  {
    id: 'chapter-6-production',
    i18n: {
      en: {
        title: 'Chapter 6: Production Systems',
        description: 'Deploy production-grade contracts — flash loans, RBAC, oracles, and governance.',
        lore: `# ⚡ Chapter 6: Production Systems

The **Lightning Vault** crackles with power. You have reached the pinnacle of Soroban development.

*"You stand among the finest contract engineers in the Stellar ecosystem,"* proclaims the Grand Elder. *"Flash loans, role-based security, price oracles, on-chain governance — master the systems that define DeFi."*

## Final Gauntlet

Complete all Production Systems to earn the title of **Stellar Architect**.

**0/4 missions** • **Level 12 required**`,
      },
      es: {
        title: 'Capítulo 6: Sistemas de Producción',
        description: 'Despliega contratos de nivel de producción — flash loans, RBAC, oráculos y gobernanza.',
        lore: `# ⚡ Capítulo 6: Sistemas de Producción

La **Bóveda del Relámpago** chisporrotea con poder. Has alcanzado la cima del desarrollo en Soroban.

*"Te encuentras entre los mejores ingenieros de contratos del ecosistema Stellar,"* proclama el Gran Anciano. *"Préstamos flash, seguridad basada en roles, oráculos de precios, gobernanza on-chain — domina los sistemas que definen DeFi."*

## Desafío Final

Completa todos los Sistemas de Producción para ganar el título de **Arquitecto Estelar**.

**0/4 misiones** • **Nivel 12 requerido**`,
      },
    },
    heroImage: 'linear-gradient(135deg, #118ab2 0%, #073b4c 50%, #06d6a0 100%)',
    chapterNumber: 6,
    missionIds: ['flash-loan', 'permissions-rbac', 'oracle-feed', 'governor-simple'],
    requiredLevel: 12,
    color: 'blue'
  },
  {
    id: 'chapter-7-security',
    i18n: {
      en: {
        title: 'Chapter 7: Security & CTF',
        description: 'Hunt vulnerabilities and fix security flaws in compromised contracts.',
        lore: `# 🛡️ Chapter 7: Security & CTF

The **Vulnerability Forge** lies deep beneath the Citadel. Here, broken contracts are made whole.

*"A guardian must know the flaws before the enemy exploits them,"* warns the Security Sage. *"Reentrancy, access control, overflow — confront them all."*

## The Security Gauntlet

Fix security vulnerabilities to complete the Security & CTF gauntlet.

**0/2 missions** • **Level 14 required**`,
      },
      es: {
        title: 'Capítulo 7: Seguridad y CTF',
        description: 'Caza vulnerabilidades y arregla fallos de seguridad en contratos comprometidos.',
        lore: `# 🛡️ Capítulo 7: Seguridad y CTF

La **Forja de Vulnerabilidades** yace en las profundidades de la Ciudadela. Aquí, los contratos rotos se restauran.

*"Un guardián debe conocer las fallas antes de que el enemigo las explote,"* advierte el Sabio de Seguridad. *"Reentrancia, control de acceso, desbordamiento — enfréntalos a todos."*

## El Desafío de Seguridad

Arregla vulnerabilidades de seguridad para completar el desafío de Seguridad y CTF.

**0/2 misiones** • **Nivel 14 requerido**`,
      },
    },
    heroImage: 'linear-gradient(135deg, #ef4444 0%, #dc2626 50%, #7f1d1d 100%)',
    chapterNumber: 7,
    missionIds: ['reentrancy-guard', 'access-control-fix'],
    requiredLevel: 14,
    color: 'red'
  }
];

/* ==========================================
   Localization helpers
   ========================================== */

/**
 * Returns a flat, render-ready campaign object for the given language.
 * Localizable fields (title, description, lore) resolve from
 * `campaign.i18n[lang]`, falling back to English, then any legacy
 * top-level field. The `i18n` block is omitted from the result.
 */
export function localizeCampaign(campaign, lang = DEFAULT_CAMPAIGN_LANG) {
  if (!campaign) return campaign;

  const { i18n, ...neutral } = campaign;
  const locale = (i18n && (i18n[lang] || i18n[DEFAULT_CAMPAIGN_LANG])) || {};
  const fallback = (i18n && i18n[DEFAULT_CAMPAIGN_LANG]) || {};

  const pick = (field) =>
    locale[field] != null
      ? locale[field]
      : fallback[field] != null
      ? fallback[field]
      : neutral[field];

  return {
    ...neutral,
    title: pick('title'),
    description: pick('description'),
    lore: pick('lore'),
  };
}

/** Localizes an array of campaigns. */
export function localizeCampaigns(list, lang = DEFAULT_CAMPAIGN_LANG) {
  return (list || []).map((c) => localizeCampaign(c, lang));
}

// Helper: Get campaign progress from completedMissions array
export function getCampaignProgress(campaignId, completedMissions) {
  const campaign = campaigns.find(c => c.id === campaignId);
  if (!campaign) return { completed: 0, total: 0 };

  const completed = campaign.missionIds.filter(id => completedMissions.includes(id)).length;
  return { completed, total: campaign.missionIds.length, percentage: (completed / campaign.missionIds.length) * 100 };
}
