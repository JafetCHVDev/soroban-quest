/* eslint-disable no-useless-escape */
export const missionLocale = {
  "hello-soroban": {
                title: 'El Primer Contrato',
                story: `# 🌌 El Despertar

Te encuentras ante las puertas de la **Ciudadela Estelar**, una fortaleza reluciente que orbita el confín del espacio conocido. Los Guardianes de Soroban han percibido tu llegada.

*"Otro buscador,"* susurra el Guardián Anciano. *"Para demostrar tu valía, debes forjar tu primer contrato inteligente."*

## Tu Misión

Crea tu primer contrato inteligente de Soroban — un contrato simple con una función \`hello\` que recibe un nombre y devuelve un saludo.

## Lo Que Aprenderás

- Los atributos \`#[contract]\` y \`#[contractimpl]\`
- El tipo \`Env\` — tu puerta de entrada a la blockchain
- El tipo \`Symbol\` para valores tipo cadena
- Cómo devolver un \`Vec<Symbol>\`

## Conceptos Clave

\`\`\`rust
#[contract]          // Marca tu struct como un contrato
#[contractimpl]      // Contiene los métodos del contrato
Env                  // El entorno de ejecución
Symbol               // Un tipo de cadena pequeño y eficiente
\`\`\`

Completa la plantilla de código para pasar todas las verificaciones. ¡Los Guardianes esperan tu primer contrato! ⚔️`,
                learningGoal: 'Crea tu primer contrato inteligente de Soroban con una función hello',
                hints: [
                    'Comienza con `pub fn hello(env: Env, to: Symbol) -> Vec<Symbol>`',
                    'Usa la macro `vec![]` con `&env` como primer argumento',
                    'La línea de retorno completa: `vec![&env, symbol_short!("Hello"), to]`',
                ],
            },
  "greetings-protocol": {
                title: 'Protocolo de Saludos',
                story: `# 📡 La Torre de Señales

La primera puerta está abierta. Avanzas hacia la **Torre de Señales**, donde los mensajes se propagan a través de la red Stellar.

*"La comunicación es poder,"* dice el Guardián de la Torre. *"Tu contrato debe aprender a gestionar datos — aceptar entradas y devolver respuestas estructuradas."*

## Tu Misión

Construye un contrato con varias funciones:
- \`greet\` — recibe un nombre y devuelve un saludo personalizado
- \`count_chars\` — recibe una cadena y devuelve su longitud como u32

## Lo Que Aprenderás

- Varias funciones en un solo contrato
- Trabajar con el tipo \`String\` en Soroban
- Devolver distintos tipos desde las funciones
- La macro \`symbol_short!\`

## Conceptos Clave

\`\`\`rust
String              // Tipo de cadena completo en Soroban
symbol_short!()     // Crea un Symbol a partir de un literal corto
u32                 // Entero sin signo de 32 bits
\`\`\``,
                learningGoal: 'Construye un contrato multifunción con distintos tipos de retorno',
                hints: [
                    'La firma de la función greet: `pub fn greet(env: Env, name: Symbol) -> Vec<Symbol>`',
                    'Para count_chars: `pub fn count_chars(env: Env, text: String) -> u32`',
                    'Usa `text.len()` para obtener la longitud de la cadena',
                ],
            },
  "counter-vault": {
                title: 'La Bóveda Contadora',
                story: `# 🔐 La Bóveda de la Memoria

Desciendes a la **Bóveda de la Memoria**, donde los antiguos guardaron la sabiduría que perdura a través del tiempo.

*"Un contrato sin memoria es como un ser consciente sin alma,"* murmura el Guardián de la Bóveda. *"Aprende a almacenar y recuperar — a recordar."*

## Tu Misión

Crea un contrato contador que conserva su valor:
- \`increment\` — incrementa el contador en 1
- \`get_count\` — devuelve el conteo actual

## Lo Que Aprenderás

- **Almacenamiento persistente** con \`env.storage().instance()\`
- Leer y escribir estado
- El patrón de clave \`Symbol\` para el almacenamiento
- Valores por defecto con \`.unwrap_or()\`

## Conceptos Clave

\`\`\`rust
env.storage().instance().set(&key, &value)  // Escribir
env.storage().instance().get(&key)          // Leer (devuelve Option)
.unwrap_or(default)                         // Valor por defecto si es None
\`\`\``,
                learningGoal: 'Usa almacenamiento persistente para crear un contrato contador con estado',
                hints: [
                    'Usa `env.storage().instance().get(&COUNTER)` para leer el conteo',
                    'Usa `.unwrap_or(0)` para devolver 0 por defecto cuando no existe un valor',
                    'Usa `env.storage().instance().set(&COUNTER, &new_count)` para guardar el nuevo conteo',
                ],
            },
  "guardian-ledger": {
                title: 'Registro del Guardián',
                story: `# 📋 El Registro del Guardián

La Cámara del Consejo brilla con luz ancestral. Ante ti yace el **Registro del Guardián** — un censo de todos los que han demostrado su valía.

*"Para proteger el reino, debes controlar quién puede actuar,"* declara el Líder del Consejo. *"Aprende el arte del control de acceso."*

## Tu Misión

Construye un contrato de registro con control de acceso:
- \`register\` — registra un nuevo guardián (almacena su nombre)
- \`get_guardian\` — recupera el nombre de un guardián por su dirección
- Una dirección \`admin\` que se establece en la inicialización

## Lo Que Aprenderás

- El tipo \`Address\` para identidades de usuario
- \`require_auth()\` para control de acceso
- Trabajar con el tipo \`Map\` para pares clave-valor
- Patrones de inicialización de contratos

## Conceptos Clave

\`\`\`rust
Address                     // Representa una cuenta/identidad
address.require_auth()      // Garantiza que quien llama está autorizado
Map<Address, Symbol>        // Mapeo clave-valor
\`\`\``,
                learningGoal: 'Implementa control de acceso con Address y require_auth',
                hints: [
                    'La función init almacena el admin: `env.storage().instance().set(&ADMIN, &admin)`',
                    'En register, llama a `who.require_auth()` antes de almacenar',
                    'Almacena con: `env.storage().instance().set(&who, &name)`',
                ],
            },
  "token-forge": {
                title: 'La Forja de Tokens',
                story: `# ⚒️ La Forja de Tokens

En lo más profundo de la Ciudadela yace la **Forja de Tokens**, donde los activos digitales se acuñan a partir de pura lógica.

*"La moneda es la savia de toda economía,"* dice el Maestro Forjador. *"Crearás un token que pueda transferirse entre cuentas."*

## Tu Misión

Crea un contrato de token simple:
- \`mint\` — crea tokens para una dirección (solo admin)
- \`balance\` — devuelve el saldo de una dirección
- \`transfer\` — mueve tokens de una dirección a otra

## Lo Que Aprenderás

- Gestión de saldos de tokens
- Lógica de transferencia con autorización
- Funciones restringidas al admin
- Aritmética de enteros para los saldos

## Conceptos Clave

\`\`\`rust
// Patrón de verificación de admin
admin.require_auth();

// Gestión de saldos
let bal: i128 = env.storage().persistent().get(&from).unwrap_or(0);
\`\`\``,
                learningGoal: 'Construye un token básico con funciones mint, balance y transfer',
                hints: [
                    'Para mint: obtén el admin del almacenamiento, llama a admin.require_auth(), luego actualiza el saldo',
                    'Para balance: `env.storage().persistent().get(&account).unwrap_or(0)`',
                    'Para transfer: require_auth del remitente, lee ambos saldos, actualiza ambos',
                ],
            },
  "time-lock": {
                title: 'El Cerrojo Temporal',
                story: `# ⏳ La Puerta del Tiempo

La **Puerta del Tiempo** se alza ante ti, sus mecanismos marcando el ritmo del ledger.

*"El tiempo es un arma,"* dice el Guardián del Tiempo. *"Aprende a bloquear y desbloquear según el paso de los bloques."*

## Tu Misión

Crea una bóveda con cerrojo temporal:
- \`lock\` — bloquea tokens hasta un número de secuencia de ledger específico
- \`unlock\` — libera los tokens si el período de bloqueo ha pasado
- \`get_lock_info\` — devuelve cuándo expira el bloqueo

## Lo Que Aprenderás

- Secuencia / marca de tiempo del ledger para lógica temporal
- Ejecución condicional basada en el estado de la blockchain
- \`env.ledger().sequence()\` para el bloque actual
- Patrones de panic para el manejo de errores

## Conceptos Clave

\`\`\`rust
env.ledger().sequence()  // Número de secuencia del ledger actual
panic!("message")        // Abortar con un error
\`\`\``,
                learningGoal: 'Implementa lógica condicional basada en el tiempo usando la secuencia del ledger',
                hints: [
                    'Usa `env.ledger().sequence()` para obtener el número de ledger actual',
                    'Compara: `if current_seq < unlock_at { panic!("Still locked"); }`',
                    'Limpia el almacenamiento tras desbloquear: `env.storage().instance().remove(&key)`',
                ],
            },
  "multi-party-pact": {
                title: 'Pacto Multipartito',
                story: `# 🤝 El Salón de los Pactos

Has llegado al **Salón de los Pactos**, el desafío final antes de ganar tu lugar entre los Guardianes.

*"El verdadero poder de los contratos inteligentes,"* declara el Gran Anciano, *"es que permiten la confianza entre desconocidos."*

## Tu Misión

Crea un contrato de acuerdo con múltiples firmas:
- \`create_pact\` — crea un acuerdo que requiere N firmas
- \`sign_pact\` — permite que una parte firme el acuerdo
- \`is_complete\` — comprueba si se han reunido todas las firmas requeridas
- \`get_signers\` — devuelve quién ha firmado

## Lo Que Aprenderás

- Estructuras de datos complejas en contratos
- Autorización de múltiples partes
- Conteo y seguimiento con almacenamiento
- Construcción de patrones de gobernanza del mundo real

## Conceptos Clave

\`\`\`rust
// Llevar la cuenta de firmantes
let count: u32 = env.storage().instance()
    .get(&SIGNER_COUNT).unwrap_or(0);

// Almacenar con claves dinámicas
env.storage().instance().set(&signer_key, &true);
\`\`\``,
                learningGoal: 'Construye un contrato de pacto con múltiples firmas y gestión de estado compleja',
                hints: [
                    'En create_pact: almacena la descripción, el número requerido y un conteo inicial de firmas de 0',
                    'En sign_pact: lee el conteo actual, increméntalo en 1, guárdalo de nuevo',
                    'En is_complete: compara signed >= required',
                ],
            },
  "vault-manager": {
                title: 'Gestor de Bóveda',
                story: `# 🏦 La Fortaleza de Datos

Más allá del Salón de los Pactos yace la **Fortaleza de Datos**, donde innumerables saldos de usuarios se almacenan y protegen.

*"Un solo saldo es trivial,"* dice el Arquitecto de la Bóveda. *"Gestionar muchos — ese es el arte de la arquitectura de almacenamiento."*

## Tu Misión

Construye un contrato de bóveda que gestione múltiples saldos de usuarios:
- \`deposit\` — añade fondos al saldo de un usuario (el usuario debe autenticarse)
- \`withdraw\` — resta fondos del saldo de un usuario (el usuario debe autenticarse)
- \`get_balance\` — devuelve el saldo actual de un usuario

## Lo Que Aprenderás

- \`Map<Address, i128>\` para estado multiusuario
- \`Env::require_auth()\` para autorización por usuario
- Almacenamiento persistente con claves complejas
- Patrones aritméticos seguros

## Conceptos Clave

\`\`\`rust
// Map para múltiples saldos
let mut balances: Map<Address, i128> = env.storage()
    .instance()
    .get(&BALANCES)
    .unwrap_or(Map::new(&env));

// Autenticación por usuario
user.require_auth();

// Actualizar y persistir
balances.set(user, &(current + amount));
env.storage().instance().set(&BALANCES, &balances);
\`\`\``,
                learningGoal: 'Construye una bóveda multiusuario con patrón de almacenamiento Map',
                hints: [
                    'Usa Map<Address, i128> para almacenar los saldos de los usuarios',
                    'Llama a user.require_auth() antes de modificar el saldo de un usuario',
                    'Lee el Map del almacenamiento con .unwrap_or(Map::new(&env))',
                    'Para deposit: obtén el saldo actual, suma el monto, guarda de nuevo',
                ],
            },
  "event-emitter": {
                title: 'Emisor de Eventos',
                story: `# 📡 La Baliza de Señales

En lo alto de la Fortaleza de Datos se encuentra la **Baliza de Señales**, transmitiendo eventos a través de la red Stellar.

*"Los contratos que hablan son contratos que se entienden,"* dice el Guardián de la Baliza. *"Los eventos permiten que el mundo sepa lo que ocurrió."*

## Tu Misión

Crea un contrato que almacene datos clave-valor y emita eventos por cada cambio de estado:
- \`set_value\` — almacena un valor y emite un evento con la clave y el valor
- \`get_value\` — recupera un valor almacenado por su clave
- \`get_all_keys\` — devuelve todas las claves almacenadas

## Lo Que Aprenderás

- \`env.events().publish()\` para emitir eventos
- \`Vec<Symbol>\` para seguimiento dinámico de claves
- Arquitectura de contratos basada en eventos
- Patrones de publicador-suscriptor en Stellar

## Conceptos Clave

\`\`\`rust
// Emitir un evento
env.events().publish(
    &symbol_short!("set_value"),
    (key, value),
);

// Rastrear claves en un Vec
let mut keys = env.storage().instance()
    .get(&KEYS)
    .unwrap_or(Vec::new(&env));
keys.push_back(key);
\`\`\``,
                learningGoal: 'Implementa emisión de eventos en un contrato de almacén clave-valor',
                hints: [
                    'Usa env.events().publish() con un tema Symbol y los datos del evento',
                    'Usa Vec<Symbol> para rastrear todas las claves almacenadas',
                    'Añade nuevas claves con keys.push_back(key)',
                ],
            },
  "approval-manager": {
                title: 'Gestor de Aprobaciones',
                story: `# ✋ La Cámara de la Delegación

Dentro de la Fortaleza de Datos yace la **Cámara de la Delegación**, donde la confianza se formaliza mediante autorizaciones.

*"No siempre puedes actuar tú mismo,"* explica el Maestro de la Delegación. *"A veces debes empoderar a otros para que actúen en tu nombre."*

## Tu Misión

Construye un contrato que permita a los usuarios aprobar a otros para gastar en su nombre:
- \`approve\` — el propietario autoriza a un gastador por un monto determinado
- \`transfer_from\` — el gastador transfiere del propietario a un destinatario
- \`allowance\` — consulta cuánto está autorizado a gastar un gastador

## Lo Que Aprenderás

- Patrones de clave-valor anidados (propietario -> gastador -> autorización)
- Autorización delegada
- Claves de almacenamiento con direcciones duales
- Patrón de decremento de autorización

## Conceptos Clave

\`\`\`rust
// Clave de almacenamiento compuesta para autorizaciones
let allowance_key = (owner.clone(), spender.clone());
env.storage().instance().set(&allowance_key, &amount);

// Leer autorización anidada
env.storage().instance().get(&(owner, spender))
    .unwrap_or(0)
\`\`\``,
                learningGoal: 'Implementa un sistema de autorización y transferencia delegada',
                hints: [
                    'Usa una tupla (Address, Address) como clave de almacenamiento compuesta',
                    'En approve: almacena la autorización para el par (owner, spender)',
                    'En transfer_from: require_auth del spender, verifica autorización, decrementa, actualiza saldos',
                ],
            },
  "crowdfund": {
                title: 'Campaña de Crowdfunding',
                story: `# 🎯 La Arena del Crowdforge

Entras en la **Arena del Crowdforge**, donde el poder colectivo da vida a las ideas.

*"Solo eres fuerte,"* anuncia el Subastador. *"Juntos, podéis mover estrellas. Construye una campaña que la gente pueda financiar."*

## Tu Misión

Crea un contrato de crowdfunding:
- \`init\` — establece el objetivo de financiación y la fecha límite (secuencia del ledger)
- \`contribute\` — añade fondos de un contribuyente
- \`check_goal\` — devuelve true si las contribuciones totales >= objetivo
- \`get_total_raised\` — devuelve el total de fondos recaudados

## Lo Que Aprenderás

- Secuencia del ledger para plazos basados en tiempo
- Acumulación de fondos tipo escrow
- Seguimiento de objetivos con comprobaciones condicionales
- Gestión de estado con múltiples contribuyentes

## Conceptos Clave

\`\`\`rust
// Rastrear el total recaudado
let total: i128 = env.storage().instance()
    .get(&TOTAL_RAISED)
    .unwrap_or(0);

env.storage().instance().set(&TOTAL_RAISED, &(total + amount));

// Verificar fecha límite
let deadline: u32 = env.storage().instance()
    .get(&DEADLINE)
    .unwrap_or(0);
if env.ledger().sequence() > deadline { panic!("Campaign ended"); }
\`\`\``,
                learningGoal: 'Construye un contrato de crowdfunding con seguimiento de objetivos y plazos',
                hints: [
                    'En init: almacena el monto objetivo y la secuencia del ledger de la fecha límite',
                    'En contribute: verifica que la fecha límite no haya pasado, añade el monto al total',
                    'En check_goal: compara el total recaudado contra el objetivo',
                ],
            },
  "escrow-agent": {
                title: 'Agente de Escrow',
                story: `# 🤲 El Intercambio de Confianza

En lo profundo de la Arena del Crowdforge se encuentra el **Intercambio de Confianza**, donde se median las transacciones entre desconocidos.

*"La confianza es la moneda más rara,"* dice el Mediador de Escrow. *"Construye un sistema que retenga valor hasta que se cumplan las condiciones."*

## Tu Misión

Crea un contrato de escrow con comprador, vendedor y árbitro:
- \`init\` — configura el escrow con las direcciones del comprador, vendedor y árbitro
- \`deposit\` — el comprador deposita fondos en el escrow
- \`release\` — el árbitro libera los fondos al vendedor
- \`refund\` — el árbitro reembolsa al comprador

## Lo Que Aprenderás

- Inicialización de contratos con múltiples partes
- Patrones de autorización con tres actores
- Máquina de estados para el ciclo de vida del escrow
- Patrones de resolución de disputas

## Conceptos Clave

\`\`\`rust
// Init con múltiples partes
pub fn init(env: Env, buyer: Address, seller: Address, arbiter: Address) {
    env.storage().instance().set(&BUYER, &buyer);
    env.storage().instance().set(&SELLER, &seller);
    env.storage().instance().set(&ARBITER, &arbiter);
}

// Funciones solo para el árbitro
arbiter.require_auth();
\`\`\``,
                learningGoal: 'Implementa un contrato de escrow multipartito con resolución de disputas',
                hints: [
                    'En init: almacena las direcciones de comprador, vendedor y árbitro',
                    'En deposit: require_auth del comprador y almacena el monto',
                    'En release: require_auth del árbitro, transfiere al vendedor',
                    'En refund: require_auth del árbitro, devuelve al comprador',
                ],
            },
  "subscription": {
                title: 'Gestor de Suscripciones',
                story: `# 🔄 El Motor Recurrente

En el corazón del distrito de Protocolos Avanzados palpita el **Motor Recurrente**, alimentando acuerdos periódicos automatizados.

*"Los contratos más poderosos son los que funcionan sin atención constante,"* dice el Cuidador del Motor. *"Construye una suscripción que cobre pagos recurrentes."*

## Tu Misión

Crea un contrato de gestión de suscripciones:
- \`subscribe\` — el usuario se suscribe a un plan (almacena plan, próxima facturación)
- \`collect\` — cobra la cuota de suscripción si la facturación está vencida
- \`cancel\` — cancela la suscripción
- \`get_subscription\` — devuelve la información de suscripción de un usuario

## Lo Que Aprenderás

- Lógica de facturación recurrente con secuencia del ledger
- Gestión de estado de suscripciones
- Patrones de cancelación y reembolso
- Cálculos de intervalos de tiempo

## Conceptos Clave

\`\`\`rust
// Rastrear período de suscripción
let interval: u32 = 1000; // facturación cada ~1000 ledgers
let next_billing: u32 = env.ledger().sequence() + interval;

// Verificar si la facturación está vencida
if env.ledger().sequence() >= next_billing {
    // cobrar pago
}
\`\`\``,
                learningGoal: 'Construye un contrato de suscripción recurrente con facturación periódica',
                hints: [
                    'En subscribe: almacena el plan, establece next_billing a sequence + intervalo',
                    'En collect: verifica si sequence >= next_billing, si es así cobra y actualiza next_billing',
                    'En cancel: limpia los datos de suscripción del almacenamiento',
                ],
            },
  "flash-loan": {
                title: 'Pool de Préstamos Flash',
                story: `# ⚡ La Bóveda del Relámpago

En la capa más profunda de la Ciudadela yace la **Bóveda del Relámpago**, donde el capital se mueve a la velocidad de la luz.

*"Los préstamos flash son la prueba definitiva del diseño de contratos,"* dice el Arquero del Relámpago. *"Pide prestado, úsalo y devuélvelo en una sola transacción."*

## Tu Misión

Construye un pool de préstamos flash simplificado:
- \`init\` — establece el saldo del pool
- \`flash_loan\` — pide prestado del pool (debe devolverse dentro de la llamada)
- \`get_pool_balance\` — devuelve el saldo actual del pool
- \`repay\` — devuelve el monto prestado más una pequeña comisión

## Lo Que Aprenderás

- Mecánica de préstamos flash (simplificada para validación)
- Gestión del saldo del pool
- Seguimiento del ciclo de vida del préstamo
- Patrones de comisión al devolver

## Conceptos Clave

\`\`\`rust
// Rastrear préstamo activo
let loan: i128 = env.storage().instance()
    .get(&(borrower.clone(), LOAN_AMOUNT))
    .unwrap_or(0);

// Devolver con comisión
let fee = amount / 100; // 1% de comisión
env.storage().instance().set(&POOL, &(pool_bal + amount + fee));
\`\`\``,
                learningGoal: 'Construye un contrato de pool de préstamos flash simplificado',
                hints: [
                    'En init: almacena el saldo inicial del pool',
                    'En flash_loan: verifica que el pool tenga suficiente, descuenta del pool, registra el préstamo',
                    'En repay: verifica que exista el préstamo, devuelve fondos más comisión al pool, limpia el préstamo',
                ],
            },
  "permissions-rbac": {
                title: 'RBAC de Permisos',
                story: `# 🛡️ El Salón de los Roles

Más allá de la Bóveda del Relámpago se alza el **Salón de los Roles**, donde el acceso se gobierna mediante permisos estructurados.

*"No todos los que vagan están destinados a acceder a todas las puertas,"* declara el Maestro de Roles. *"Construye un sistema donde los roles definan lo que uno puede hacer."*

## Tu Misión

Crea un contrato de control de acceso basado en roles:
- \`grant_role\` — el admin concede un rol a un usuario
- \`revoke_role\` — el admin revoca un rol de un usuario
- \`has_role\` — verifica si un usuario tiene un rol específico
- \`get_admin\` — devuelve el admin del contrato

## Lo Que Aprenderás

- Patrones de control de acceso basado en roles (RBAC)
- Funciones privilegiadas solo para admin
- Claves compuestas para membresía de roles
- Arquitectura de permisos flexible

## Conceptos Clave

\`\`\`rust
// Conceder un rol
let role_key = (user.clone(), role.clone());
env.storage().instance().set(&role_key, &true);

// Verificar membresía de rol
env.storage().instance()
    .get(&(user.clone(), role.clone()))
    .unwrap_or(false)
\`\`\``,
                learningGoal: 'Implementa un contrato de control de acceso basado en roles',
                hints: [
                    'En init: almacena la dirección del admin',
                    'En grant_role: require_auth del admin, almacena la membresía del rol para el usuario',
                    'En revoke_role: require_auth del admin, elimina la membresía del rol',
                    'En has_role: verifica si la clave del rol existe y es true',
                ],
            },
  "oracle-feed": {
                title: 'Feed de Oráculo',
                story: `# 📊 La Aguja del Oráculo

En la cúspide del distrito de Sistemas de Producción se alza la **Aguja del Oráculo**, donde los datos fuera de la cadena entran en la blockchain.

*"Los contratos inteligentes son ciegos sin datos,"* dice el Sabio del Oráculo. *"Construye un puente entre los mundos on-chain y off-chain."*

## Tu Misión

Crea un contrato de oráculo de precios:
- \`update_price\` — el admin actualiza el precio de un par de activos
- \`get_price\` — devuelve el precio actual de un par de activos
- \`get_last_updated\` — devuelve cuándo se actualizó el precio por última vez
- \`get_all_assets\` — devuelve todos los pares de activos rastreados

## Lo Que Aprenderás

- Patrones de alimentación de datos de oráculo
- Funciones de actualización solo para admin
- Seguimiento de marcas de tiempo/secuencia
- Gestión de pares de activos con Vec<Symbol>

## Conceptos Clave

\`\`\`rust
// Almacenar precio con metadatos
pub fn update_price(env: Env, asset: Symbol, price: i128) {
    admin.require_auth();
    env.storage().instance().set(&asset, &price);
    env.storage().instance()
        .set(&(asset.clone(), TIMESTAMP), &env.ledger().sequence());
}
\`\`\``,
                learningGoal: 'Construye un oráculo de precios on-chain con actualizaciones del admin',
                hints: [
                    'En update_price: require_auth del admin, almacena el precio y la secuencia',
                    'En get_price: busca y devuelve el precio del activo',
                    'En get_last_updated: devuelve la secuencia almacenada para el activo',
                    'En get_all_assets: usa un rastreador Vec<Symbol> similar al event-emitter',
                ],
            },
  "governor-simple": {
                title: 'Gobernador Simple',
                story: `# 🏛️ El Salón de la Gobernanza

La cámara final aguarda — el **Salón de la Gobernanza**, donde el destino de todo el reino se decide por la voluntad colectiva.

*"Los mejores contratos inteligentes empoderan a las comunidades para gobernarse a sí mismas,"* proclama el Gran Anciano. *"Construye un sistema donde las propuestas se convierten en ley mediante la votación."*

## Tu Misión

Crea un contrato de gobernanza con propuestas y votación:
- \`create_proposal\` — crea una propuesta con una descripción y un período de votación
- \`vote\` — emite un voto (sí/no) sobre una propuesta activa
- \`execute\` — ejecuta una propuesta si se aprueba
- \`get_proposal\` — devuelve los detalles de la propuesta

## Lo Que Aprenderás

- Mecanismos de gobernanza on-chain
- Ciclo de vida de propuestas (crear → votar → ejecutar)
- Conteo de votos con Map<Address, bool>
- Lógica de quórum y umbral de aprobación

## Conceptos Clave

\`\`\`rust
// Rastrear votos por propuesta
let mut votes: Map<Address, bool> = env.storage().instance()
    .get(&VOTES)
    .unwrap_or(Map::new(&env));
votes.set(&voter, &support);

// Contar aprobación
let yes_votes: u32 = /* contar votos donde value es true */
let no_votes: u32 = /* contar votos donde value es false */
\`\`\``,
                learningGoal: 'Construye un sistema de gobernanza on-chain completo con propuestas y votación',
                hints: [
                    'En create_proposal: almacena descripción, fecha límite, conteos de sí/no',
                    'En vote: verifica que la propuesta esté activa, registra la elección del votante, actualiza los totales',
                    'En execute: verifica que la propuesta se haya aprobado (sí > no), márcala como ejecutada',
                ],
            },
  "reentrancy-guard": {
                title: 'Guardia de Reentrancia',
                story: `# 🛡️ La Forja de Vulnerabilidades

En las profundidades de la Ciudadela yace la **Forja de Vulnerabilidades**, donde los contratos rotos se restauran.

*"La vulnerabilidad más peligrosa en los contratos inteligentes,"* advierte el Sabio de Seguridad, *"es la reentrancia. Un contrato que llama código externo mientras mantiene estado puede ser explotado."*

## Tu Misión

El contrato de bóveda que ves abajo es vulnerable a reentrancia — actualiza su saldo DESPUÉS de enviar fondos. Tu trabajo es arreglarlo usando un patrón de **guardia mutex**: una bandera booleana que previene la reentrancia.

El código vulnerable tiene:
- \`withdraw\` que envía fondos ANTES de actualizar el estado (el bug)
- Sin protección de reentrancia

Arrégialo:
1. Añade una clave de almacenamiento \`MUTEX\` booleana inicializada a \`false\`
2. Al inicio de \`withdraw\`, establécela a \`true\`
3. Al final de \`withdraw\`, vuelve a \`false\`
4. Verifica el mutex al entrar y haz panic si ya está bloqueado

## Lo Que Aprenderás

- Identificación de vulnerabilidad de reentrancia
- Patrón de guardia mutex para prevención
- Patrón check-effects-interaction
- Mentalidad de desarrollo orientada a la seguridad

## Conceptos Clave

\`\`\`rust
// Patrón de guardia mutex
if env.storage().instance().get(&MUTEX).unwrap_or(false) {
    panic!("Reentrancy detected");
}
env.storage().instance().set(&MUTEX, &true);
// ... operaciones vulnerables ...
env.storage().instance().set(&MUTEX, &false);
\`\`\``,
                learningGoal: 'Arregla una vulnerabilidad de reentrancia usando el patrón de guardia mutex',
                hints: [
                    'Añade una constante MUTEX: `const MUTEX: Symbol = symbol_short!("MUTEX");`',
                    'Al inicio de withdraw, verifica si mutex es true y haz panic si es así',
                    'Establece mutex a true antes de actualizar el saldo, false después',
                ],
            },
  "access-control-fix": {
                title: 'Corrección de Control de Acceso',
                story: `# 🔓 La Brecha de Permisos

La **Brecha de Permisos** es un campo de entrenamiento donde se repara la lógica de autorización rota.

*"La segunda vulnerabilidad más común,"* explica el Sabio de Seguridad, *"es la falta de control de acceso. Funciones que deberían estar restringidas a administradores son invocables por cualquiera."*

## Tu Misión

El contrato de abajo tiene una dirección \`admin\` almacenada pero NUNCA usa \`require_auth()\` en funciones privilegiadas. Tu trabajo es añadir el control de acceso adecuado.

El código vulnerable tiene:
- Una constante \`ADMIN\` definida pero nunca verificada
- \`set_fee\` y \`pause\` invocables por cualquiera
- Sin llamadas a \`require_auth()\` en ninguna parte

Arrégialo:
1. Añade comprobaciones \`require_auth()\` en \`set_fee\` y \`pause\`
2. Lee la dirección admin del almacenamiento antes de verificar la autenticación

## Lo Que Aprenderás

- Identificación de vulnerabilidad de control de acceso
- Colocación correcta de \`require_auth()\`
- Patrones de funciones solo para admin
- Principios de defensa en profundidad

## Conceptos Clave

\`\`\`rust
// Control de acceso correcto
let admin: Address = env.storage().instance().get(&ADMIN).unwrap();
admin.require_auth();

// Ahora realiza la operación privilegiada
env.storage().instance().set(&FEE, &new_fee);
\`\`\``,
                learningGoal: 'Arregla la falta de control de acceso añadiendo comprobaciones require_auth()',
                hints: [
                    'En set_fee: lee ADMIN del almacenamiento, llama a admin.require_auth()',
                    'En pause: lee ADMIN del almacenamiento, llama a admin.require_auth()',
                    'La función init está bien — ya almacena el admin correctamente',
                ],
            },
  "standalone-storage-dojo": {
                title: 'Dojo de Almacenamiento',
                story: `# 🥋 Dojo de Almacenamiento

Bienvenido al **Dojo de Almacenamiento** — una sala de entrenamiento tranquila fuera del camino de campaña.

*"Antes de dominar protocolos complejos, practica lo básico hasta que sea un reflejo,"* dice el Maestro del Dojo.

## Tu Misión

Construye un contrato mínimo que pueda guardar y recuperar un solo valor:

- \`set_value\` — almacena un \`u32\` bajo una clave fija
- \`get_value\` — recupera el valor almacenado (por defecto \`0\` si está vacío)

## Lo Que Aprenderás

- \`env.storage().instance().set(&key, &value)\` — escribir
- \`env.storage().instance().get(&key).unwrap_or(0)\` — leer con valor por defecto
- La macro \`symbol_short!\` para claves de almacenamiento

## Conceptos Clave

\`\`\`rust
const VALUE: Symbol = symbol_short!("VALUE");
env.storage().instance().set(&VALUE, &value);
env.storage().instance().get(&VALUE).unwrap_or(0)
\`\`\``,
                learningGoal: 'Practica el almacenamiento básico instance: guardar y obtener un valor u32',
                hints: [
                    'Define `const VALUE: Symbol = symbol_short!("VALUE");` al inicio',
                    'En set_value: `env.storage().instance().set(&VALUE, &value)`',
                    'En get_value: `env.storage().instance().get(&VALUE).unwrap_or(0)`',
                ],
            },
  "standalone-auth-guard": {
                title: 'Ejercicio de Guardia de Autorización',
                story: `# 🛡️ Ejercicio de Guardia de Autorización

Entra al **Puesto de Guardia** — un ejercicio aislado de autorización.

*"Cada cambio de estado debe probar quién lo solicitó,"* advierte el Capitán de la Guardia.

## Tu Misión

Construye un contrato que proteja una acción privilegiada con \`require_auth\`:

- \`init\` — guarda una dirección admin
- \`protected_action\` — requiere auth del llamante, cambia la bandera \`DONE\` a \`true\`
- \`is_done\` — devuelve si la bandera está activa

## Lo Que Aprenderás

- El tipo \`Address\` para identidades
- Guardia \`address.require_auth()\`
- Almacenar y verificar una bandera booleana

## Conceptos Clave

\`\`\`rust
let admin: Address = env.storage().instance().get(&ADMIN).unwrap();
admin.require_auth();
env.storage().instance().set(&DONE, &true);
\`\`\``,
                learningGoal: 'Practica el control require_auth para un cambio de estado protegido',
                hints: [
                    'Guarda admin en init: `env.storage().instance().set(&ADMIN, &admin)`',
                    'En protected_action: verifica con `user.require_auth()`',
                    'Activa la bandera: `env.storage().instance().set(&DONE, &true)`',
                ],
            },
  "standalone-vector-lab": {
                title: 'Laboratorio de Vectores',
                story: `# 🧪 Laboratorio de Vectores

Entra al **Laboratorio de Vectores** — un taller práctico para la colección más flexible de Soroban.

*"Los vectores contienen a los muchos, ordenan a los muchos, devuelven a los muchos,"* dice el Técnico de Laboratorio.

## Tu Misión

Crea un contrato que construya e inspeccione Vectores:

- \`make_sequence\` — devuelve un \`Vec<u32>\` que contiene \`[1, 2, 3]\`
- \`get_length\` — recibe un \`Vec<u32>\` y devuelve su longitud como \`u32\`

## Lo Que Aprenderás

- El tipo \`Vec\` y la macro \`vec![&env, ...]\`
- \`Vec::len()\` para la longitud
- Pasar Vectores entre funciones

## Conceptos Clave

\`\`\`rust
use soroban_sdk::{vec, Vec};
vec![&env, 1u32, 2u32, 3u32]
vals.len()
\`\`\``,
                learningGoal: 'Practica crear e inspeccionar colecciones Vec<u32>',
                hints: [
                    'Usa `vec![&env, 1u32, 2u32, 3u32]` para construir la secuencia',
                    'Firma para get_length: `pub fn get_length(env: Env, vals: Vec<u32>) -> u32`',
                    'Devuelve la longitud con `vals.len()`',
                ],
            },
};
