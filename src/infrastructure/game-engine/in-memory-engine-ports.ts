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

const ok = <T>(data: T): PortResponse<T> => {
  const response: PortResponse<T> = { data, result: true };
  return response;
};

const okVoid = (): PortResponse<void> =>
  ({ data: undefined, result: true }) as PortResponse<void>;

const fail = (errorReason: string): PortResponse<never> => {
  const response: PortResponse<never> = {
    errorReason,
    result: false,
  };
  return response;
};

const createInMemoryGameStorage = (): GameStorage => {
  const games = new Map<string, Game>();

  return {
    getGame: async (gameId, gameMode) => {
      const game = games.get(gameId);
      if (game === undefined) {
        return;
      }
      if (game.gameMode !== gameMode) {
        const response = fail('Game mode mismatch');
        return response;
      }
      const response = ok(game);
      return response;
    },
    saveNewGame: async (game) => {
      if (games.has(game.id)) {
        const response = fail('Game already exists');
        return response;
      }
      games.set(game.id, game);
      const response = okVoid();
      return response;
    },
    updateGameState: async (gameId, gameState) => {
      const existing = games.get(gameId);
      if (existing === undefined) {
        const response = fail('Game not found');
        return response;
      }
      const next = {
        ...existing,
        gameState,
      } as GameForVisibility<'authoritative'>;
      games.set(gameId, next);
      const response = okVoid();
      return response;
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
      const response = ok(stream);
      return response;
    },
    addEventToStream: async (gameId, roundNumber, event) => {
      const key = streamKey(gameId, roundNumber);
      const current = streams.get(key);
      if (current === undefined) {
        const response = fail('Event stream not initialized');
        return response;
      }
      const next = [...current, event];
      streams.set(key, next);
      hooks.onEventAppended?.(gameId, roundNumber, event);
      const response = ok(next);
      return response;
    },
    flushEventStream: async (gameId, roundNumber) => {
      streams.delete(streamKey(gameId, roundNumber));
      const response = okVoid();
      return response;
    },
    newEventStream: async (gameId, roundNumber) => {
      const key = streamKey(gameId, roundNumber);
      if (streams.has(key)) {
        const response = fail('Event stream already exists');
        return response;
      }
      const empty: Event[] = [];
      streams.set(key, empty);
      const response = ok(empty);
      return response;
    },
    truncateEventStream: async (gameId, roundNumber, firstEventToRemove) => {
      const key = streamKey(gameId, roundNumber);
      const current = streams.get(key);
      if (current === undefined) {
        const response = fail('Event stream not initialized');
        return response;
      }
      const next = current.slice(0, firstEventToRemove);
      streams.set(key, next);
      const response = ok(next);
      return response;
    },
  };
};

const createInMemoryRoundSnapshotStorage = (
  hooks: InMemoryEnginePortHooks,
): RoundSnapshotStorage => {
  const snapshots = new Map<string, GameState>();

  return {
    getRoundSnapshot: async (gameId, roundNumber) => {
      const snapshot = ok(snapshots.get(streamKey(gameId, roundNumber)));
      return snapshot;
    },
    saveRoundSnapshot: async (gameId, roundNumber, gameState) => {
      snapshots.set(streamKey(gameId, roundNumber), gameState);
      hooks.onRoundSnapshotSaved?.(gameId, roundNumber, gameState);
      const response = okVoid();
      return response;
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
