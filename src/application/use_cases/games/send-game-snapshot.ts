import type { DataErrorSignature, GameSeatConnection } from '@ports';
import { getConnections } from '@application/composable/game-session/get-connections';
import type { GameSessionStore } from '@application/composable/game-session/game-session-store';
import { loadAuthoritativeGame } from '@application/composable/game-session/load-authoritative-game';
import { sendGameSnapshotToConnection } from '@application/composable/game-session/send-game-snapshot-to-connection';
import { subjectForSeat } from '@application/composable/game-session/subject-for-seat';

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
  const meta = store.metaByGameId.get(connection.gameId);
  if (meta === undefined) {
    return { message: 'Game not found', status: 404, success: false };
  }
  const expectedSubject = subjectForSeat(meta, connection.side);
  if (connection.subject !== expectedSubject) {
    return {
      message: 'Seat not assigned to this player',
      status: 403,
      success: false,
    };
  }
  if (!getConnections(store, connection.gameId).has(connection)) {
    return {
      message: 'Seat connection is not registered',
      status: 400,
      success: false,
    };
  }

  const authoritative = await loadAuthoritativeGame(
    store,
    connection.gameId,
    meta.gameMode,
  );
  if (authoritative === undefined) {
    return { message: 'Game not found', status: 404, success: false };
  }

  sendGameSnapshotToConnection(connection, authoritative);
  return { data: undefined, success: true };
};

export { sendGameSnapshot };
