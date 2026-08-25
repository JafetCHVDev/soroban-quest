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
      fr: {
        title: 'Chapitre 1 : L\'Éveil',
        description: 'Maîtrisez vos premiers contrats Soroban. Forgez votre voie en tant que Gardien Stellaire.',
        lore: `# 🌌 Chapitre 1 : L'Éveil

Vous vous tenez aux portes de la **Citadelle Stellaire**, en orbite à la lisière de l'espace connu. Les anciens **Gardiens de Soroban** ont perçu votre arrivée.

*"Encore un chercheur,"* murmure le Gardien Ancien. *"La blockchain appelle ceux qui possèdent le code pour répondre."*

## Votre Destinée Vous Attend

Complétez ces contrats fondamentaux pour débloquer le **Chapitre 2 : Chambre de la Mémoire**.

**0/2 missions** • **Niveau 1 requis**`,
      },
      pt: {
        title: 'Capítulo 1: O Despertar',
        description: 'Domine seus primeiros contratos Soroban. Forje seu caminho como um Guardião Estelar.',
        lore: `# 🌌 Capítulo 1: O Despertar

Você está diante dos portões da **Cidadela Estelar**, orbitando a borda do espaço conhecido. Os antigos **Guardiões de Soroban** perceberam sua chegada.

*"Mais um buscador,"* sussurra o Guardião Ancião. *"A blockchain chama aqueles com o código para responder."*

## Seu Destino Aguarda

Complete estes contratos fundamentais para desbloquear o **Capítulo 2: Cofre da Memória**.

**0/2 missões** • **Nível 1 necessário**`,
      },
      ko: {
        title: '챕터 1: 각성',
        description: '첫 번째 소로반 컨트랙트를 마스터하세요. 스텔라 수호자로서의 길을 개척하세요.',
        lore: `# 🌌 챕터 1: 각성

알려진 우주의 가장자리를 도는 **스텔라 시타델**의 문 앞에 서 있습니다. 고대 **소로반의 수호자들**이 당신의 도착을 감지했습니다.

*"또 다른 탐구자군요,"* 고대 수호자가 속삭입니다. *"블록체인이 응답할 코드를 가진 자들을 부릅니다."*

## 당신의 운명이 기다립니다

이러한 기초 컨트랙트를 완료하여 **챕터 2: 기억의 금고**를 잠금 해제하세요.

**0/2 미션** • **레벨 1 필요**`,
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
      fr: {
        title: 'Chapitre 2 : Chambre de la Mémoire',
        description: 'Débloquez le stockage persistant et le contrôle d\'accès. La mémoire définit le véritable pouvoir.',
        lore: `# 🔐 Chapitre 2 : Chambre de la Mémoire

La **Tour des Signaux** s'estompe derrière vous. Vous descendez dans la **Chambre de la Mémoire**, où la sagesse ancestrale perdure à travers les éons.

*"Un contrat sans mémoire n'est qu'une pensée éphémère,"* murmure le Gardien de la Chambre. *"Pour perdurer, vous devez stocker et protéger."*

## La Deuxième Épreuve

Maîtrisez la gestion de l'état pour accéder au **Chapitre 3 : Forge de Jetons**.

**0/2 missions** • **Niveau 3 requis**`,
      },
      pt: {
        title: 'Capítulo 2: Cofre da Memória',
        description: 'Desbloqueie armazenamento persistente e controle de acesso. A memória define o verdadeiro poder.',
        lore: `# 🔐 Capítulo 2: Cofre da Memória

A **Torre de Sinal** desaparece atrás de você. Você desce para o **Cofre da Memória**, onde a sabedoria ancestral persiste através de eras.

*"Um contrato sem memória é um pensamento passageiro,"* murmura o Guardião do Cofre. *"Para perdurar, você deve armazenar e proteger."*

## A Segunda Prova

Domine o gerenciamento de estado para acessar o **Capítulo 3: Forja de Tokens**.

**0/2 missões** • **Nível 3 necessário**`,
      },
      ko: {
        title: '챕터 2: 기억의 금고',
        description: '영구 저장소와 접근 제어를 잠금 해제하세요. 기억이 진정한 힘을 정의합니다.',
        lore: `# 🔐 챕터 2: 기억의 금고

**신호 탑**이 뒤로 사라집니다. 고대의 지혜가 영겁을 통해 지속되는 **기억의 금고**로 내려갑니다.

*"기억이 없는 컨트랙트는 순간적인 생각일 뿐입니다,"* 금고 지킴이가 중얼거립니다. *"지속하려면, 저장하고 보호해야 합니다."*

## 두 번째 시련

상태 관리를 마스터하여 **챕터 3: 토큰 단조장**에 접근하세요.

**0/2 미션** • **레벨 3 필요**`,
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
      fr: {
        title: 'Chapitre 3 : Forge de Jetons',
        description: 'Frappez des jetons, maîtrisez les verrous temporels, gouvernez avec la multi-signature. Devenez le Gardien Maître.',
        lore: `# ⚒️ Chapitre 3 : Forge de Jetons

La **Porte du Temps** vibre de puissance. Vous entrez dans la **Forge de Jetons** — le cœur de l'économie Stellar.

*"La véritable maîtrise crée une valeur qui perdure,"* déclare le Maître Forgeron. *"Jetons, temps, confiance — forgez-les tous."*

## Défi Final

Complétez la Forge de Jetons pour obtenir le statut de **Gardien Légendaire**.

**0/3 missions** • **Niveau 5 requis**`,
      },
      pt: {
        title: 'Capítulo 3: Forja de Tokens',
        description: 'Cunhe tokens, domine bloqueios temporais, governe com multi-assinatura. Torne-se o Guardião Mestre.',
        lore: `# ⚒️ Capítulo 3: Forja de Tokens

O **Portal do Tempo** vibra com poder. Você entra na **Forja de Tokens** — coração da economia Stellar.

*"A verdadeira maestria cria valor que perdura,"* declara o Mestre Forjador. *"Tokens, tempo, confiança — forje todos eles."*

## Desafio Final

Complete a Forja de Tokens para conquistar o status de **Guardião Lendário**.

**0/3 missões** • **Nível 5 necessário**`,
      },
      ko: {
        title: '챕터 3: 토큰 단조장',
        description: '토큰을 발행하고, 시간 잠금을 마스터하며, 다중 서명으로 통치하세요. 마스터 수호자가 되세요.',
        lore: `# ⚒️ 챕터 3: 토큰 단조장

**크로노 게이트**가 힘으로 윙윙거립니다. **토큰 단조장** — 스텔라 경제의 심장부로 들어갑니다.

*"진정한 숙련은 지속되는 가치를 창조합니다,"* 단조장의 주인이 선언합니다. *"토큰, 시간, 신뢰 — 모든 것을 단조하세요."*

## 최종 도전

토큰 단조장을 완료하여 **전설의 수호자** 지위를 획득하세요.

**0/3 미션** • **레벨 5 필요**`,
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
      fr: {
        title: 'Chapitre 4 : Forteresse de Données',
        description: 'Maîtrisez la gestion d\'état complexe avec les Map, les événements et les approbations déléguées.',
        lore: `# 🏦 Chapitre 4 : Forteresse de Données

Au-delà de la Salle des Pactes, vous découvrez la **Forteresse de Données** — un vaste dépôt où l'état sophistiqué est conçu.

*"Les données sont le fondement de tous les grands contrats,"* déclare l'Architecte. *"Apprenez à gérer l'état multi-utilisateur, à émettre des événements et à déléguer l'autorité."*

## La Quatrième Épreuve

Construisez des contrats axés sur les données pour débloquer le **Chapitre 5 : Protocoles Avancés**.

**0/3 missions** • **Niveau 7 requis**`,
      },
      pt: {
        title: 'Capítulo 4: Fortaleza de Dados',
        description: 'Domine o gerenciamento de estado complexo com Maps, eventos e aprovações delegadas.',
        lore: `# 🏦 Capítulo 4: Fortaleza de Dados

Além do Salão dos Pactos, você descobre a **Fortaleza de Dados** — um vasto repositório onde estados sofisticados são projetados.

*"Os dados são a base de todos os grandes contratos,"* declara o Arquiteto. *"Aprenda a gerenciar estados multiusuário, emitir eventos e delegar autoridade."*

## A Quarta Prova

Construa contratos orientados a dados para desbloquear o **Capítulo 5: Protocolos Avançados**.

**0/3 missões** • **Nível 7 necessário**`,
      },
      ko: {
        title: '챕터 4: 데이터 요새',
        description: 'Map, 이벤트, 위임된 승인으로 복잡한 상태 관리를 마스터하세요.',
        lore: `# 🏦 챕터 4: 데이터 요새

협정의 홀 너머에서 **데이터 요새**를 발견합니다 — 정교한 상태가 설계되는 거대한 저장소입니다.

*"데이터는 모든 위대한 컨트랙트의 기초입니다,"* 건축가가 선언합니다. *"다중 사용자 상태를 관리하고, 이벤트를 방출하며, 권한을 위임하는 것을 배우세요."*

## 네 번째 시련

데이터 기반 컨트랙트를 구축하여 **챕터 5: 고급 프로토콜**을 잠금 해제하세요.

**0/3 미션** • **레벨 7 필요**`,
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
      fr: {
        title: 'Chapitre 5 : Protocoles Avancés',
        description: 'Construisez des protocoles DeFi du monde réel — financement participatif, séquestre et abonnements.',
        lore: `# 🔄 Chapitre 5 : Protocoles Avancés

L'**Arène Crowdforge** bourdonne d'énergie. Vous entrez dans le royaume des protocoles DeFi du monde réel.

*"Voici les contrats qui alimentent la nouvelle économie,"* dit le Pionnier des Protocoles. *"Financement participatif, séquestre, abonnements — construisez-les tous."*

## La Cinquième Épreuve

Maîtrisez les modèles de protocoles avancés pour atteindre le **Chapitre 6 : Systèmes de Production**.

**0/3 missions** • **Niveau 9 requis**`,
      },
      pt: {
        title: 'Capítulo 5: Protocolos Avançados',
        description: 'Construa protocolos DeFi do mundo real — crowdfunding, escrow e assinaturas.',
        lore: `# 🔄 Capítulo 5: Protocolos Avançados

A **Arena Crowdforge** vibra com energia. Você entra no reino dos protocolos DeFi do mundo real.

*"Estes são os contratos que movem a nova economia,"* diz o Pioneiro de Protocolos. *"Crowdfunding, escrow, assinaturas — construa todos eles."*

## A Quinta Prova

Domine padrões de protocolos avançados para alcançar o **Capítulo 6: Sistemas de Produção**.

**0/3 missões** • **Nível 9 necessário**`,
      },
      ko: {
        title: '챕터 5: 고급 프로토콜',
        description: '실제 DeFi 프로토콜을 구축하세요 — 크라우드펀딩, 에스크로, 구독.',
        lore: `# 🔄 챕터 5: 고급 프로토콜

**크라우드포지 아레나**가 에너지로 북적입니다. 실제 DeFi 프로토콜의 영역에 들어갑니다.

*"이것들이 새로운 경제를 움직이는 컨트랙트들입니다,"* 프로토콜 개척자가 말합니다. *"크라우드펀딩, 에스크로, 구독 — 모든 것을 구축하세요."*

## 다섯 번째 시련

고급 프로토콜 패턴을 마스터하여 **챕터 6: 프로덕션 시스템**에 도달하세요.

**0/3 미션** • **레벨 9 필요**`,
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
      fr: {
        title: 'Chapitre 6 : Systèmes de Production',
        description: 'Déployez des contrats de niveau production — flash loans, RBAC, oracles et gouvernance.',
        lore: `# ⚡ Chapitre 6 : Systèmes de Production

La **Chambre de la Foudre** crépite de puissance. Vous avez atteint le sommet du développement Soroban.

*"Vous comptez parmi les meilleurs ingénieurs de contrats de l'écosystème Stellar,"* proclame le Grand Ancien. *"Flash loans, sécurité basée sur les rôles, oracles de prix, gouvernance on-chain — maîtrisez les systèmes qui définissent la DeFi."*

## Épreuve Finale

Complétez tous les Systèmes de Production pour gagner le titre d'**Architecte Stellaire**.

**0/4 missions** • **Niveau 12 requis**`,
      },
      pt: {
        title: 'Capítulo 6: Sistemas de Produção',
        description: 'Implante contratos de nível de produção — flash loans, RBAC, oráculos e governança.',
        lore: `# ⚡ Capítulo 6: Sistemas de Produção

O **Cofre do Relâmpago** crepita com poder. Você alcançou o ápice do desenvolvimento Soroban.

*"Você está entre os melhores engenheiros de contratos do ecossistema Stellar,"* proclama o Grande Ancião. *"Flash loans, segurança baseada em funções, oráculos de preços, governança on-chain — domine os sistemas que definem DeFi."*

## Desafio Final

Complete todos os Sistemas de Produção para conquistar o título de **Arquiteto Estelar**.

**0/4 missões** • **Nível 12 necessário**`,
      },
      ko: {
        title: '챕터 6: 프로덕션 시스템',
        description: '프로덕션급 컨트랙트를 배포하세요 — 플래시 론, RBAC, 오라클, 거버넌스.',
        lore: `# ⚡ 챕터 6: 프로덕션 시스템

**번개 금고**가 힘으로 딱딱거립니다. 소로반 개발의 정점에 도달했습니다.

*"당신은 스텔라 생태계의 최고 컨트랙트 엔지니어 중 한 명입니다,"* 대장로가 선언합니다. *"플래시 론, 역할 기반 보안, 가격 오라클, 온체인 거버넌스 — DeFi를 정의하는 시스템들을 마스터하세요."*

## 최종 관문

모든 프로덕션 시스템을 완료하여 **스텔라 건축가** 칭호를 획득하세요.

**0/4 미션** • **레벨 12 필요**`,
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
      fr: {
        title: 'Chapitre 7 : Sécurité et CTF',
        description: 'Traquez les vulnérabilités et corrigez les failles de sécurité dans des contrats compromis.',
        lore: `# 🛡️ Chapitre 7 : Sécurité et CTF

La **Forge des Vulnérabilités** repose dans les profondeurs de la Citadelle. Ici, les contrats brisés sont restaurés.

*"Un gardien doit connaître les failles avant que l'ennemi ne les exploite,"* avertit le Sage de la Sécurité. *"Réentrance, contrôle d'accès, dépassement — affrontez-les tous."*

## Le Défi de Sécurité

Corrigez les vulnérabilités de sécurité pour compléter le défi Sécurité et CTF.

**0/2 missions** • **Niveau 14 requis**`,
      },
      pt: {
        title: 'Capítulo 7: Segurança e CTF',
        description: 'Cace vulnerabilidades e corrija falhas de segurança em contratos comprometidos.',
        lore: `# 🛡️ Capítulo 7: Segurança e CTF

A **Forja de Vulnerabilidades** repousa nas profundezas da Cidadela. Aqui, contratos quebrados são restaurados.

*"Um guardião deve conhecer as falhas antes que o inimigo as explore,"* adverte o Sábio da Segurança. *"Reentrância, controle de acesso, overflow — enfrente todos eles."*

## O Desafio de Segurança

Corrija vulnerabilidades de segurança para completar o desafio de Segurança e CTF.

**0/2 missões** • **Nível 14 necessário**`,
      },
      ko: {
        title: '챕터 7: 보안 & CTF',
        description: '취약점을 추적하고 손상된 컨트랙트의 보안 결함을 수정하세요.',
        lore: `# 🛡️ 챕터 7: 보안 & CTF

**취약점 단조장**이 시타델 깊은 곳에 있습니다. 여기서 깨진 컨트랙트들이 완전해집니다.

*"수호자는 적이 악용하기 전에 결함을 알아야 합니다,"* 보안 현자가 경고합니다. *"재진입, 접근 제어, 오버플로 — 모든 것과 맞서세요."*

## 보안 관문

보안 취약점을 수정하여 보안 & CTF 관문을 완료하세요.

**0/2 미션** • **레벨 14 필요**`,
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
