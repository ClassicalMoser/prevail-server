import { gameSessionStore } from '@testing';
import { takeBotTurns } from './take-bot-turns';

describe('takeBotTurns function', () => {
  it(
    'returns immediately when the game has no session meta',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      // An empty store has no session meta, so the function has no game to play for.
      const store = gameSessionStore();

      await takeBotTurns(store, 'game-1');

      // The engine runner is never touched: no bot turn runs.
      expect(store.runner.advanceUntilPlayerChoice).not.toHaveBeenCalled();
    },
  );
});
