import type { GameStorage } from '@classicalmoser/prevail-rules/application';
import type { Game, GameForVisibility } from '@classicalmoser/prevail-rules/domain';
import { fail, ok, okVoid } from './port-response';

const createInMemoryGameStorage = (): GameStorage => {
  const games = new Map<string, Game>();

  return {
    getGame: async (gameId, gameMode) => {
      const game = games.get(gameId);
      if (game === undefined) {
        return;
      }
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
      const next = {
        ...existing,
        gameState,
      } as GameForVisibility<'authoritative'>;
      games.set(gameId, next);
      const response = okVoid();
      return response;
    },
  };
};

export { createInMemoryGameStorage };
