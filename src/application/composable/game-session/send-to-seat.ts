import type { PlayerSide } from '@classicalmoser/prevail-rules/domain';
import type { GameSessionOutbound } from '@ports';
import { getConnections } from './get-connections';
import type { GameSessionStore } from './game-session-store';

/**
 * Send one outbound message to every open socket on a side.
 *
 * @param store - Live-game memory.
 * @param gameId - Game being updated.
 * @param side - Seat that should receive the message.
 * @param message - Projected choice, effect, or snapshot.
 */
const sendToSeat = (input: {
  store: GameSessionStore;
  gameId: string;
  side: PlayerSide;
  message: GameSessionOutbound;
}): void => {
  const { store, gameId, side, message } = input;
  for (const connection of getConnections(store, gameId)) {
    if (connection.side === side) {
      connection.send(message);
    }
  }
};

export { sendToSeat };
