import { hostedBotVsBotGame, watcher } from '@testing';

describe('unregisterWatchConnection function', () => {
  it(
    'stops a closed watcher from receiving the stream',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const { runtime, gameId } = await hostedBotVsBotGame();
      const { connection, sent } = watcher(gameId);
      await runtime.registerWatchConnection(connection);

      runtime.unregisterWatchConnection(connection);
      const stepped = await runtime.stepBotVsBotGame(connection);

      // Once closed, it is no longer a registered watcher at all.
      expect(stepped).toMatchObject({ status: 400, success: false });
      expect(sent).toHaveLength(1);
    },
  );
});
