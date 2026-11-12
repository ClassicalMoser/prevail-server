import type { DataErrorSignature, GameWatchConnection } from '@ports';
import { gameNotFound } from '@application/composable/game-session/session/game-not-found';
import { enqueue } from '@application/composable/game-session/session/enqueue';
import type { GameSessionStore } from '@application/composable/game-session/session/game-session-store';
import { loadAuthoritativeGame } from '@application/composable/game-session/session/load-authoritative-game';
import { requireRegisteredWatcher } from '@application/composable/game-session/session/require-registered-watcher';

/**
 * Resend the current authoritative snapshot to a registered watcher.
 *
 * The load waits on the game queue so it cannot land in the middle of a step.
 *
 * @param store - Live-game memory.
 * @param connection - Watcher asking for a resync.
 * @returns An empty success, or a 404, 403, or 400 envelope.
 */
const sendWatchSnapshot = async (
  store: GameSessionStore,
  connection: GameWatchConnection,
): Promise<DataErrorSignature<void>> => {
  const access = requireRegisteredWatcher(store, connection);
  if (!access.success) {
    return access;
  }

  const sent: DataErrorSignature<void> = await enqueue(
    store,
    connection.gameId,
    async (): Promise<DataErrorSignature<void>> => {
      const game = await loadAuthoritativeGame(
        store,
        connection.gameId,
        access.data.gameMode,
      );
      if (game === undefined) {
        const missing = gameNotFound();
        return missing;
      }
      connection.send({ payload: game.gameState, type: 'gameSnapshot' });
      return { data: undefined, success: true };
    },
  );
  return sent;
};

export { sendWatchSnapshot };
