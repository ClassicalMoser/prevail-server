import { projectGameForVisibility } from '@classicalmoser/prevail-rules/domain';
import type { GameForVisibility } from '@classicalmoser/prevail-rules/domain';
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
  authoritative: GameForVisibility<'authoritative'>,
): void => {
  const visibility = connection.side === 'white' ? 'whiteSeen' : 'blackSeen';
  connection.send({
    payload: projectGameForVisibility(authoritative, visibility),
    type: 'gameSnapshot',
  });
};

export { sendGameSnapshotToConnection };
