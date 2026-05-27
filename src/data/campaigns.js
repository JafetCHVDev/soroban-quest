/* ==========================================
   Campaign System — Grouped mission chapters
   with lore, progression gates, hero images
   ========================================== */

import { missions } from './missions.js';

export const campaigns = [
  {
    id: 'chapter-1-awakening',
    title: 'Chapter 1: The Awakening',
    description: 'Master your first Soroban contracts. Forge your path as a Stellar Guardian.',
    lore: `# 🌌 Chapter 1: The Awakening

You stand at the gates of the **Stellar Citadel**, orbiting the edge of known space. The ancient **Guardians of Soroban** have sensed your arrival.

*"Another seeker,"* whispers the Elder Guardian. *"The blockchain calls to those with the code to answer."*

## Your Destiny Awaits

Complete these foundational contracts to unlock **Chapter 2: Vault of Memory**.

**0/2 missions** • **Level 1 required**`,
    heroImage: 'linear-gradient(135deg, #06d6a0 0%, #8b5cf6 50%, #f59e0b 100%)',
    chapterNumber: 1,
    missionIds: ['hello-soroban', 'greetings-protocol'],
    requiredLevel: 1,
    color: 'cyan'
  },
  {
    id: 'chapter-2-memory',
    title: 'Chapter 2: Vault of Memory', 
    description: 'Unlock persistent storage and access control. Memory defines true power.',
    lore: `# 🔐 Chapter 2: Vault of Memory

The **Signal Tower** fades behind you. You descend into the **Vault of Memory**, where ancient wisdom persists across eons.

*"A contract without memory is a fleeting thought,"* murmurs the Vault Keeper. *"To endure, you must store and protect."*

## The Second Trial

Master state management to access **Chapter 3: Token Forge**.

**0/2 missions** • **Level 3 required**`,
    heroImage: 'linear-gradient(135deg, #8b5cf6 0%, #f59e0b 50%, #ef4444 100%)',
    chapterNumber: 2,
    missionIds: ['counter-vault', 'guardian-ledger'],
    requiredLevel: 3,
    color: 'purple'
  },
  {
    id: 'chapter-3-forge',
    title: 'Chapter 3: Token Forge',
    description: 'Mint tokens, master time-locks, govern with multi-sig. Become the Master Guardian.',
    lore: `# ⚒️ Chapter 3: Token Forge

The **Chrono Gate** hums with power. You enter the **Token Forge** — heart of the Stellar economy.

*"True mastery creates value that endures,"* declares the Forgemaster. *"Tokens, time, trust — forge them all."*

## Final Challenge

Complete the Token Forge to earn **Legendary Guardian** status.

**0/3 missions** • **Level 5 required**`,
    heroImage: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 50%, #06d6a0 100%)',
    chapterNumber: 3,
    missionIds: ['token-forge', 'time-lock', 'multi-party-pact'],
    requiredLevel: 5,
    color: 'gold'
  }
];

// Helper: Get campaign progress from completedMissions array
export function getCampaignProgress(campaignId, completedMissions) {
  const campaign = campaigns.find(c => c.id === campaignId);
  if (!campaign) return { completed: 0, total: 0 };
  
  const completed = campaign.missionIds.filter(id => completedMissions.includes(id)).length;
  return { completed, total: campaign.missionIds.length, percentage: (completed / campaign.missionIds.length) * 100 };
}

