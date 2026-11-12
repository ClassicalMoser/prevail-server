import type { DataErrorSignature, GameWatchConnection } from '@ports';
import { getWatchers } from '../fanout/get-watchers';
import type { BotVsBotSessionMeta } from '../session/game-session-meta';
import type { GameSessionStore } from '../session/game-session-store';
import { requireBotVsBotSession } from './require-bot-vs-bot-session';

/**
 * Admit a watcher socket that is already registered for its game.
 *
 * The subject must be the creator, as at registration. An unregistered
 * socket is 400, so a step or a resync cannot bypass the open-time check.
 *
 * @param store - Live-game memory.
 * @param connection - Watcher socket sending a message.
 * @returns The session meta, or a 404, 403, or 400 envelope.
 */
const requireRegisteredWatcher = (
  store: GameSessionStore,
  connection: GameWatchConnection,
): DataErrorSignature<BotVsBotSessionMeta> => {
  const access = requireBotVsBotSession(
    store,
    connection.subject,
    connection.gameId,
  );
  if (!access.success) {
    return access;
  }
  if (!getWatchers(store, connection.gameId).has(connection)) {
    const unregistered: DataErrorSignature<BotVsBotSessionMeta> = {
      message: 'Watcher connection is not registered',
      status: 400,
      success: false,
    };
    return unregistered;
  }
  return access;
};

export { requireRegisteredWatcher };
