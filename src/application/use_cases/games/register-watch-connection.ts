import type { DataErrorSignature, GameWatchConnection } from '@ports';
import { getWatchers } from '@application/composable/game-session/fanout/get-watchers';
import { enqueue } from '@application/composable/game-session/session/enqueue';
import type { GameSessionStore } from '@application/composable/game-session/session/game-session-store';
import { loadAuthoritativeGame } from '@application/composable/game-session/session/load-authoritative-game';
import { requireBotVsBotSession } from '@application/composable/game-session/session/require-bot-vs-bot-session';

/**
 * Admit the creator's bot-vs-bot socket and send its opening snapshot.
 *
 * Auth is checked before the socket joins the watcher set. The join and the
 * snapshot run on the game queue, so a step in progress finishes first and
 * the snapshot is the first outbound message. The snapshot is authoritative:
 * both seats are bots, and there is no hand to hide from the watcher.
 *
 * @param store - Live-game memory.
 * @param connection - Watcher socket that just opened.
 * @returns An empty success, or a 404 or 403 envelope.
 */
const registerWatchConnection = async (
  store: GameSessionStore,
  connection: GameWatchConnection,
): Promise<DataErrorSignature<void>> => {
  const access = requireBotVsBotSession(
    store,
    connection.subject,
    connection.gameId,
  );
  if (!access.success) {
    return access;
  }

  const registered: DataErrorSignature<void> = await enqueue(
    store,
    connection.gameId,
    async (): Promise<DataErrorSignature<void>> => {
      const game = await loadAuthoritativeGame(
        store,
        connection.gameId,
        access.data.gameMode,
      );
      if (game === undefined) {
        return { message: 'Game not found', status: 404, success: false };
      }
      getWatchers(store, connection.gameId).add(connection);
      connection.send({ payload: game.gameState, type: 'gameSnapshot' });
      return { data: undefined, success: true };
    },
  );
  return registered;
};

export { registerWatchConnection };
