import { createGameRunner } from '@classicalmoser/prevail-rules/application';
import type { Army } from '@classicalmoser/prevail-rules/domain';
import type { EnginePorts } from '@classicalmoser/prevail-rules/application';
import { fanoutEvent, fanoutRoundSnapshot } from '@application';
import type { GameSessionStore } from '@application';
import { createInMemoryEnginePorts } from '@infrastructure';
import { ownedArmyStorage } from './game-session-armies';

/**
 * A live-game store as the session factory builds it: in-memory engine ports
 * whose writes fan out to sockets, and the real rules runner, with the given armies as the creator's owned list.
 *
 * A use-case test calls the function under test with this store, instead of
 * building the whole session factory to reach it. Bot turns run with no delay.
 *
 * @param armies - The creator's owned armies, by id.
 * @param options - A pause between bot turns, when the test needs one; none by default.
 * @returns The store, and its engine ports for reading back what was saved.
 */
const liveGameStore = (
  armies: Record<string, Army>,
  options: { botTurnGapMs?: number } = {},
): { store: GameSessionStore; enginePorts: EnginePorts } => {
  // The engine's write hooks need the store that holds the engine ports, as in
  // composition, so they read it through a slot filled just after.
  const slot: { store?: GameSessionStore } = {};
  const enginePorts = createInMemoryEnginePorts({
    onEventAppended: (gameId, _round, event) => {
      if (slot.store !== undefined) {
        fanoutEvent(slot.store, gameId, event);
      }
    },
    onRoundSnapshotSaved: (gameId, roundNumber, gameState) => {
      if (slot.store !== undefined) {
        fanoutRoundSnapshot({
          gameId,
          gameState,
          roundNumber,
          store: slot.store,
        });
      }
    },
  });
  const store: GameSessionStore = {
    botTurnGapMs: options.botTurnGapMs ?? 0,
    connections: new Map(),
    enginePorts,
    metaByGameId: new Map(),
    ownedArmyStorage: ownedArmyStorage(armies),
    runner: createGameRunner(enginePorts),
    submitQueues: new Map(),
    watchers: new Map(),
  };
  slot.store = store;
  return { enginePorts, store };
};

export { liveGameStore };
