import type {
  GameForVisibility,
  GameModeName,
} from '@classicalmoser/prevail-rules/domain';
import type { GameSessionStore } from './game-session-store';

/**
 * Load the authoritative game for a session.
 *
 * The engine port returns a visibility union. This process only stores
 * authoritative games, so the result is narrowed to that visibility.
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
): Promise<GameForVisibility<'authoritative'> | undefined> => {
  const gameResult = await store.enginePorts.gameStorage.getGame(
    gameId,
    gameMode,
  );
  if (gameResult === undefined || !gameResult.result) {
    return undefined;
  }
  return gameResult.data as GameForVisibility<'authoritative'>;
};

export { loadAuthoritativeGame };
