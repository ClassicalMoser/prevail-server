import { botVsBotCreator, hostedBotVsBotGame, watcher } from '@testing';
import { registerWatchConnection } from './register-watch-connection';

describe('registerWatchConnection function', () => {
  it(
    'sends the authoritative opening snapshot first',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const { store, gameId } = await hostedBotVsBotGame();
      const { connection, sent } = watcher(gameId);

      const registered = await registerWatchConnection(store, connection);

      expect(registered).toStrictEqual({ data: undefined, success: true });
      expect(sent).toMatchObject([
        {
          payload: { visibility: 'authoritative' },
          type: 'gameSnapshot',
        },
      ]);
    },
  );

  it(
    'refuses a subject that did not create the game',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const { store, gameId } = await hostedBotVsBotGame();
      const { connection, sent } = watcher(gameId, `${botVsBotCreator}-other`);

      const registered = await registerWatchConnection(store, connection);

      expect(registered).toMatchObject({ status: 403, success: false });
      expect(sent).toStrictEqual([]);
    },
  );
});
