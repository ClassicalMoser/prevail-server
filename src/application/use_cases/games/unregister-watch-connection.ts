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
  getWatchers(store, connection.gameId).delete(connection);
};

export { unregisterWatchConnection };
