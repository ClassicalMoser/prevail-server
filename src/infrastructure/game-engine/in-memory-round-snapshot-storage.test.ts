import { createEmptyGameState } from '@classicalmoser/prevail-rules/domain';
import { createInMemoryRoundSnapshotStorage } from './in-memory-round-snapshot-storage';

describe('createInMemoryRoundSnapshotStorage function', () => {
  it(
    'saves and loads a round snapshot under the game and round this test set',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const storage = createInMemoryRoundSnapshotStorage({});
      // An empty mini-mode state stands for the board at the start of round 2.
      const state = createEmptyGameState('mini');
      const saved = await storage.saveRoundSnapshot('game-1', 2, state);
      const loaded = await storage.getRoundSnapshot('game-1', 2);

      // The snapshot is stored under game-1 and round 2.
      expect(saved).toStrictEqual({ data: undefined, result: true });
      // The same game and round return the same state.
      expect(loaded).toStrictEqual({ data: state, result: true });
    },
  );
});
