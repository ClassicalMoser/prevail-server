import type { DataErrorSignature, GameSeatConnection } from '@ports';
import { getConnections } from '../fanout/get-connections';
import type { VsBotSessionMeta } from '../session/game-session-meta';
import type { GameSessionStore } from '../session/game-session-store';
import { requireVsBotSeat } from './require-vs-bot-seat';

/**
 * Admit a seat socket that is already registered for its game.
 *
 * The subject must own the seat, as at registration. An unregistered socket
 * is 400, so a resync cannot bypass the open-time check.
 *
 * @param store - Live-game memory.
 * @param connection - Seat socket sending a message.
 * @returns The session meta, or a 404, 403, or 400 envelope.
 */
const requireRegisteredSeat = (
  store: GameSessionStore,
  connection: GameSeatConnection,
): DataErrorSignature<VsBotSessionMeta> => {
  const access = requireVsBotSeat(store, connection);
  if (!access.success) {
    return access;
  }
  if (!getConnections(store, connection.gameId).has(connection)) {
    const unregistered: DataErrorSignature<VsBotSessionMeta> = {
      message: 'Seat connection is not registered',
      status: 400,
      success: false,
    };
    return unregistered;
  }
  return access;
};

export { requireRegisteredSeat };
