import type { Game } from '@classicalmoser/prevail-rules/domain';
import { createEmptyGameState } from '@classicalmoser/prevail-rules/domain';
import { createInMemoryGameStorage } from './in-memory-game-storage';

// An army with no units or command cards: the storage keeps games and never
// reads the army.
const placeholderArmy = {
  commandCards: [],
  id: '550e8400-e29b-41d4-a716-446655440099',
  name: 'Test Army',
  units: [],
};

// A mini-mode game with an empty board state and a fixed id.
const sampleGame = (): Game => ({
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

      // Save the same game twice.
      const first = await storage.saveNewGame(game);
      const second = await storage.saveNewGame(game);

      // The first save is accepted.
      expect(first).toStrictEqual({ data: undefined, result: true });
      // A second save under the same id is refused, so a started game is never
      // overwritten.
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

      // Load the saved mini game once as mini and once as standard.
      const matched = await storage.getGame(game.id, 'mini');
      const mismatched = await storage.getGame(game.id, 'standard');

      // The right mode finds the game.
      expect(matched).toMatchObject({ data: { id: game.id }, result: true });
      // A different mode is refused: a game cannot be opened under the wrong
      // rules.
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
      // A fresh empty state stands for the state after play.
      const nextState = createEmptyGameState('mini');

      const updated = await storage.updateGameState(game.id, nextState);
      const missing = await storage.updateGameState('missing', nextState);

      // A stored game takes the new state.
      expect(updated).toStrictEqual({ data: undefined, result: true });
      // Updating a game that was never saved fails, instead of creating it.
      expect(missing).toStrictEqual({
        errorReason: 'Game not found',
        result: false,
      });
    },
  );
});
