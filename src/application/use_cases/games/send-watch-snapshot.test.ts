import { hostedBotVsBotGame, watcher } from '@testing';

describe('sendWatchSnapshot function', () => {
  it(
    'resends the authoritative snapshot to a registered watcher',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const { runtime, gameId } = await hostedBotVsBotGame();
      const { connection, sent } = watcher(gameId);
      await runtime.registerWatchConnection(connection);

      const resent = await runtime.sendWatchSnapshot(connection);

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

      const { runtime, gameId } = await hostedBotVsBotGame();
      const { connection, sent } = watcher(gameId);

      const resent = await runtime.sendWatchSnapshot(connection);

      expect(resent).toMatchObject({ status: 400, success: false });
      expect(sent).toStrictEqual([]);
    },
  );
});
