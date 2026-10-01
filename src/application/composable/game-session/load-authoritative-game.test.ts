import { gameSessionStore } from '@testing';
import { loadAuthoritativeGame } from './load-authoritative-game';

describe('loadAuthoritativeGame function', () => {
  it('returns undefined when storage has no game', { timeout: 5000 }, async () => {
    expect.hasAssertions();

    const store = gameSessionStore();
    vi.mocked(store.enginePorts.gameStorage.getGame).mockImplementation(
      async () => {},
    );

    const loaded = await loadAuthoritativeGame(store, 'game-1', 'mini');

    expect(loaded).toBeUndefined();
  });

  it('returns undefined when storage reports a failure', { timeout: 5000 }, async () => {
    expect.hasAssertions();

    const store = gameSessionStore();
    vi.mocked(store.enginePorts.gameStorage.getGame).mockResolvedValue({
      errorReason: 'missing',
      result: false,
    });

    const loaded = await loadAuthoritativeGame(store, 'game-1', 'mini');

    expect(loaded).toBeUndefined();
  });
});
