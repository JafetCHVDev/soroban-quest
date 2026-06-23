# Mejoras sugeridas para Soroban Quest

Basado en análisis comparativo con NodeGuardians.io — 22 mayo 2026

---

## Quick Wins (cambios rápidos)

1. **`formatDateHeader` en Journal.jsx** — bug: `date.getFullYear()` en condición que nunca se cumple, devuelve `undefined`
2. **Link `/glossary` en Footer.jsx** — no existe esa ruta, da 404
3. **Cálculo de XP inconsistente** — Campaigns.jsx usa `xp/300 + 1`, gameEngine.js usa `500 * (level-1)^1.5`
4. **Links Discord/Telegram** — son `#` placeholders
5. **`codeRecorder.test.js`** — no es test Vitest válido (usa console.log)

## Gameplay (estilo de juego, sin cambiar diseño visual)

- Sistema de inventario con items que afectan progresión
- Más misiones (core del juego, actualmente solo 7)
- Logros/badges más variados
- Tabla de clasificación / Hall of Fame (competitivo)
- Moneda dual (Gold + XP)
- Sistema de hints con costo (gastar gold por pistas)
- Misiones CTF / seguridad ("encuentra la vulnerabilidad")
- Compilación real Soroban (integrar soroban-cli vía API o WASM)
- Misiones standalone fuera de campañas

## Features existentes para potenciar

- **Campaigns.jsx** → más lore, artwork por capítulo, más misiones por campaña
- **SkillTree.jsx** → conectar con items/equipamiento desbloqueable
- **Profile.jsx** → convertir en "Character" con inventario, equipo, stats detalladas
- **Journal.jsx** → "Quest Log" con lore narrativo
- **CodeReplayPlayer.jsx** → feature único que NG no tiene, promocionarlo más
