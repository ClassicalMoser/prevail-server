import type { DataErrorSignature, GameSeatConnection } from '@ports';
import { enqueue } from '@application/composable/game-session/session/enqueue';
import { getConnections } from '@application/composable/game-session/fanout/get-connections';
import { gameNotFound } from '@application/composable/game-session/session/game-not-found';
import type { GameSessionStore } from '@application/composable/game-session/session/game-session-store';
import { loadAuthoritativeGame } from '@application/composable/game-session/session/load-authoritative-game';
import { requireVsBotSeat } from '@application/composable/game-session/session/require-vs-bot-seat';
import { sendGameSnapshotToConnection } from '@application/composable/game-session/fanout/send-game-snapshot-to-connection';
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
  // Only the human who made the game may open their own seat.
  const access = requireVsBotSeat(store, connection);
  if (!access.success) {
    return access;
  }
  const meta = access.data;

  const registered: DataErrorSignature<void> = await enqueue(
    store,
    connection.gameId,
    async (): Promise<DataErrorSignature<void>> => {
      // If the bot owes a choice the human is waiting on, play it first so
      // the snapshot the human opens with is not already stale.
      if (connection.side === meta.humanSide) {
        await takeBotTurns(store, connection.gameId);
      }
      const afterBots = await loadAuthoritativeGame(
        store,
        connection.gameId,
        meta.gameMode,
      );
      if (afterBots === undefined) {
        const missing = gameNotFound();
        return missing;
      }
      // Join the fan-out set before sending, inside the queue, so no event
      // lands between the snapshot and the first streamed message.
      getConnections(store, connection.gameId).add(connection);
      sendGameSnapshotToConnection(connection, afterBots);
      return { data: undefined, success: true };
    },
  );
  return registered;
};

export { registerSeatConnection };
