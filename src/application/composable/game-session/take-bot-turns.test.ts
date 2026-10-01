import { gameSessionStore } from '@testing';
import { takeBotTurns } from './take-bot-turns';

describe('takeBotTurns function', () => {
  it(
    'returns immediately when the game has no session meta',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const store = gameSessionStore();

      await takeBotTurns(store, 'game-1');

      expect(store.runner.advanceUntilPlayerChoice).not.toHaveBeenCalled();
    },
  );
});
