import { gameSessionStore } from '@testing';
import { loadAuthoritativeState } from './load-authoritative-state';

describe('loadAuthoritativeState function', () => {
  it(
    'returns undefined when the game cannot be loaded',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const store = gameSessionStore();
      vi.mocked(store.enginePorts.gameStorage.getGame).mockImplementation(
        async () => {
          /* storage has no game */
        },
      );

      const state = await loadAuthoritativeState(store, 'game-1', 'mini');

      expect(state).toBeUndefined();
    },
  );
});
