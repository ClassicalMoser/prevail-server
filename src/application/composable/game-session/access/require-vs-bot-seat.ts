import type { PlayerSide } from '@classicalmoser/prevail-rules/domain';
import type { DataErrorSignature } from '@ports';
import { gameNotFound } from './game-not-found';
import type { VsBotSessionMeta } from '../session/game-session-meta';
import type { GameSessionStore } from '../session/game-session-store';
import { subjectForSeat } from './subject-for-seat';

/**
 * Admit a subject to one seat of a human-vs-bot game.
 *
 * A missing game and a bot-vs-bot game are both 404, so a watcher's game id
 * cannot be played as a seat. A subject who does not own the seat is 403: only
 * the human may play their side, and nobody may play the bot's.
 *
 * @param store - Live-game memory.
 * @param input - The game, the seat named by the socket path, and the caller.
 * @returns The session meta, or a 404 or 403 envelope.
 */
const requireVsBotSeat = (
  store: GameSessionStore,
  input: { gameId: string; side: PlayerSide; subject: string },
): DataErrorSignature<VsBotSessionMeta> => {
  const meta = store.metaByGameId.get(input.gameId);
  if (meta === undefined || meta.kind !== 'vsBot') {
    const missing: DataErrorSignature<VsBotSessionMeta> = gameNotFound();
    return missing;
  }
  if (input.subject !== subjectForSeat(meta, input.side)) {
    const forbidden: DataErrorSignature<VsBotSessionMeta> = {
      message: 'Seat not assigned to this player',
      status: 403,
      success: false,
    };
    return forbidden;
  }
  const admitted: DataErrorSignature<VsBotSessionMeta> = {
    data: meta,
    success: true,
  };
  return admitted;
};

export { requireVsBotSeat };
