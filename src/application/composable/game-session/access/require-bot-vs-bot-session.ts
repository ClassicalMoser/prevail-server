import type { BotVsBotSessionMeta } from '../session/game-session-meta';
import type { DataErrorSignature } from '@ports';
import { gameNotFound } from './game-not-found';
import type { GameSessionStore } from '../session/game-session-store';

/**
 * Admit the creating subject to a bot-vs-bot game.
 *
 * A missing game and a human-vs-bot game are both 404, so a vs-bot id cannot
 * be read or stepped here. A different subject is 403.
 *
 * @param store - Live-game memory.
 * @param subject - Auth subject of the caller.
 * @param gameId - Game the caller named.
 * @returns The session meta, or a 404 or 403 envelope.
 */
const requireBotVsBotSession = (
  store: GameSessionStore,
  subject: string,
  gameId: string,
): DataErrorSignature<BotVsBotSessionMeta> => {
  const meta = store.metaByGameId.get(gameId);
  if (meta === undefined || meta.kind !== 'botVsBot') {
    const missing: DataErrorSignature<BotVsBotSessionMeta> = gameNotFound();
    return missing;
  }
  if (meta.creatorSubject !== subject) {
    const forbidden: DataErrorSignature<BotVsBotSessionMeta> = {
      message: 'Game not assigned to this player',
      status: 403,
      success: false,
    };
    return forbidden;
  }
  const admitted: DataErrorSignature<BotVsBotSessionMeta> = {
    data: meta,
    success: true,
  };
  return admitted;
};

export { requireBotVsBotSession };
