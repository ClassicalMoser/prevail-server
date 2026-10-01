import type { GameSeatConnection } from '@ports';
import type { GameSessionStore } from './game-session-store';

/**
 * Connections currently open for a game.
 *
 * The set is created on first lookup so fan-out before the first seat
 * opens is a no-op over an empty set.
 *
 * @param store - Live-game memory.
 * @param gameId - Game whose sockets are needed.
 * @returns The set stored for that game.
 */
const getConnections = (
  store: GameSessionStore,
  gameId: string,
): Set<GameSeatConnection> => {
  let set = store.connections.get(gameId);
  if (set === undefined) {
    set = new Set();
    store.connections.set(gameId, set);
  }
  return set;
};

export { getConnections };
