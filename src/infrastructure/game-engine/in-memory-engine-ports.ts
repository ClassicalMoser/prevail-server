import type {
  EnginePorts,
  EventStreamStorage,
  GameStorage,
  PortResponse,
  RoundSnapshotStorage,
} from '@classicalmoser/prevail-rules/application';
import type {
  Event,
  Game,
  GameForVisibility,
  GameState,
} from '@classicalmoser/prevail-rules/domain';

/** Host hooks for WS fanout (event-stream + round-reconcile protocol). */
interface InMemoryEnginePortHooks {
  onEventAppended?: (gameId: string, roundNumber: number, event: Event) => void;
  onRoundSnapshotSaved?: (
    gameId: string,
    roundNumber: number,
    gameState: GameState,
  ) => void;
}

const ok = <T>(data: T): PortResponse<T> => ({ data, result: true });
const okVoid = (): PortResponse<void> =>
  ({ data: undefined, result: true }) as PortResponse<void>;
const fail = (errorReason: string): PortResponse<never> => ({
  errorReason,
  result: false,
});

const createInMemoryGameStorage = (): GameStorage => {
  const games = new Map<string, Game>();

  return {
    getGame: async (gameId, gameMode) => {
      const game = games.get(gameId);
      if (game === undefined) {
        return;
      }
      if (game.gameMode !== gameMode) {
        return fail('Game mode mismatch');
      }
      return ok(game);
    },
    saveNewGame: async (game) => {
      if (games.has(game.id)) {
        return fail('Game already exists');
      }
      games.set(game.id, game);
      return okVoid();
    },
    updateGameState: async (gameId, gameState) => {
      const existing = games.get(gameId);
      if (existing === undefined) {
        return fail('Game not found');
      }
      const next = {
        ...existing,
        gameState,
      } as GameForVisibility<'authoritative'>;
      games.set(gameId, next);
      return okVoid();
    },
  };
};

const streamKey = (gameId: string, roundNumber: number): string =>
  `${gameId}:${roundNumber}`;

const createInMemoryEventStreamStorage = (
  hooks: InMemoryEnginePortHooks,
): EventStreamStorage => {
  const streams = new Map<string, Event[]>();

  return {
    getEventStream: async (gameId, roundNumber) => {
      const stream = streams.get(streamKey(gameId, roundNumber));
      return ok(stream);
    },
    addEventToStream: async (gameId, roundNumber, event) => {
      const key = streamKey(gameId, roundNumber);
      const current = streams.get(key);
      if (current === undefined) {
        return fail('Event stream not initialized');
      }
      const next = [...current, event];
      streams.set(key, next);
      hooks.onEventAppended?.(gameId, roundNumber, event);
      return ok(next);
    },
    flushEventStream: async (gameId, roundNumber) => {
      streams.delete(streamKey(gameId, roundNumber));
      return okVoid();
    },
    newEventStream: async (gameId, roundNumber) => {
      const key = streamKey(gameId, roundNumber);
      if (streams.has(key)) {
        return fail('Event stream already exists');
      }
      const empty: Event[] = [];
      streams.set(key, empty);
      return ok(empty);
    },
    truncateEventStream: async (gameId, roundNumber, firstEventToRemove) => {
      const key = streamKey(gameId, roundNumber);
      const current = streams.get(key);
      if (current === undefined) {
        return fail('Event stream not initialized');
      }
      const next = current.slice(0, firstEventToRemove);
      streams.set(key, next);
      return ok(next);
    },
  };
};

const createInMemoryRoundSnapshotStorage = (
  hooks: InMemoryEnginePortHooks,
): RoundSnapshotStorage => {
  const snapshots = new Map<string, GameState>();

  return {
    getRoundSnapshot: async (gameId, roundNumber) =>
      ok(snapshots.get(streamKey(gameId, roundNumber))),
    saveRoundSnapshot: async (gameId, roundNumber, gameState) => {
      snapshots.set(streamKey(gameId, roundNumber), gameState);
      hooks.onRoundSnapshotSaved?.(gameId, roundNumber, gameState);
      return okVoid();
    },
  };
};

/**
 * In-memory {@link EnginePorts} for live games (no durable persistence).
 * Optional hooks drive WebSocket fanout on event append / round snapshot.
 */
const createInMemoryEnginePorts = (
  hooks: InMemoryEnginePortHooks = {},
): EnginePorts => ({
  eventStreamStorage: createInMemoryEventStreamStorage(hooks),
  gameStateSubscribers: [],
  gameStorage: createInMemoryGameStorage(),
  roundSnapshotStorage: createInMemoryRoundSnapshotStorage(hooks),
});

export type { InMemoryEnginePortHooks };
export { createInMemoryEnginePorts };
