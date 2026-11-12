import { gameSessionStore, hostedBotVsBotGame, watcher } from '@testing';
import { fanoutRoundSnapshot } from './fanout-round-snapshot';

describe('fanoutRoundSnapshot function', () => {
  it(
    'sends nothing when the game is not in session meta',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const store = gameSessionStore();
      const sent = vi.fn<(message: unknown) => void>();
      store.connections.set(
        'game-1',
        new Set([
          {
            gameId: 'game-1',
            send: sent,
            side: 'white',
            subject: 'human',
          },
        ]),
      );

      await fanoutRoundSnapshot({
        gameId: 'game-1',
        gameState: { winner: 'white' } as never,
        roundNumber: 1,
        store,
      });

      expect(sent).not.toHaveBeenCalled();
      expect(store.enginePorts.gameStorage.getGame).not.toHaveBeenCalled();
    },
  );

  it(
    'sends a watcher the authoritative snapshot',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const { runtime, gameId } = await hostedBotVsBotGame();
      const watching = watcher(gameId);
      await runtime.registerWatchConnection(watching.connection);

      await runtime.fanoutRoundSnapshot(gameId, 1, {
        winner: 'white',
      } as never); // the hook's state is ignored; the stored game is sent

      expect(watching.sent).toMatchObject([
        { type: 'gameSnapshot' },
        { payload: { visibility: 'authoritative' }, type: 'gameSnapshot' },
      ]);
    },
  );
});
