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
      // The creator registers as a watcher and receives the opening snapshot.
      await registerWatchConnection(store, connection);

      // An explicit resync request sends a second snapshot.
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
      // This watcher never registers, so a resync request cannot skip the open-time check.
      const { connection, sent } = watcher(gameId);

      const resent = await sendWatchSnapshot(store, connection);

      expect(resent).toMatchObject({ status: 400, success: false });
      expect(sent).toStrictEqual([]);
    },
  );
});
