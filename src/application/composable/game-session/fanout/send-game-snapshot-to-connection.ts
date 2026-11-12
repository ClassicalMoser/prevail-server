import { projectGameStateForVisibility } from '@classicalmoser/prevail-rules/domain';
import type { Game } from '@classicalmoser/prevail-rules/domain';
import type { GameSeatConnection } from '@ports';

/**
 * Send the seat-visible projection of an authoritative game.
 *
 * White connections receive `whiteSeen`. Black connections receive `blackSeen`.
 * The authoritative record is not sent on the wire.
 *
 * @param connection - Open seat socket.
 * @param authoritative - Full game held by the engine.
 */
const sendGameSnapshotToConnection = (
  connection: GameSeatConnection,
  authoritative: Game,
): void => {
  // The seat is fixed by the socket path, so a client can only ask for its own view.
  const visibility = connection.side === 'white' ? 'whiteSeen' : 'blackSeen';
  connection.send({
    payload: projectGameStateForVisibility(authoritative.gameState, visibility),
    type: 'gameSnapshot',
  });
};

export { sendGameSnapshotToConnection };
