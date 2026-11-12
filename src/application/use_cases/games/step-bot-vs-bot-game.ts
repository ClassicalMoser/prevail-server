import type { DataErrorSignature, GameWatchConnection } from '@ports';
import { playBotVsBotChoice } from '@application/composable/game-session/bot/play-bot-vs-bot-choice';
import type { BotVsBotStepOutcome } from '@application/composable/game-session/bot/play-bot-vs-bot-choice';
import { enqueue } from '@application/composable/game-session/session/enqueue';
import type { GameSessionStore } from '@application/composable/game-session/session/game-session-store';
import { requireRegisteredWatcher } from '@application/composable/game-session/access/require-registered-watcher';

/** Why a step that played nothing is refused, by what the step found. */
const refusals: Record<
  Exclude<BotVsBotStepOutcome, 'played'>,
  { message: string; status: number }
> = {
  gameOver: { message: 'The game is over', status: 409 },
  missing: { message: 'Game not found', status: 404 },
  stuck: { message: 'The bots are stuck; this game cannot go on', status: 409 },
};

/**
 * Play one bot choice on a bot-vs-bot game, for a registered watcher.
 *
 * The play runs on the game queue. The choice and its effects reach every
 * watcher through fanout, so success carries no data. A step that played
 * nothing is a failure, which the socket sends back as `stepRejected`.
 *
 * @param store - Live-game memory.
 * @param connection - Watcher asking for the step.
 * @returns An empty success, or a 404, 403, 400, or 409 envelope.
 */
const stepBotVsBotGame = async (
  store: GameSessionStore,
  connection: GameWatchConnection,
): Promise<DataErrorSignature<void>> => {
  const access = requireRegisteredWatcher(store, connection);
  if (!access.success) {
    return access;
  }

  const outcome = await enqueue(store, connection.gameId, async () => {
    const played = await playBotVsBotChoice(store, connection.gameId);
    return played;
  });
  if (outcome === 'played') {
    return { data: undefined, success: true };
  }
  const refusal = refusals[outcome];
  const refused: DataErrorSignature<void> = { ...refusal, success: false };
  return refused;
};

export { stepBotVsBotGame };
