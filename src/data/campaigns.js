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
