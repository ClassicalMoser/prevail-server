import type { GameForVisibility } from '@classicalmoser/prevail-rules/domain';
import { createEmptyGameState } from '@classicalmoser/prevail-rules/domain';
import { createInMemoryGameStorage } from './in-memory-game-storage';

const placeholderArmy = {
  commandCards: [],
  id: '550e8400-e29b-41d4-a716-446655440099',
  name: 'Test Army',
  units: [],
};

const sampleGame = (): GameForVisibility<'authoritative'> => ({
  blackArmy: placeholderArmy,
  blackPlayer: 'black',
  gameMode: 'mini',
  gameState: createEmptyGameState('mini'),
  id: '550e8400-e29b-41d4-a716-446655440010',
  whiteArmy: placeholderArmy,
  whitePlayer: 'white',
});

describe('createInMemoryGameStorage function', () => {
  it(
    'saves a game once and rejects a second save with the same id',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const storage = createInMemoryGameStorage();
      const game = sampleGame();

      const first = await storage.saveNewGame(game);
      const second = await storage.saveNewGame(game);

      expect(first).toStrictEqual({ data: undefined, result: true });
      expect(second).toStrictEqual({
        errorReason: 'Game already exists',
        result: false,
      });
    },
  );

  it(
    'loads a saved game and fails when the mode does not match',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const storage = createInMemoryGameStorage();
      const game = sampleGame();
      await storage.saveNewGame(game);

      const matched = await storage.getGame(game.id, 'mini');
      const mismatched = await storage.getGame(game.id, 'standard');

      expect(matched).toMatchObject({ data: { id: game.id }, result: true });
      expect(mismatched).toStrictEqual({
        errorReason: 'Game mode mismatch',
        result: false,
      });
    },
  );

  it(
    'updates game state for a stored game and fails when missing',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const storage = createInMemoryGameStorage();
      const game = sampleGame();
      await storage.saveNewGame(game);
      const nextState = createEmptyGameState('mini');

      const updated = await storage.updateGameState(game.id, nextState);
      const missing = await storage.updateGameState('missing', nextState);

      expect(updated).toStrictEqual({ data: undefined, result: true });
      expect(missing).toStrictEqual({
        errorReason: 'Game not found',
        result: false,
      });
    },
  );
});
