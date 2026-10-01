import type { PlayerSide } from '@classicalmoser/prevail-rules/domain';
import type { GameSessionStore } from '@application/composable/game-session/game-session-store';
import { subjectForSeat } from '@application/composable/game-session/subject-for-seat';

/**
 * Subject that may use a seat, when the game exists in this process.
 *
 * @param store - Live-game memory.
 * @param gameId - Game the seat belongs to.
 * @param side - White or black.
 * @returns The subject, or undefined when the game is not hosted here.
 */
const getSeatSubject = (
  store: GameSessionStore,
  gameId: string,
  side: PlayerSide,
): string | undefined => {
  const meta = store.metaByGameId.get(gameId);
  if (meta === undefined) {
    return undefined;
  }
  const subject = subjectForSeat(meta, side);
  return subject;
};

export { getSeatSubject };
