import {
  getExpectedEvent,
  getLegalPlayerChoiceOptions,
} from '@classicalmoser/prevail-rules/domain';
import { setTimeout as delay } from 'node:timers/promises';
import { selectRandomPlayerChoice } from '../player-choice/select-random-player-choice';
import type { GameSessionStore } from './game-session-store';
import { loadAuthoritativeState } from './load-authoritative-state';
import { otherSide } from './other-side';

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
  const meta = store.metaByGameId.get(gameId);
  if (meta === undefined) {
    return;
  }
  const botSide = otherSide(meta.humanSide);
  let submittedPriorTurn = false;

  for (;;) {
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
    } else if (options.playerSource === meta.humanSide) {
      return;
    } else {
      const choice = selectRandomPlayerChoice({
        actingPlayer: botSide,
        options,
        state,
      });
      if (choice === undefined) {
        console.error('takeBotTurns: no bot choice for', {
          choiceType: options.choiceType,
          gameId,
          playerSource: options.playerSource,
        });
        return;
      }

      if (submittedPriorTurn && store.botTurnGapMs > 0) {
        await delay(store.botTurnGapMs);
      }

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
