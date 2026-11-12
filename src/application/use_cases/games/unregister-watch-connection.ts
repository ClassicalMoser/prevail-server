import type { GameWatchConnection } from '@ports';
import { getWatchers } from '@application/composable/game-session/fanout/get-watchers';
import type { GameSessionStore } from '@application/composable/game-session/session/game-session-store';

/**
 * Drop a closed watcher socket from the game's watcher set.
 *
 * @param store - Live-game memory.
 * @param connection - Watcher that closed.
 */
const unregisterWatchConnection = (
  store: GameSessionStore,
  connection: GameWatchConnection,
): void => {
  // A closed watcher must stop receiving the stream. The game stays as it was:
  // the server never advances a bot-vs-bot game on its own.
  getWatchers(store, connection.gameId).delete(connection);
};

export { unregisterWatchConnection };
