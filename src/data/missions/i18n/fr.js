/* eslint-disable no-useless-escape */
export const missionLocale = {
  "hello-soroban": {
                title: 'Le Premier Contrat',
                story: `# 🌌 L'Éveil

Tu te tiens devant les portes de la **Citadelle Stellaire**, une forteresse scintillante en orbite au bord de l'espace connu. Les Gardiens de Soroban ont perçu ton arrivée.

*"Encore un chercheur,"* murmure le Gardien Ancien. *"Pour prouver ta valeur, tu dois forger ton premier contrat intelligent."*

## Ta Mission

Crée ton premier contrat intelligent Soroban — un contrat simple avec une fonction \`hello\` qui reçoit un nom et renvoie une salutation.

## Ce Que Tu Apprendras

- Les attributs \`#[contract]\` et \`#[contractimpl]\`
- Le type \`Env\` — ta porte d'entrée vers la blockchain
- Le type \`Symbol\` pour les valeurs de type chaîne
- Comment renvoyer un \`Vec<Symbol>\`

## Concepts Clés

\`\`\`rust
#[contract]          // Marks your struct as a contract
#[contractimpl]      // Contains the contract methods
Env                  // The execution environment
Symbol               // A small, efficient string type
\`\`\`

Complète le modèle de code pour passer toutes les vérifications. Les Gardiens attendent ton premier contrat ! ⚔️`,
                learningGoal: 'Crée ton premier contrat intelligent Soroban avec une fonction hello',
                hints: [
                    'Commence par `pub fn hello(env: Env, to: Symbol) -> Vec<Symbol>`',
                    'Utilise la macro `vec![]` avec `&env` comme premier argument',
                    'La ligne de retour complète : `vec![&env, symbol_short!("Hello"), to]`',
                ],
            },
  "greetings-protocol": {
                title: 'Protocole de Salutations',
                story: `# 📡 La Tour de Signaux

La première porte est ouverte. Tu avances vers la **Tour de Signaux**, où les messages se propagent à travers le réseau Stellar.

*"La communication est un pouvoir,"* dit le Gardien de la Tour. *"Ton contrat doit apprendre à gérer les données — accepter des entrées et renvoyer des réponses structurées."*

## Ta Mission

Construis un contrat avec plusieurs fonctions :
- \`greet\` — reçoit un nom et renvoie une salutation personnalisée
- \`count_chars\` — reçoit une chaîne et renvoie sa longueur en u32

## Ce Que Tu Apprendras

- Plusieurs fonctions dans un seul contrat
- Travailler avec le type \`String\` dans Soroban
- Renvoyer différents types depuis les fonctions
- La macro \`symbol_short!\`

## Concepts Clés

\`\`\`rust
String              // Full string type in Soroban
symbol_short!()     // Create a Symbol from a short literal
u32                 // Unsigned 32-bit integer
\`\`\``,
                learningGoal: 'Construis un contrat multifonction avec différents types de retour',
                hints: [
                    'La signature de la fonction greet : `pub fn greet(env: Env, name: Symbol) -> Vec<Symbol>`',
                    'Pour count_chars : `pub fn count_chars(env: Env, text: String) -> u32`',
                    'Utilise `text.len()` pour obtenir la longueur de la chaîne',
                ],
            },
  "counter-vault": {
                title: 'Le Coffre Compteur',
                story: `# 🔐 Le Coffre de la Mémoire

Tu descends dans le **Coffre de la Mémoire**, où les anciens ont entreposé la sagesse qui persiste à travers le temps.

*"Un contrat sans mémoire est comme un être conscient sans âme,"* murmure le Gardien du Coffre. *"Apprends à stocker et à récupérer — à te souvenir."*

## Ta Mission

Crée un contrat compteur qui conserve sa valeur :
- \`increment\` — augmente le compteur de 1
- \`get_count\` — renvoie le décompte actuel

## Ce Que Tu Apprendras

- Le **stockage persistant** avec \`env.storage().instance()\`
- Lire et écrire l'état
- Le motif de clé \`Symbol\` pour le stockage
- Les valeurs par défaut avec \`.unwrap_or()\`

## Concepts Clés

\`\`\`rust
env.storage().instance().set(&key, &value)  // Write
env.storage().instance().get(&key)          // Read (returns Option)
.unwrap_or(default)                         // Default if None
\`\`\``,
                learningGoal: 'Utilise le stockage persistant pour créer un contrat compteur avec état',
                hints: [
                    'Utilise `env.storage().instance().get(&COUNTER)` pour lire le décompte',
                    'Utilise `.unwrap_or(0)` pour renvoyer 0 par défaut quand aucune valeur n\'existe',
                    'Utilise `env.storage().instance().set(&COUNTER, &new_count)` pour enregistrer le nouveau décompte',
                ],
            },
  "guardian-ledger": {
                title: 'Registre du Gardien',
                story: `# 📋 Le Registre du Gardien

La Chambre du Conseil rayonne d'une lumière ancestrale. Devant toi repose le **Registre du Gardien** — un recensement de tous ceux qui ont fait leurs preuves.

*"Pour protéger le royaume, tu dois contrôler qui peut agir,"* déclare le Chef du Conseil. *"Apprends l'art du contrôle d'accès."*

## Ta Mission

Construis un contrat de registre avec contrôle d'accès :
- \`register\` — enregistre un nouveau gardien (stocke son nom)
- \`get_guardian\` — récupère le nom d'un gardien par son adresse
- Une adresse \`admin\` définie lors de l'initialisation

## Ce Que Tu Apprendras

- Le type \`Address\` pour les identités d'utilisateur
- \`require_auth()\` pour le contrôle d'accès
- Travailler avec le type \`Map\` pour les paires clé-valeur
- Les motifs d'initialisation de contrats

## Concepts Clés

\`\`\`rust
Address                     // Represents an account/identity
address.require_auth()      // Ensures the caller is authorized
Map<Address, Symbol>        // Key-value mapping
\`\`\``,
                learningGoal: 'Implémente le contrôle d\'accès avec Address et require_auth',
                hints: [
                    'La fonction init stocke l\'admin : `env.storage().instance().set(&ADMIN, &admin)`',
                    'Dans register, appelle `who.require_auth()` avant de stocker',
                    'Stocke avec : `env.storage().instance().set(&who, &name)`',
                ],
            },
  "token-forge": {
                title: 'La Forge de Tokens',
                story: `# ⚒️ La Forge de Tokens

Au plus profond de la Citadelle repose la **Forge de Tokens**, où les actifs numériques sont frappés à partir de pure logique.

*"La monnaie est la sève de toute économie,"* dit le Maître Forgeron. *"Tu vas créer un token qui peut être transféré entre les comptes."*

## Ta Mission

Crée un contrat de token simple :
- \`mint\` — crée des tokens pour une adresse (admin uniquement)
- \`balance\` — renvoie le solde d'une adresse
- \`transfer\` — déplace des tokens d'une adresse à une autre

## Ce Que Tu Apprendras

- La gestion des soldes de tokens
- La logique de transfert avec autorisation
- Les fonctions restreintes à l'admin
- L'arithmétique entière pour les soldes

## Concepts Clés

\`\`\`rust
// Admin check pattern
admin.require_auth();

// Balance management
let bal: i128 = env.storage().persistent().get(&from).unwrap_or(0);
\`\`\``,
                learningGoal: 'Construis un token de base avec les fonctions mint, balance et transfer',
                hints: [
                    'Pour mint : récupère l\'admin depuis le stockage, appelle admin.require_auth(), puis mets à jour le solde',
                    'Pour balance : `env.storage().persistent().get(&account).unwrap_or(0)`',
                    'Pour transfer : require_auth de l\'expéditeur, lis les deux soldes, mets à jour les deux',
                ],
            },
  "time-lock": {
                title: 'Le Verrou Temporel',
                story: `# ⏳ La Porte du Temps

La **Porte du Temps** se dresse devant toi, ses mécanismes battant au rythme du grand livre.

*"Le temps est une arme,"* dit le Gardien du Temps. *"Apprends à verrouiller et à déverrouiller selon le défilement des blocs."*

## Ta Mission

Crée un coffre à verrou temporel :
- \`lock\` — verrouille des tokens jusqu'à un numéro de séquence de grand livre donné
- \`unlock\` — libère les tokens si la période de verrouillage est écoulée
- \`get_lock_info\` — renvoie le moment où le verrou expire

## Ce Que Tu Apprendras

- La séquence / l'horodatage du grand livre pour une logique temporelle
- L'exécution conditionnelle selon l'état de la blockchain
- \`env.ledger().sequence()\` pour le bloc actuel
- Les motifs de panic pour la gestion des erreurs

## Concepts Clés

\`\`\`rust
env.ledger().sequence()  // Current ledger sequence number
panic!("message")        // Abort with error
\`\`\``,
                learningGoal: 'Implémente une logique conditionnelle basée sur le temps en utilisant la séquence du grand livre',
                hints: [
                    'Utilise `env.ledger().sequence()` pour obtenir le numéro de grand livre actuel',
                    'Compare : `if current_seq < unlock_at { panic!("Still locked"); }`',
                    'Nettoie le stockage après le déverrouillage : `env.storage().instance().remove(&key)`',
                ],
            },
  "multi-party-pact": {
                title: 'Pacte Multipartite',
                story: `# 🤝 La Salle des Pactes

Tu as atteint la **Salle des Pactes**, le défi final avant de gagner ta place parmi les Gardiens.

*"Le véritable pouvoir des contrats intelligents,"* déclare le Grand Ancien, *"c'est qu'ils permettent la confiance entre inconnus."*

## Ta Mission

Crée un contrat d'accord à signatures multiples :
- \`create_pact\` — crée un accord nécessitant N signatures
- \`sign_pact\` — permet à une partie de signer l'accord
- \`is_complete\` — vérifie si toutes les signatures requises ont été réunies
- \`get_signers\` — renvoie qui a signé

## Ce Que Tu Apprendras

- Les structures de données complexes dans les contrats
- L'autorisation multipartite
- Le comptage et le suivi avec le stockage
- La construction de motifs de gouvernance du monde réel

## Concepts Clés

\`\`\`rust
// Track signer count
let count: u32 = env.storage().instance()
    .get(&SIGNER_COUNT).unwrap_or(0);

// Store with dynamic keys
env.storage().instance().set(&signer_key, &true);
\`\`\``,
                learningGoal: 'Construis un contrat de pacte à signatures multiples avec une gestion d\'état complexe',
                hints: [
                    'Dans create_pact : stocke la description, le nombre requis et un décompte initial de signatures à 0',
                    'Dans sign_pact : lis le décompte actuel, incrémente-le de 1, enregistre-le à nouveau',
                    'Dans is_complete : compare signed >= required',
                ],
            },
  "vault-manager": {
                title: 'Gestionnaire de Coffre',
                story: `# 🏦 La Forteresse de Données

Au-delà de la Salle des Pactes s'étend la **Forteresse de Données**, où d'innombrables soldes d'utilisateurs sont stockés et protégés.

*"Un seul solde est trivial,"* dit l'Architecte du Coffre. *"En gérer beaucoup — voilà l'art de l'architecture de stockage."*

## Ta Mission

Construis un contrat de coffre qui gère plusieurs soldes d'utilisateurs :
- \`deposit\` — ajoute des fonds au solde d'un utilisateur (l'utilisateur doit s'authentifier)
- \`withdraw\` — retire des fonds du solde d'un utilisateur (l'utilisateur doit s'authentifier)
- \`get_balance\` — renvoie le solde actuel d'un utilisateur

## Ce Que Tu Apprendras

- \`Map<Address, i128>\` pour un état multi-utilisateur
- \`Env::require_auth()\` pour l'autorisation par utilisateur
- Le stockage persistant avec des clés complexes
- Les motifs d'arithmétique sûre

## Concepts Clés

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
                learningGoal: 'Construis un coffre multi-utilisateur avec le motif de stockage Map',
                hints: [
                    'Utilise Map<Address, i128> pour stocker les soldes des utilisateurs',
                    'Appelle user.require_auth() avant de modifier le solde d\'un utilisateur',
                    'Lis le Map depuis le stockage avec .unwrap_or(Map::new(&env))',
                    'Pour deposit : récupère le solde actuel, ajoute le montant, enregistre à nouveau',
                ],
            },
  "event-emitter": {
                title: 'Émetteur d\'Événements',
                story: `# 📡 La Balise de Signaux

Tout en haut de la Forteresse de Données se dresse la **Balise de Signaux**, diffusant des événements à travers le réseau Stellar.

*"Les contrats qui parlent sont des contrats que l'on comprend,"* dit le Gardien de la Balise. *"Les événements permettent au monde de savoir ce qui s'est passé."*

## Ta Mission

Crée un contrat qui stocke des données clé-valeur et émet des événements à chaque changement d'état :
- \`set_value\` — stocke une valeur et émet un événement avec la clé et la valeur
- \`get_value\` — récupère une valeur stockée par sa clé
- \`get_all_keys\` — renvoie toutes les clés stockées

## Ce Que Tu Apprendras

- \`env.events().publish()\` pour émettre des événements
- \`Vec<Symbol>\` pour le suivi dynamique des clés
- L'architecture de contrats basée sur les événements
- Les motifs de publication-abonnement sur Stellar

## Concepts Clés

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
                learningGoal: 'Implémente l\'émission d\'événements dans un contrat de stockage clé-valeur',
                hints: [
                    'Utilise env.events().publish() avec un sujet Symbol et les données de l\'événement',
                    'Utilise Vec<Symbol> pour suivre toutes les clés stockées',
                    'Ajoute de nouvelles clés avec keys.push_back(key)',
                ],
            },
  "approval-manager": {
                title: 'Gestionnaire d\'Approbations',
                story: `# ✋ La Chambre de la Délégation

Au sein de la Forteresse de Données repose la **Chambre de la Délégation**, où la confiance se formalise par des allocations.

*"Tu ne peux pas toujours agir toi-même,"* explique le Maître de la Délégation. *"Parfois, tu dois habiliter les autres à agir en ton nom."*

## Ta Mission

Construis un contrat qui permet aux utilisateurs d'autoriser d'autres à dépenser en leur nom :
- \`approve\` — le propriétaire autorise un dépensier pour un montant donné
- \`transfer_from\` — le dépensier transfère du propriétaire vers un destinataire
- \`allowance\` — vérifie combien un dépensier est autorisé à dépenser

## Ce Que Tu Apprendras

- Les motifs clé-valeur imbriqués (propriétaire -> dépensier -> allocation)
- L'autorisation déléguée
- Les clés de stockage à double adresse
- Le motif de décrémentation d'allocation

## Concepts Clés

\`\`\`rust
// Compound storage key for allowances
let allowance_key = (owner.clone(), spender.clone());
env.storage().instance().set(&allowance_key, &amount);

// Read nested allowance
env.storage().instance().get(&(owner, spender))
    .unwrap_or(0)
\`\`\``,
                learningGoal: 'Implémente un système d\'allocation et de transfert délégué',
                hints: [
                    'Utilise un tuple (Address, Address) comme clé de stockage composée',
                    'Dans approve : stocke l\'allocation pour la paire (owner, spender)',
                    'Dans transfer_from : require_auth du spender, vérifie l\'allocation, décrémente-la, mets à jour les soldes',
                ],
            },
  "crowdfund": {
                title: 'Campagne de Financement Participatif',
                story: `# 🎯 L'Arène du Crowdforge

Tu entres dans l'**Arène du Crowdforge**, où la puissance collective donne vie aux idées.

*"Seul, tu es fort,"* annonce le Commissaire-priseur. *"Ensemble, vous pouvez déplacer des étoiles. Construis une campagne que le peuple peut financer."*

## Ta Mission

Crée un contrat de financement participatif :
- \`init\` — définit l'objectif de financement et la date limite (séquence du grand livre)
- \`contribute\` — ajoute des fonds d'un contributeur
- \`check_goal\` — renvoie true si les contributions totales >= objectif
- \`get_total_raised\` — renvoie le total des fonds collectés

## Ce Que Tu Apprendras

- La séquence du grand livre pour les échéances basées sur le temps
- L'accumulation de fonds de type séquestre
- Le suivi d'objectifs avec des vérifications conditionnelles
- La gestion d'état avec plusieurs contributeurs

## Concepts Clés

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
                learningGoal: 'Construis un contrat de financement participatif avec suivi d\'objectif et d\'échéance',
                hints: [
                    'Dans init : stocke le montant objectif et la séquence de grand livre de la date limite',
                    'Dans contribute : vérifie que la date limite n\'est pas passée, ajoute le montant au total',
                    'Dans check_goal : compare le total collecté à l\'objectif',
                ],
            },
  "escrow-agent": {
                title: 'Agent de Séquestre',
                story: `# 🤲 L'Échange de Confiance

Au plus profond de l'Arène du Crowdforge se trouve l'**Échange de Confiance**, où les transactions entre inconnus sont arbitrées.

*"La confiance est la monnaie la plus rare,"* dit le Médiateur du Séquestre. *"Construis un système qui retient la valeur jusqu'à ce que les conditions soient remplies."*

## Ta Mission

Crée un contrat de séquestre avec acheteur, vendeur et arbitre :
- \`init\` — configure le séquestre avec les adresses de l'acheteur, du vendeur et de l'arbitre
- \`deposit\` — l'acheteur dépose des fonds dans le séquestre
- \`release\` — l'arbitre libère les fonds au vendeur
- \`refund\` — l'arbitre rembourse l'acheteur

## Ce Que Tu Apprendras

- L'initialisation de contrats multipartites
- Les motifs d'autorisation à trois acteurs
- La machine à états pour le cycle de vie du séquestre
- Les motifs de résolution de litiges

## Concepts Clés

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
                learningGoal: 'Implémente un contrat de séquestre multipartite avec résolution de litiges',
                hints: [
                    'Dans init : stocke les adresses de l\'acheteur, du vendeur et de l\'arbitre',
                    'Dans deposit : require_auth de l\'acheteur et stocke le montant',
                    'Dans release : require_auth de l\'arbitre, transfère au vendeur',
                    'Dans refund : require_auth de l\'arbitre, rembourse à l\'acheteur',
                ],
            },
  "subscription": {
                title: 'Gestionnaire d\'Abonnements',
                story: `# 🔄 Le Moteur Récurrent

Au cœur du district des Protocoles Avancés ronronne le **Moteur Récurrent**, alimentant des accords périodiques automatisés.

*"Les contrats les plus puissants sont ceux qui fonctionnent sans attention constante,"* dit le Gardien du Moteur. *"Construis un abonnement qui collecte des paiements récurrents."*

## Ta Mission

Crée un contrat de gestion d'abonnements :
- \`subscribe\` — l'utilisateur s'abonne à un plan (stocke le plan, la prochaine facturation)
- \`collect\` — collecte les frais d'abonnement si la facturation est due
- \`cancel\` — annule l'abonnement
- \`get_subscription\` — renvoie les informations d'abonnement d'un utilisateur

## Ce Que Tu Apprendras

- La logique de facturation récurrente avec la séquence du grand livre
- La gestion de l'état des abonnements
- Les motifs d'annulation et de remboursement
- Les calculs d'intervalles de temps

## Concepts Clés

\`\`\`rust
// Track subscription period
let interval: u32 = 1000; // billing every ~1000 ledgers
let next_billing: u32 = env.ledger().sequence() + interval;

// Check if billing is due
if env.ledger().sequence() >= next_billing {
    // collect payment
}
\`\`\``,
                learningGoal: 'Construis un contrat d\'abonnement récurrent avec facturation périodique',
                hints: [
                    'Dans subscribe : stocke le plan, définis next_billing à sequence + intervalle',
                    'Dans collect : vérifie si sequence >= next_billing, si c\'est le cas collecte et mets à jour next_billing',
                    'Dans cancel : nettoie les données d\'abonnement du stockage',
                ],
            },
  "flash-loan": {
                title: 'Pool de Prêts Flash',
                story: `# ⚡ Le Coffre de l'Éclair

Dans la couche la plus profonde de la Citadelle repose le **Coffre de l'Éclair**, où le capital se déplace à la vitesse de la lumière.

*"Les prêts flash sont l'épreuve ultime de la conception de contrats,"* dit l'Archonte de l'Éclair. *"Emprunte, utilise et rembourse en une seule transaction."*

## Ta Mission

Construis un pool de prêts flash simplifié :
- \`init\` — définit le solde du pool
- \`flash_loan\` — emprunte au pool (doit être remboursé au sein de l'appel)
- \`get_pool_balance\` — renvoie le solde actuel du pool
- \`repay\` — rembourse le montant emprunté plus de petits frais

## Ce Que Tu Apprendras

- La mécanique des prêts flash (simplifiée pour la validation)
- La gestion du solde du pool
- Le suivi du cycle de vie du prêt
- Les motifs de frais au remboursement

## Concepts Clés

\`\`\`rust
// Track active loan
let loan: i128 = env.storage().instance()
    .get(&(borrower.clone(), LOAN_AMOUNT))
    .unwrap_or(0);

// Repay with fee
let fee = amount / 100; // 1% fee
env.storage().instance().set(&POOL, &(pool_bal + amount + fee));
\`\`\``,
                learningGoal: 'Construis un contrat de pool de prêts flash simplifié',
                hints: [
                    'Dans init : stocke le solde initial du pool',
                    'Dans flash_loan : vérifie que le pool en a assez, déduis du pool, enregistre le prêt',
                    'Dans repay : vérifie que le prêt existe, rends les fonds plus les frais au pool, nettoie le prêt',
                ],
            },
  "permissions-rbac": {
                title: 'RBAC des Permissions',
                story: `# 🛡️ Le Hall des Rôles

Au-delà du Coffre de l'Éclair s'élève le **Hall des Rôles**, où l'accès est régi par des permissions structurées.

*"Tous ceux qui errent ne sont pas destinés à ouvrir toutes les portes,"* déclare le Maître des Rôles. *"Construis un système où les rôles définissent ce que l'on peut faire."*

## Ta Mission

Crée un contrat de contrôle d'accès basé sur les rôles :
- \`grant_role\` — l'admin accorde un rôle à un utilisateur
- \`revoke_role\` — l'admin révoque un rôle d'un utilisateur
- \`has_role\` — vérifie si un utilisateur possède un rôle spécifique
- \`get_admin\` — renvoie l'admin du contrat

## Ce Que Tu Apprendras

- Les motifs de contrôle d'accès basé sur les rôles (RBAC)
- Les fonctions privilégiées réservées à l'admin
- Les clés composées pour l'appartenance à un rôle
- Une architecture de permissions flexible

## Concepts Clés

\`\`\`rust
// Grant a role
let role_key = (user.clone(), role.clone());
env.storage().instance().set(&role_key, &true);

// Check role membership
env.storage().instance()
    .get(&(user.clone(), role.clone()))
    .unwrap_or(false)
\`\`\``,
                learningGoal: 'Implémente un contrat de contrôle d\'accès basé sur les rôles',
                hints: [
                    'Dans init : stocke l\'adresse de l\'admin',
                    'Dans grant_role : require_auth de l\'admin, stocke l\'appartenance au rôle pour l\'utilisateur',
                    'Dans revoke_role : require_auth de l\'admin, supprime l\'appartenance au rôle',
                    'Dans has_role : vérifie si la clé du rôle existe et est true',
                ],
            },
  "oracle-feed": {
                title: 'Flux d\'Oracle',
                story: `# 📊 La Flèche de l'Oracle

Au sommet du district des Systèmes de Production se dresse la **Flèche de l'Oracle**, où les données hors chaîne entrent dans la blockchain.

*"Les contrats intelligents sont aveugles sans données,"* dit le Sage de l'Oracle. *"Construis un pont entre les mondes on-chain et off-chain."*

## Ta Mission

Crée un contrat d'oracle de prix :
- \`update_price\` — l'admin met à jour le prix d'une paire d'actifs
- \`get_price\` — renvoie le prix actuel d'une paire d'actifs
- \`get_last_updated\` — renvoie la dernière mise à jour du prix
- \`get_all_assets\` — renvoie toutes les paires d'actifs suivies

## Ce Que Tu Apprendras

- Les motifs de flux de données d'oracle
- Les fonctions de mise à jour réservées à l'admin
- Le suivi d'horodatage/séquence
- La gestion des paires d'actifs avec Vec<Symbol>

## Concepts Clés

\`\`\`rust
// Store price with metadata
pub fn update_price(env: Env, asset: Symbol, price: i128) {
    admin.require_auth();
    env.storage().instance().set(&asset, &price);
    env.storage().instance()
        .set(&(asset.clone(), TIMESTAMP), &env.ledger().sequence());
}
\`\`\``,
                learningGoal: 'Construis un oracle de prix on-chain avec des mises à jour de l\'admin',
                hints: [
                    'Dans update_price : require_auth de l\'admin, stocke le prix et la séquence',
                    'Dans get_price : recherche et renvoie le prix de l\'actif',
                    'Dans get_last_updated : renvoie la séquence stockée pour l\'actif',
                    'Dans get_all_assets : utilise un traqueur Vec<Symbol> similaire à event-emitter',
                ],
            },
  "governor-simple": {
                title: 'Gouverneur Simple',
                story: `# 🏛️ Le Hall de la Gouvernance

La chambre finale attend — le **Hall de la Gouvernance**, où le destin de tout le royaume se décide par la volonté collective.

*"Les meilleurs contrats intelligents habilitent les communautés à se gouverner elles-mêmes,"* proclame le Grand Ancien. *"Construis un système où les propositions deviennent loi par le vote."*

## Ta Mission

Crée un contrat de gouvernance avec propositions et vote :
- \`create_proposal\` — crée une proposition avec une description et une période de vote
- \`vote\` — émet un vote (oui/non) sur une proposition active
- \`execute\` — exécute une proposition si elle est adoptée
- \`get_proposal\` — renvoie les détails de la proposition

## Ce Que Tu Apprendras

- Les mécanismes de gouvernance on-chain
- Le cycle de vie d'une proposition (créer → voter → exécuter)
- Le comptage des votes avec Map<Address, bool>
- La logique de quorum et de seuil d'approbation

## Concepts Clés

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
                learningGoal: 'Construis un système de gouvernance on-chain complet avec propositions et vote',
                hints: [
                    'Dans create_proposal : stocke la description, la date limite, les décomptes oui/non',
                    'Dans vote : vérifie que la proposition est active, enregistre le choix du votant, mets à jour les totaux',
                    'Dans execute : vérifie que la proposition est adoptée (oui > non), marque-la comme exécutée',
                ],
            },
  "reentrancy-guard": {
                title: 'Garde de Réentrance',
                story: `# 🛡️ La Forge des Vulnérabilités

Dans les profondeurs de la Citadelle repose la **Forge des Vulnérabilités**, où les contrats brisés sont restaurés.

*"La vulnérabilité la plus dangereuse dans les contrats intelligents,"* avertit le Sage de la Sécurité, *"est la réentrance. Un contrat qui appelle du code externe tout en conservant un état peut être exploité."*

## Ta Mission

Le contrat de coffre ci-dessous est vulnérable à la réentrance — il met à jour son solde APRÈS avoir envoyé des fonds. Ta tâche est de le corriger en utilisant un motif de **garde mutex** : un drapeau booléen qui empêche la réentrance.

Le code vulnérable comporte :
- \`withdraw\` qui envoie des fonds AVANT de mettre à jour l'état (le bug)
- Aucune protection contre la réentrance

Corrige-le en :
1. Ajoutant une clé de stockage booléenne \`MUTEX\` initialisée à \`false\`
2. Au début de \`withdraw\`, en la mettant à \`true\`
3. À la fin de \`withdraw\`, en la remettant à \`false\`
4. Vérifiant le mutex à l'entrée et en faisant panic s'il est déjà verrouillé

## Ce Que Tu Apprendras

- L'identification de la vulnérabilité de réentrance
- Le motif mutex/garde pour la prévention
- Le motif check-effects-interaction
- Un état d'esprit de développement axé sur la sécurité

## Concepts Clés

\`\`\`rust
// Mutex guard pattern
if env.storage().instance().get(&MUTEX).unwrap_or(false) {
    panic!("Reentrancy detected");
}
env.storage().instance().set(&MUTEX, &true);
// ... vulnerable operations ...
env.storage().instance().set(&MUTEX, &false);
\`\`\``,
                learningGoal: 'Corrige une vulnérabilité de réentrance en utilisant le motif de garde mutex',
                hints: [
                    'Ajoute une constante MUTEX : `const MUTEX: Symbol = symbol_short!("MUTEX");`',
                    'Au début de withdraw, vérifie si mutex est true et fais panic si c\'est le cas',
                    'Mets mutex à true avant la mise à jour du solde, à false après',
                ],
            },
  "access-control-fix": {
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

Corrige-le en :
1. Ajoutant des vérifications \`require_auth()\` sur \`set_fee\` et \`pause\`
2. Lisant l'adresse admin depuis le stockage avant de vérifier l'authentification

## Ce Que Tu Apprendras

- L'identification de la vulnérabilité de contrôle d'accès
- Le placement correct de \`require_auth()\`
- Les motifs de fonctions réservées à l'admin
- Les principes de défense en profondeur

## Concepts Clés

\`\`\`rust
// Correct access control
let admin: Address = env.storage().instance().get(&ADMIN).unwrap();
admin.require_auth();

// Now perform privileged operation
env.storage().instance().set(&FEE, &new_fee);
\`\`\``,
                learningGoal: 'Corrige l\'absence de contrôle d\'accès en ajoutant des vérifications require_auth()',
                hints: [
                    'Dans set_fee : lis ADMIN depuis le stockage, appelle admin.require_auth()',
                    'Dans pause : lis ADMIN depuis le stockage, appelle admin.require_auth()',
                    'La fonction init est correcte — elle stocke déjà l\'admin correctement',
                ],
            },
  "standalone-storage-dojo": {
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
  "standalone-auth-guard": {
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
  "standalone-vector-lab": {
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
};
