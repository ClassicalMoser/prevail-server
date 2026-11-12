import { gameSessionStore } from '@testing';
import { loadAuthoritativeGame } from './load-authoritative-game';

describe('loadAuthoritativeGame function', () => {
  it(
    'returns undefined when storage has no game',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const store = gameSessionStore();
      // Storage answers with nothing, as for an id it has never stored.
      vi.mocked(store.enginePorts.gameStorage.getGame).mockImplementation(
        async () => {
          /* storage has no game */
        },
      );

      const loaded = await loadAuthoritativeGame(store, 'game-1', 'mini');

      expect(loaded).toBeUndefined();
    },
  );

  it(
    'returns undefined when storage reports a failure',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const store = gameSessionStore();
      // Storage answers with a failure result; callers treat that as a game that is gone.
      vi.mocked(store.enginePorts.gameStorage.getGame).mockResolvedValue({
        errorReason: 'missing',
        result: false,
      });

      const loaded = await loadAuthoritativeGame(store, 'game-1', 'mini');

      expect(loaded).toBeUndefined();
    },
  );
});
