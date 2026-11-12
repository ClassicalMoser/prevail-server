import type { GameWatchOutbound } from '@ports';
import { gameSessionStore, watcher } from '@testing';
import { sendToWatchers } from './send-to-watchers';

describe('sendToWatchers function', () => {
  it(
    'sends the message to every watcher of that game only',
    { timeout: 5000 },
    () => {
      expect.hasAssertions();

      const watching = watcher('game-1');
      const elsewhere = watcher('game-2');
      const store = gameSessionStore({
        watchers: new Map([
          ['game-1', new Set([watching.connection])],
          ['game-2', new Set([elsewhere.connection])],
        ]),
      });
      const message: GameWatchOutbound = { payload: {}, type: 'gameEffect' };

      sendToWatchers({ gameId: 'game-1', message, store });

      expect(watching.sent).toStrictEqual([message]);
      expect(elsewhere.sent).toStrictEqual([]);
    },
  );
});
