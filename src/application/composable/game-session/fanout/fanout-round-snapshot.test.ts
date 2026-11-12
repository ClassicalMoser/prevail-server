import { gameSessionStore, hostedBotVsBotGame, watcher } from '@testing';
import { registerWatchConnection } from '@application/use_cases/games/register-watch-connection';
import { fanoutRoundSnapshot } from './fanout-round-snapshot';

describe('fanoutRoundSnapshot function', () => {
  it(
    'sends nothing when the game is not in session meta',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      // A seat socket exists but the game has no session meta, so this process is not hosting it.
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

      // The state is a bare stand-in cast; it must not be read, because the game is not hosted.
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

      // A hosted bot-vs-bot game whose creator is watching.
      const { store, gameId } = await hostedBotVsBotGame();
      const watching = watcher(gameId);
      await registerWatchConnection(store, watching.connection);

      await fanoutRoundSnapshot({
        gameId,
        gameState: { winner: 'white' } as never, // the hook's state is ignored; the stored game is sent
        roundNumber: 1,
        store,
      });

      // The first snapshot comes from registration; the second is the round snapshot, authoritative because a watcher has no hand to hide.
      expect(watching.sent).toMatchObject([
        { type: 'gameSnapshot' },
        { payload: { visibility: 'authoritative' }, type: 'gameSnapshot' },
      ]);
    },
  );
});
