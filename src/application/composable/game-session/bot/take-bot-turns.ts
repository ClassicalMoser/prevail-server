import {
  getExpectedEvent,
  getLegalPlayerChoiceOptions,
} from '@classicalmoser/prevail-rules/domain';
import { setTimeout as delay } from 'node:timers/promises';
import type { GameSessionStore } from '../session/game-session-store';
import { loadAuthoritativeState } from '../session/load-authoritative-state';
import { otherSide } from '../session/other-side';
import { findOwingSeats } from './find-owing-seats';
import { trySeatChoice } from './try-seat-choice';

/**
 * Submit bot choices until the next choice belongs to the human.
 *
 * A null legal-options result means a game effect is pending, or the expected
 * event getter threw. Effects are drained only when one is actually expected.
 * Consecutive submits pause by `botTurnGapMs` so the human can follow.
 *
 * @param store - Live-game memory.
 * @param gameId - Game the bot should advance.
 */
const takeBotTurns = async (
  store: GameSessionStore,
  gameId: string,
): Promise<void> => {
  // Only a human-vs-bot game plays the bot on its own; a bot-vs-bot game moves
  // only when its creator steps.
  const meta = store.metaByGameId.get(gameId);
  if (meta === undefined || meta.kind !== 'vsBot') {
    return;
  }
  const botSide = otherSide(meta.humanSide);
  let submittedPriorTurn = false;

  for (;;) {
    // Reload each pass: every submit and drained effect changes the game, and the
    // bot must choose against the stored state.
    const state = await loadAuthoritativeState(store, gameId, meta.gameMode);
    if (state === undefined) {
      return;
    }
    // `winner` is set by the terminal `gameOver` effect (including draws).
    if (state.winner !== undefined) {
      return;
    }

    const options = getLegalPlayerChoiceOptions(state);
    if (options === null) {
      // Player-choice router returns null for game effects *or* when
      // getExpectedEvent throws. Only drain effects when one is expected.
      let expected: ReturnType<typeof getExpectedEvent> | undefined = undefined;
      try {
        expected = getExpectedEvent(state);
      } catch (error) {
        console.error('takeBotTurns: getExpectedEvent failed', {
          error,
          gameId,
        });
        return;
      }
      if (expected.actionType !== 'gameEffect') {
        return;
      }
      const advanced = await store.runner.advanceUntilPlayerChoice(
        gameId,
        meta.gameMode,
      );
      if (!advanced.result) {
        return;
      }
    } else if (!findOwingSeats(options).includes(botSide)) {
      // The human owes this choice, or both chose cards and the bot's is down.
      return;
    } else {
      // The rules bot throwing is a bug, not a refusal: stop the bot and leave the
      // human's request successful.
      const choice = trySeatChoice({ seat: botSide, state });
      if (choice === undefined) {
        console.error('takeBotTurns: no bot choice for', {
          choiceType: options.choiceType,
          gameId,
          playerSource: options.playerSource,
        });
        return;
      }

      // Pause between consecutive bot moves so the human can follow them; the first
      // move needs no wait.
      if (submittedPriorTurn && store.botTurnGapMs > 0) {
        await delay(store.botTurnGapMs);
      }

      // The rules engine judges the bot's choice like a human's; a refusal ends the
      // run rather than retrying the same choice.
      const result = await store.runner.handlePlayerChoiceSubmission(
        gameId,
        meta.gameMode,
        choice,
      );
      if (!result.result) {
        return;
      }
      submittedPriorTurn = true;
    }
  }
};

export { takeBotTurns };
