import type { GameSeatConnection } from '@ports';
import { getConnections } from '@application/composable/game-session/get-connections';
import type { GameSessionStore } from '@application/composable/game-session/game-session-store';

/**
 * Drop a closed socket from the game's connection set.
 *
 * @param store - Live-game memory.
 * @param connection - Seat that closed.
 */
const unregisterSeatConnection = (
  store: GameSessionStore,
  connection: GameSeatConnection,
): void => {
  getConnections(store, connection.gameId).delete(connection);
};

export { unregisterSeatConnection };
