import type { BotVsBotStepData } from '@classicalmoser/prevail-contracts';
import type { DataErrorSignature } from '@ports';
import { playBotVsBotChoice } from '@application/composable/game-session/bot/play-bot-vs-bot-choice';
import { enqueue } from '@application/composable/game-session/session/enqueue';
import { requireBotVsBotSession } from '@application/composable/game-session/session/require-bot-vs-bot-session';
import type { GameSessionStore } from '@application/composable/game-session/session/game-session-store';

/**
 * Play one bot choice on a bot-vs-bot game.
 *
 * The caller must be the creator. The play runs on the game queue. A retry
 * is another step, not a replay of the choice already returned.
 *
 * @param store - Live-game memory.
 * @param subject - Auth subject of the caller.
 * @param gameId - Game to advance.
 * @returns The step result, or a 404 or 403 envelope.
 */
const stepBotVsBotGame = async (
  store: GameSessionStore,
  subject: string,
  gameId: string,
): Promise<DataErrorSignature<BotVsBotStepData>> => {
  const access = requireBotVsBotSession(store, subject, gameId);
  if (!access.success) {
    return access;
  }

  const played = await enqueue(store, gameId, async () => {
    const step = await playBotVsBotChoice(store, gameId);
    return step;
  });
  if (played === undefined) {
    const missing: DataErrorSignature<BotVsBotStepData> = {
      message: 'Game not found',
      status: 404,
      success: false,
    };
    return missing;
  }
  return { data: played, success: true };
};

export { stepBotVsBotGame };
