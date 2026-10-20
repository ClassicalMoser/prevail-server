import type { BotVsBotStepData } from '@classicalmoser/prevail-contracts';
import { getLegalPlayerChoiceOptions } from '@classicalmoser/prevail-rules/domain';
import type { GameSessionStore } from '../session/game-session-store';
import { loadAuthoritativeGame } from '../session/load-authoritative-game';
import { drainToPlayerChoice } from './drain-to-player-choice';
import { sampleEitherSideChoice } from './sample-either-side-choice';

/**
 * Play one bot choice for whichever side the prompt belongs to.
 *
 * Effects before the choice are drained first, and effects the choice causes
 * are drained after it, so the returned game is the next decision or the end
 * of the game. A game that is already over returns `gameOver` with no choice.
 * A selector or submit failure sets `stuck` and later calls return that same
 * position without playing.
 *
 * @param store - Live-game memory.
 * @param gameId - Bot-vs-bot game to advance.
 * @returns The step result, or undefined when the game is not a bot-vs-bot session.
 */
const playBotVsBotChoice = async (
  store: GameSessionStore,
  gameId: string,
): Promise<BotVsBotStepData | undefined> => {
  const meta = store.metaByGameId.get(gameId);
  if (meta === undefined || meta.kind !== 'botVsBot') {
    return undefined;
  }

  if (meta.stuck) {
    const game = await loadAuthoritativeGame(store, gameId, meta.gameMode);
    if (game === undefined) {
      return undefined;
    }
    const stuck: BotVsBotStepData = {
      choice: null,
      game,
      status: 'stuck',
    };
    return stuck;
  }

  const opened = await drainToPlayerChoice(store, gameId, meta.gameMode);
  if (opened.status === 'missing') {
    return undefined;
  }
  if (opened.status === 'gameOver') {
    const ended: BotVsBotStepData = {
      choice: null,
      game: opened.game,
      status: 'gameOver',
    };
    return ended;
  }
  if (opened.status === 'stuck') {
    meta.stuck = true;
    const stuck: BotVsBotStepData = {
      choice: null,
      game: opened.game,
      status: 'stuck',
    };
    return stuck;
  }

  const options = getLegalPlayerChoiceOptions(opened.game.gameState);
  if (options === null) {
    meta.stuck = true;
    const stuck: BotVsBotStepData = {
      choice: null,
      game: opened.game,
      status: 'stuck',
    };
    return stuck;
  }

  const choice = sampleEitherSideChoice({
    options,
    state: opened.game.gameState,
  });
  if (choice === undefined) {
    console.error('playBotVsBotChoice: no bot choice for', {
      choiceType: options.choiceType,
      gameId,
      playerSource: options.playerSource,
    });
    meta.stuck = true;
    const stuck: BotVsBotStepData = {
      choice: null,
      game: opened.game,
      status: 'stuck',
    };
    return stuck;
  }

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
    const stuck: BotVsBotStepData = {
      choice: null,
      game: opened.game,
      status: 'stuck',
    };
    return stuck;
  }

  const closed = await drainToPlayerChoice(store, gameId, meta.gameMode);
  if (closed.status === 'missing') {
    return undefined;
  }
  if (closed.status === 'gameOver') {
    const ended: BotVsBotStepData = {
      choice,
      game: closed.game,
      status: 'gameOver',
    };
    return ended;
  }
  const continued: BotVsBotStepData = {
    choice,
    game: closed.game,
    status: 'awaitingChoice',
  };
  return continued;
};

export { playBotVsBotChoice };
