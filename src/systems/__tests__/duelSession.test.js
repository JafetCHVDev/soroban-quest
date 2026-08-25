import { describe, expect, it } from "vitest";
import { createDuelState, DUEL_PHASES, normalizeDuelProgress, transitionDuel } from "../duelSession";

describe("duel state machine", () => {
  it("moves from waiting through countdown into a race", () => {
    let state = transitionDuel(createDuelState(), { type: "OPPONENT_JOINED" });
    expect(state.phase).toBe(DUEL_PHASES.COUNTDOWN);
    state = transitionDuel(state, { type: "COUNTDOWN_TICK" });
    state = transitionDuel(state, { type: "COUNTDOWN_TICK" });
    state = transitionDuel(state, { type: "COUNTDOWN_TICK" });
    expect(state.phase).toBe(DUEL_PHASES.IN_PROGRESS);
  });

  it("allows a winner or a forfeit only during an active race", () => {
    const waiting = createDuelState();
    expect(transitionDuel(waiting, { type: "WIN", playerId: "a" })).toEqual(waiting);
    const racing = { ...waiting, phase: DUEL_PHASES.IN_PROGRESS };
    expect(transitionDuel(racing, { type: "WIN", playerId: "a" })).toMatchObject({ phase: DUEL_PHASES.FINISHED, winnerId: "a" });
    expect(transitionDuel(racing, { type: "FORFEIT", winnerId: "a" }).phase).toBe(DUEL_PHASES.FORFEIT);
  });
});

describe("duel progress", () => {
  it("clamps progress and never exposes code", () => {
    expect(normalizeDuelProgress({ passed: 9, code: "secret" }, 3)).toEqual({ passed: 3, total: 3 });
    expect(normalizeDuelProgress({ passed: -2 }, 3)).toEqual({ passed: 0, total: 3 });
  });
});