import { gameSessionStore } from '@testing';
import { drainToPlayerChoice } from './drain-to-player-choice';

describe('drainToPlayerChoice function', () => {
  it(
    'reports missing when the game is not stored',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const store = gameSessionStore();
      const drained = await drainToPlayerChoice(store, 'game-1', 'mini');

      expect(drained).toStrictEqual({ status: 'missing' });
    },
  );
});
