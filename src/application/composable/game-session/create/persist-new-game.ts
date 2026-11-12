import type { Game } from '@classicalmoser/prevail-rules/domain';
import type { ErrorSignature } from '@ports';
import type { GameSessionStore } from '../session/game-session-store';

/**
 * Save a new game and open the event stream its setup events will go into.
 *
 * The game is saved first because the engine appends events to a game that
 * must already exist. The stream opens at the game's current round number,
 * which is 0 during setup: the engine files each event under the round it is
 * applied in, so setup events need a round 0 stream waiting.
 *
 * @param store - Live-game memory, which holds the engine ports.
 * @param game - The game from `buildNewGame`.
 * @returns A 500 envelope when either write fails, otherwise undefined.
 */
const persistNewGame = async (
  store: GameSessionStore,
  game: Game,
): Promise<ErrorSignature | undefined> => {
  // A failed write is a server fault (500), not something the creator can fix.
  const saved = await store.enginePorts.gameStorage.saveNewGame(game);
  if (!saved.result) {
    const failure: ErrorSignature = {
      message: saved.errorReason,
      status: 500,
      success: false,
    };
    return failure;
  }

  // Without this stream the first setup event would have nowhere to be filed.
  const stream = await store.enginePorts.eventStreamStorage.newEventStream(
    game.id,
    game.gameState.currentRoundState.roundNumber,
  );
  if (!stream.result) {
    const failure: ErrorSignature = {
      message: stream.errorReason,
      status: 500,
      success: false,
    };
    return failure;
  }

  return undefined;
};

export { persistNewGame };
