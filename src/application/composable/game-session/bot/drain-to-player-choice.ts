import type { Game, GameModeName } from '@classicalmoser/prevail-rules/domain';
import {
  getExpectedEvent,
  getLegalPlayerChoiceOptions,
} from '@classicalmoser/prevail-rules/domain';
import type { GameSessionStore } from '../session/game-session-store';
import { loadAuthoritativeGame } from '../session/load-authoritative-game';

/** Where a bot-vs-bot step stands after pending effects have been drained. */
type DrainToPlayerChoiceResult =
  | { status: 'missing' }
  | { status: 'ready'; game: Game }
  | { status: 'gameOver'; game: Game }
  | { status: 'stuck'; game: Game };

/**
 * Advance pending game effects until a player choice or the end of the game.
 *
 * A position that is already a player choice is returned as `ready` without
 * calling the runner. `advanceUntilPlayerChoice` drains a run of effects in
 * one call. A selector bug or a failed drain is `stuck` with the last game
 * this function could load.
 *
 * @param store - Live-game memory.
 * @param gameId - Game to advance.
 * @param gameMode - Mode stored for that game.
 * @returns The position after effects, or `missing` when the game is gone.
 */
const drainToPlayerChoice = async (
  store: GameSessionStore,
  gameId: string,
  gameMode: GameModeName,
): Promise<DrainToPlayerChoiceResult> => {
  const game = await loadAuthoritativeGame(store, gameId, gameMode);
  if (game === undefined) {
    const missing: DrainToPlayerChoiceResult = { status: 'missing' };
    return missing;
  }
  // A finished game owes no choice; the step reports it instead of playing.
  if (game.gameState.winner !== undefined) {
    const over: DrainToPlayerChoiceResult = { status: 'gameOver', game };
    return over;
  }

  // Non-null options mean a player already owes a choice, so there are no effects
  // to drain.
  const options = getLegalPlayerChoiceOptions(game.gameState);
  if (options !== null) {
    const ready: DrainToPlayerChoiceResult = { status: 'ready', game };
    return ready;
  }

  // Null options also occur when the expected-event getter throws; only a pending
  // game effect may be drained, anything else is a bug and marks the game stuck.
  let expected: ReturnType<typeof getExpectedEvent> | undefined;
  try {
    expected = getExpectedEvent(game.gameState);
  } catch (error) {
    console.error('drainToPlayerChoice: getExpectedEvent failed', {
      error,
      gameId,
    });
    const stuck: DrainToPlayerChoiceResult = { status: 'stuck', game };
    return stuck;
  }
  if (expected.actionType !== 'gameEffect') {
    const stuck: DrainToPlayerChoiceResult = { status: 'stuck', game };
    return stuck;
  }

  // The engine applies the run of effects, and each event reaches watchers through
  // the append hook as it is written.
  const advanced = await store.runner.advanceUntilPlayerChoice(
    gameId,
    gameMode,
  );
  if (!advanced.result) {
    const stuck: DrainToPlayerChoiceResult = { status: 'stuck', game };
    return stuck;
  }

  const after = await loadAuthoritativeGame(store, gameId, gameMode);
  if (after === undefined) {
    const missing: DrainToPlayerChoiceResult = { status: 'missing' };
    return missing;
  }
  if (after.gameState.winner !== undefined) {
    const over: DrainToPlayerChoiceResult = { status: 'gameOver', game: after };
    return over;
  }
  // A drain that ends neither at a choice nor at the end of the game would leave
  // the next step with nothing to play, so it is stuck.
  const afterOptions = getLegalPlayerChoiceOptions(after.gameState);
  if (afterOptions === null) {
    const stuck: DrainToPlayerChoiceResult = { status: 'stuck', game: after };
    return stuck;
  }
  const ready: DrainToPlayerChoiceResult = { status: 'ready', game: after };
  return ready;
};

export type { DrainToPlayerChoiceResult };
export { drainToPlayerChoice };
