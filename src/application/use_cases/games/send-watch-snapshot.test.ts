import { hostedBotVsBotGame, watcher } from '@testing';
import { registerWatchConnection } from './register-watch-connection';
import { sendWatchSnapshot } from './send-watch-snapshot';

describe('sendWatchSnapshot function', () => {
  it(
    'resends the authoritative snapshot to a registered watcher',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const { store, gameId } = await hostedBotVsBotGame();
      const { connection, sent } = watcher(gameId);
      await registerWatchConnection(store, connection);

      const resent = await sendWatchSnapshot(store, connection);

      expect(resent).toStrictEqual({ data: undefined, success: true });
      expect(sent.map((message) => message.type)).toStrictEqual([
        'gameSnapshot',
        'gameSnapshot',
      ]);
    },
  );

  it(
    'refuses a watcher that has not been registered',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const { store, gameId } = await hostedBotVsBotGame();
      const { connection, sent } = watcher(gameId);

      const resent = await sendWatchSnapshot(store, connection);

      expect(resent).toMatchObject({ status: 400, success: false });
      expect(sent).toStrictEqual([]);
    },
  );
});
