import { getLegalPlayerChoiceOptions } from '@classicalmoser/prevail-rules/domain';
import type { GameSessionStore } from '../session/game-session-store';
import { drainToPlayerChoice } from './drain-to-player-choice';
import { sampleEitherSideChoice } from './sample-either-side-choice';

/**
 * What one bot-vs-bot step did.
 *
 * `played`: a choice was played; the game may now be over. `gameOver`: the
 * game was already over, and nothing was played. `stuck`: the bot or the
 * engine failed, and nothing was played. `missing`: the game is gone.
 */
type BotVsBotStepOutcome = 'played' | 'gameOver' | 'stuck' | 'missing';

/**
 * Play one bot choice for whichever side the prompt belongs to.
 *
 * Effects before the choice are drained first, and effects the choice causes
 * are drained after it, so the next step starts at a decision or the end of
 * the game. Every event reaches watchers through fanout as it is appended;
 * this only reports what happened. A bot or submit failure sets `stuck`, and
 * later steps play nothing.
 *
 * @param store - Live-game memory.
 * @param gameId - Bot-vs-bot game to advance.
 * @returns What the step did. A game that is not bot-vs-bot is `missing`.
 */
const playBotVsBotChoice = async (
  store: GameSessionStore,
  gameId: string,
): Promise<BotVsBotStepOutcome> => {
  const meta = store.metaByGameId.get(gameId);
  if (meta === undefined || meta.kind !== 'botVsBot') {
    return 'missing';
  }
  // After a bot failure the game stays stopped, so a later step plays nothing.
  if (meta.stuck) {
    return 'stuck';
  }

  // Effects owed before anyone chooses run first.
  const opened = await drainToPlayerChoice(store, gameId, meta.gameMode);
  if (opened.status !== 'ready') {
    if (opened.status === 'stuck') {
      meta.stuck = true;
    }
    return opened.status;
  }

  // Options from the authoritative state name which seat owes, so the bot plays
  // for whichever side the prompt belongs to.
  const options = getLegalPlayerChoiceOptions(opened.game.gameState);
  const choice =
    options === null
      ? undefined
      : sampleEitherSideChoice({ options, state: opened.game.gameState });
  if (choice === undefined) {
    console.error('playBotVsBotChoice: no bot choice for', {
      choiceType: options?.choiceType,
      gameId,
      playerSource: options?.playerSource,
    });
    meta.stuck = true;
    return 'stuck';
  }

  // The bot's choice goes through the same engine check as a human's; a refusal is
  // a bug in rules or this server, so the game is marked stuck.
  const submitted = await store.runner.handlePlayerChoiceSubmission(
    gameId,
    meta.gameMode,
    choice,
  );
  if (!submitted.result) {
    console.error('playBotVsBotChoice: bot submit failed', {
      error: submitted.errorReason,
      gameId,
    });
    meta.stuck = true;
    return 'stuck';
  }

  // The effects this choice caused run now, so watchers see them with it.
  const closed = await drainToPlayerChoice(store, gameId, meta.gameMode);
  if (closed.status === 'missing') {
    return 'missing';
  }
  if (closed.status === 'stuck') {
    meta.stuck = true;
  }
  return 'played';
};

export type { BotVsBotStepOutcome };
export { playBotVsBotChoice };
