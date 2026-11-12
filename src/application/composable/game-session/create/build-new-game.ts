import { createInitialGameState } from '@classicalmoser/prevail-rules/domain';
import type {
  Army,
  Game,
  GameModeName,
} from '@classicalmoser/prevail-rules/domain';

/**
 * Build the `Game` a new session starts from: both armies, both players, and
 * the engine's initial state for the mode.
 *
 * Player fields are UUIDs because the client schema requires them. An Auth0
 * `sub` is not one, so the creating subject is kept in session meta instead
 * and never written onto the game.
 *
 * @param input - The game id, mode, each side's army and each side's player id.
 * @returns A game ready to be saved. Nothing has been played.
 */
const buildNewGame = (input: {
  gameId: string;
  gameMode: GameModeName;
  whiteArmy: Army;
  blackArmy: Army;
  whitePlayerId: string;
  blackPlayerId: string;
}): Game => {
  // The engine places both armies in reserve and deals the hands.
  const gameState = createInitialGameState({
    blackArmy: input.blackArmy,
    gameMode: input.gameMode,
    whiteArmy: input.whiteArmy,
  });
  const game: Game = {
    blackArmy: input.blackArmy,
    blackPlayer: input.blackPlayerId,
    gameMode: input.gameMode,
    gameState,
    id: input.gameId,
    whiteArmy: input.whiteArmy,
    whitePlayer: input.whitePlayerId,
  };
  return game;
};

export { buildNewGame };
