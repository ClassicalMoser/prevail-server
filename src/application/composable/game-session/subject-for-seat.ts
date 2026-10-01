import type { PlayerSide } from '@classicalmoser/prevail-rules/domain';
import { BOT_SUBJECT } from './bot-subject';
import type { GameSessionMeta } from './game-session-meta';

/**
 * Auth subject allowed to speak for a seat.
 *
 * The human's Auth0 subject owns their side. The opposite side is the bot
 * subject, which is not an Auth0 user.
 *
 * @param meta - Who created the game and which side they took.
 * @param side - Seat being checked.
 * @returns The subject that may open or submit for that seat.
 */
const subjectForSeat = (meta: GameSessionMeta, side: PlayerSide): string => {
  const subject = side === meta.humanSide ? meta.humanSubject : BOT_SUBJECT;
  return subject;
};

export { subjectForSeat };
