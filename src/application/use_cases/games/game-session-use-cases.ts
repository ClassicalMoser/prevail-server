import { createGameRunner } from '@classicalmoser/prevail-rules/application';
import type { EnginePorts } from '@classicalmoser/prevail-rules/application';
import type { Event, GameState } from '@classicalmoser/prevail-rules/domain';
import type { GameSessionUseCasesPort, OwnedArmyStorage } from '@ports';
import { createVsBotGame } from './create-vs-bot-game';
import { DEFAULT_BOT_TURN_GAP_MS } from '@application/composable/game-session/default-bot-turn-gap';
import { fanoutEvent } from '@application/composable/game-session/fanout-event';
import { fanoutRoundSnapshot } from '@application/composable/game-session/fanout-round-snapshot';
import type { GameSessionStore } from '@application/composable/game-session/game-session-store';
import { getSeatSubject } from './get-seat-subject';
import { registerSeatConnection } from './register-seat-connection';
import { sendGameSnapshot } from './send-game-snapshot';
import { submitPlayerChoice } from './submit-player-choice';
import { unregisterSeatConnection } from './unregister-seat-connection';

interface GameSessionUseCasesDeps {
  enginePorts: EnginePorts;
  ownedArmyStorage: OwnedArmyStorage;
  /** Gap between consecutive bot submits. Defaults to 1s; use `0` in tests. */
  botTurnGapMs?: number;
}

/** Session API plus fanout hooks for engine port wiring. */
interface GameSessionRuntime extends GameSessionUseCasesPort {
  fanoutEvent: (gameId: string, event: Event) => void;
  fanoutRoundSnapshot: (
    gameId: string,
    roundNumber: number,
    gameState: GameState,
  ) => Promise<void>;
}

/**
 * Build the live-game session API for this process.
 *
 * Maps and the rules runner live here. Each operation is a separate module
 * that receives that store. Fan-out hooks are returned alongside the port so
 * composition can pass them to the in-memory engine.
 *
 * @param deps - Engine ports, army storage, and an optional bot turn gap.
 * @returns Use cases plus the two fan-out hooks.
 */
const createGameSessionUseCases = (
  deps: GameSessionUseCasesDeps,
): GameSessionRuntime => {
  const store: GameSessionStore = {
    botTurnGapMs: deps.botTurnGapMs ?? DEFAULT_BOT_TURN_GAP_MS,
    connections: new Map(),
    enginePorts: deps.enginePorts,
    metaByGameId: new Map(),
    ownedArmyStorage: deps.ownedArmyStorage,
    runner: createGameRunner(deps.enginePorts),
    submitQueues: new Map(),
  };

  return {
    createVsBotGame: (subject, body) => createVsBotGame(store, subject, body),
    fanoutEvent: (gameId, event) => fanoutEvent(store, gameId, event),
    fanoutRoundSnapshot: (gameId, roundNumber, gameState) =>
      fanoutRoundSnapshot({ gameId, gameState, roundNumber, store }),
    getSeatSubject: (gameId, side) => getSeatSubject(store, gameId, side),
    registerSeatConnection: (connection) =>
      registerSeatConnection(store, connection),
    sendGameSnapshot: (connection) => sendGameSnapshot(store, connection),
    submitPlayerChoice: (input) => submitPlayerChoice(store, input),
    unregisterSeatConnection: (connection) =>
      unregisterSeatConnection(store, connection),
  };
};

export type { GameSessionRuntime, GameSessionUseCasesDeps };
export { BOT_SUBJECT } from '@application/composable/game-session/bot-subject';
export { createGameSessionUseCases };
