import { hostedBotVsBotGame, watcher } from '@testing';
import { registerWatchConnection } from './register-watch-connection';
import { stepBotVsBotGame } from './step-bot-vs-bot-game';
import { unregisterWatchConnection } from './unregister-watch-connection';

describe('unregisterWatchConnection function', () => {
  it(
    'stops a closed watcher from receiving the stream',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const { store, gameId } = await hostedBotVsBotGame();
      const { connection, sent } = watcher(gameId);
      await registerWatchConnection(store, connection);

      // The watcher closes; a later step from the same socket is then refused rather than streamed.
      unregisterWatchConnection(store, connection);
      const stepped = await stepBotVsBotGame(store, connection);

      // Once closed, it is no longer a registered watcher at all.
      expect(stepped).toMatchObject({ status: 400, success: false });
      expect(sent).toHaveLength(1);
    },
  );
});
