import type { GameWatchConnection } from '@ports';
import type { GameSessionStore } from '../session/game-session-store';

/**
 * Sockets currently watching a bot-vs-bot game.
 *
 * The set is created on first lookup so fan-out before the first watcher
 * opens is a no-op over an empty set.
 *
 * @param store - Live-game memory.
 * @param gameId - Game whose watchers are needed.
 * @returns The set stored for that game.
 */
const getWatchers = (
  store: GameSessionStore,
  gameId: string,
): Set<GameWatchConnection> => {
  let set = store.watchers.get(gameId);
  if (set === undefined) {
    set = new Set();
    store.watchers.set(gameId, set);
  }
  return set;
};

export { getWatchers };
