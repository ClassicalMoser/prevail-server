import type { RoundSnapshotStorage } from '@classicalmoser/prevail-rules/application';
import type { GameState } from '@classicalmoser/prevail-rules/domain';
import type { InMemoryEnginePortHooks } from './in-memory-engine-port-hooks';
import { ok, okVoid } from './port-response';
import { streamKey } from './stream-key';

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

export { createInMemoryRoundSnapshotStorage };
