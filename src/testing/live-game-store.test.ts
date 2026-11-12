import { army } from './game-session-armies';
import { liveGameStore } from './live-game-store';

describe('liveGameStore function', () => {
  it('starts with no games and no sockets', { timeout: 5000 }, () => {
    expect.hasAssertions();

    const { store } = liveGameStore({});

    expect(store.metaByGameId.size).toBe(0);
    expect(store.connections.size).toBe(0);
  });

  it(
    "serves the armies it was given as the owner's list",
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const { store } = liveGameStore({ a: army('a') });

      await expect(
        store.ownedArmyStorage.getOwnedArmyById('sub', 'a'),
      ).resolves.toMatchObject({
        data: { id: 'a' },
        success: true,
      });
    },
  );
});
