import type { GameStorage } from '@classicalmoser/prevail-rules/application';
import type { Game } from '@classicalmoser/prevail-rules/domain';
import { fail, ok, okVoid } from './port-response';

/**
 * In-process {@link GameStorage} keyed by game id.
 *
 * Used by the live game engine until durable game rows exist. Authoritative
 * state is stored as `Game`; a state that is not authoritative is refused.
 *
 * @returns A GameStorage implementation backed by a Map.
 */
const createInMemoryGameStorage = (): GameStorage => {
  const games = new Map<string, Game>();

  return {
    getGame: async (gameId, gameMode) => {
      const game = games.get(gameId);
      if (game === undefined) {
        return;
      }
      // A stored game is only handed back to a caller asking for its own mode.
      if (game.gameMode !== gameMode) {
        const response = fail('Game mode mismatch');
        return response;
      }
      const response = ok(game);
      return response;
    },
    saveNewGame: async (game) => {
      if (games.has(game.id)) {
        const response = fail('Game already exists');
        return response;
      }
      games.set(game.id, game);
      const response = okVoid();
      return response;
    },
    updateGameState: async (gameId, gameState) => {
      const existing = games.get(gameId);
      if (existing === undefined) {
        const response = fail('Game not found');
        return response;
      }
      // A seen (per-player) view must never overwrite the full authoritative state.
      if (gameState.visibility !== 'authoritative') {
        const response = fail('Only authoritative game state is stored');
        return response;
      }
      games.set(gameId, { ...existing, gameState });
      const response = okVoid();
      return response;
    },
  };
};

export { createInMemoryGameStorage };
