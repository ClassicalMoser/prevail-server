import type { GameSeatConnection } from '@ports';
import { getConnections } from '@application/composable/game-session/fanout/get-connections';
import type { GameSessionStore } from '@application/composable/game-session/session/game-session-store';

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
  // A closed socket must stop receiving the stream, so fan-out does not send to
  // a dead connection.
  getConnections(store, connection.gameId).delete(connection);
};

export { unregisterSeatConnection };
