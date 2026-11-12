import type { GameWatchOutbound } from '@ports';
import type { GameSessionStore } from '../session/game-session-store';
import { getWatchers } from './get-watchers';

/**
 * Send one outbound message to every socket watching a game.
 *
 * Watchers see the authoritative game, so the message is not projected.
 *
 * @param input - Live-game memory, the game, and the message to send.
 */
const sendToWatchers = (input: {
  store: GameSessionStore;
  gameId: string;
  message: GameWatchOutbound;
}): void => {
  const { store, gameId, message } = input;
  for (const watcher of getWatchers(store, gameId)) {
    watcher.send(message);
  }
};

export { sendToWatchers };
