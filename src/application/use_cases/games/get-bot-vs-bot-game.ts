import type { GameForVisibility } from '@classicalmoser/prevail-rules/domain';
import type { DataErrorSignature } from '@ports';
import { enqueue } from '@application/composable/game-session/session/enqueue';
import { loadAuthoritativeGame } from '@application/composable/game-session/session/load-authoritative-game';
import { requireBotVsBotSession } from '@application/composable/game-session/session/require-bot-vs-bot-session';
import type { GameSessionStore } from '@application/composable/game-session/session/game-session-store';

/**
 * Return the current authoritative bot-vs-bot game.
 *
 * Does not play a choice. The load waits on the game queue so it cannot
 * observe a step in progress. A vs-bot id and an unknown id are 404.
 *
 * @param store - Live-game memory.
 * @param subject - Auth subject of the caller.
 * @param gameId - Game to read.
 * @returns The authoritative game, or a 404 or 403 envelope.
 */
const getBotVsBotGame = async (
  store: GameSessionStore,
  subject: string,
  gameId: string,
): Promise<DataErrorSignature<GameForVisibility<'authoritative'>>> => {
  const access = requireBotVsBotSession(store, subject, gameId);
  if (!access.success) {
    return access;
  }

  const game = await enqueue(store, gameId, async () => {
    const loaded = await loadAuthoritativeGame(
      store,
      gameId,
      access.data.gameMode,
    );
    return loaded;
  });
  if (game === undefined) {
    const missing: DataErrorSignature<GameForVisibility<'authoritative'>> = {
      message: 'Game not found',
      status: 404,
      success: false,
    };
    return missing;
  }
  return { data: game, success: true };
};

export { getBotVsBotGame };
