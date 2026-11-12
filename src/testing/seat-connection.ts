import type { PlayerSide } from '@classicalmoser/prevail-rules/domain';
import type { GameSeatConnection } from '@ports';

/**
 * A seat socket that records what it is sent.
 *
 * Session tests register it, or leave it unregistered, and then read `sent`
 * to see what the seat would have received.
 *
 * @param input - Which game and side the socket is for, and who is on it.
 * @returns The connection, and the messages it has been sent so far.
 */
const seatConnection = (input: {
  gameId: string;
  side: PlayerSide;
  subject: string;
}): { connection: GameSeatConnection; sent: unknown[] } => {
  const sent: unknown[] = [];
  const connection: GameSeatConnection = {
    gameId: input.gameId,
    send: (message): void => {
      sent.push(message);
    },
    side: input.side,
    subject: input.subject,
  };
  return { connection, sent };
};

export { seatConnection };
