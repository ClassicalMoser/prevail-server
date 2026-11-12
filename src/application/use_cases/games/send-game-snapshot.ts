import type { DataErrorSignature, GameSeatConnection } from '@ports';
import { gameNotFound } from '@application/composable/game-session/access/game-not-found';
import type { GameSessionStore } from '@application/composable/game-session/session/game-session-store';
import { loadAuthoritativeGame } from '@application/composable/game-session/session/load-authoritative-game';
import { requireRegisteredSeat } from '@application/composable/game-session/access/require-registered-seat';
import { sendGameSnapshotToConnection } from '@application/composable/game-session/fanout/send-game-snapshot-to-connection';

/**
 * Resend the current seat-visible snapshot to an already registered socket.
 *
 * An unregistered socket is rejected so a resync cannot bypass seat auth.
 *
 * @param store - Live-game memory.
 * @param connection - Seat asking for a resync.
 * @returns An empty success, or a 404, 403, or 400 envelope.
 */
const sendGameSnapshot = async (
  store: GameSessionStore,
  connection: GameSeatConnection,
): Promise<DataErrorSignature<void>> => {
  // A seat asks for a resync when its client suspects drift.
  const access = requireRegisteredSeat(store, connection);
  if (!access.success) {
    return access;
  }

  const authoritative = await loadAuthoritativeGame(
    store,
    connection.gameId,
    access.data.gameMode,
  );
  if (authoritative === undefined) {
    const missing = gameNotFound();
    return missing;
  }

  // The snapshot is projected to the seat's view, so the opponent's hand
  // stays hidden even on a resync.
  sendGameSnapshotToConnection(connection, authoritative);
  return { data: undefined, success: true };
};

export { sendGameSnapshot };
