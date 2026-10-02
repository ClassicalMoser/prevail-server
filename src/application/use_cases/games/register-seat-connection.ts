import type { DataErrorSignature, GameSeatConnection } from '@ports';
import { enqueue } from '@application/composable/game-session/session/enqueue';
import { getConnections } from '@application/composable/game-session/fanout/get-connections';
import type { GameSessionStore } from '@application/composable/game-session/session/game-session-store';
import { loadAuthoritativeGame } from '@application/composable/game-session/session/load-authoritative-game';
import { sendGameSnapshotToConnection } from '@application/composable/game-session/fanout/send-game-snapshot-to-connection';
import { subjectForSeat } from '@application/composable/game-session/session/subject-for-seat';
import { takeBotTurns } from '@application/composable/game-session/bot/take-bot-turns';

/**
 * Admit a seat socket and send its opening snapshot.
 *
 * Auth is checked before the connection joins the fan-out set. Work waits on
 * the game queue, and bot turns for the human's side run first, so the first
 * outbound message is the snapshot after those turns.
 *
 * @param store - Live-game memory.
 * @param connection - Seat socket that just opened.
 * @returns An empty success, or a 404 or 403 envelope.
 */
const registerSeatConnection = async (
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

  const registered: DataErrorSignature<void> = await enqueue(
    store,
    connection.gameId,
    async (): Promise<DataErrorSignature<void>> => {
      if (connection.side === meta.humanSide) {
        await takeBotTurns(store, connection.gameId);
      }
      const afterBots = await loadAuthoritativeGame(
        store,
        connection.gameId,
        meta.gameMode,
      );
      if (afterBots === undefined) {
        return { message: 'Game not found', status: 404, success: false };
      }
      getConnections(store, connection.gameId).add(connection);
      sendGameSnapshotToConnection(connection, afterBots);
      return { data: undefined, success: true };
    },
  );
  return registered;
};

export { registerSeatConnection };
