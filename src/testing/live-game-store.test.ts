import { army } from './game-session-armies';
import { liveGameStore } from './live-game-store';

describe('liveGameStore function', () => {
  it('starts with no games and no sockets', { timeout: 5000 }, () => {
    expect.hasAssertions();

    // With no armies given, the store is a fresh live-game store.
    const { store } = liveGameStore({});

    // No games are running yet.
    expect(store.metaByGameId.size).toBe(0);
    // No sockets are open yet.
    expect(store.connections.size).toBe(0);
  });

  it(
    "serves the armies it was given as the owner's list",
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      // One owned army registered under id 'a'.
      const { store } = liveGameStore({ a: army('a') });

      await expect(
        // Any subject finds it: the double does not check ownership.
        store.ownedArmyStorage.getOwnedArmyById('sub', 'a'),
      ).resolves.toMatchObject({
        data: { id: 'a' },
        success: true,
      });
    },
  );
});
