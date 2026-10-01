import type { GameModeName, GameState } from '@classicalmoser/prevail-rules/domain';
import type { GameSessionStore } from './game-session-store';
import { loadAuthoritativeGame } from './load-authoritative-game';

/**
 * Load only the authoritative state for a game.
 *
 * @param store - Live-game memory.
 * @param gameId - Game to load.
 * @param gameMode - Mode the caller expects the stored game to use.
 * @returns The game state, or undefined when the game is missing.
 */
const loadAuthoritativeState = async (
  store: GameSessionStore,
  gameId: string,
  gameMode: GameModeName,
): Promise<GameState | undefined> => {
  const authoritative = await loadAuthoritativeGame(store, gameId, gameMode);
  return authoritative?.gameState;
};

export { loadAuthoritativeState };
