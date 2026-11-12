import type { PlayerSide } from '@classicalmoser/prevail-rules/domain';
import type { GameSessionStore } from '@application/composable/game-session/session/game-session-store';
import { subjectForSeat } from '@application/composable/game-session/access/subject-for-seat';

/**
 * Subject that may use a seat, when the game exists in this process.
 *
 * @param store - Live-game memory.
 * @param gameId - Game the seat belongs to.
 * @param side - White or black.
 * @returns The subject, or undefined when the game is not hosted here.
 */
// TODO(misleading): `get` answers undefined here, which DESIGN.md calls `find`.
// The name is the inbound port's method, so renaming it is a port change; the
// author decides whether the port should say `findSeatSubject`.
const getSeatSubject = (
  store: GameSessionStore,
  gameId: string,
  side: PlayerSide,
): string | undefined => {
  // Only a vs-bot game has seats; a bot-vs-bot game has none to name.
  const meta = store.metaByGameId.get(gameId);
  if (meta === undefined || meta.kind !== 'vsBot') {
    return undefined;
  }
  const subject = subjectForSeat(meta, side);
  return subject;
};

export { getSeatSubject };
