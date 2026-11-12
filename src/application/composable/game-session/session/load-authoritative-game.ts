import { gameSchema } from '@classicalmoser/prevail-rules/domain';
import type { Game, GameModeName } from '@classicalmoser/prevail-rules/domain';
import type { GameSessionStore } from './game-session-store';

/**
 * Load the authoritative game for a session.
 *
 * The engine port delivers unknown data, so it is read as a game before use.
 *
 * @param store - Live-game memory.
 * @param gameId - Game to load.
 * @param gameMode - Mode the caller expects the stored game to use.
 * @returns The authoritative game, or undefined when it is missing or the load fails.
 */
const loadAuthoritativeGame = async (
  store: GameSessionStore,
  gameId: string,
  gameMode: GameModeName,
): Promise<Game | undefined> => {
  const gameResult = await store.enginePorts.gameStorage.getGame(
    gameId,
    gameMode,
  );
  // A missing or failed load reads as a game that is gone, which callers answer
  // as not found.
  if (gameResult === undefined || !gameResult.result) {
    return undefined;
  }
  const parsed = gameSchema.safeParse(gameResult.data);
  if (!parsed.success) {
    return undefined;
  }
  return parsed.data;
};

export { loadAuthoritativeGame };
