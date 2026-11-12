import { gameSessionStore } from '@testing';
import { enqueue } from './enqueue';

describe('enqueue function', () => {
  it(
    'runs the next job after the previous job rejects',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const store = gameSessionStore();
      // The first job rejects; the queue must not stay broken for the game.
      const failed = enqueue(store, 'game-1', async () => {
        throw new Error('prior');
      });
      // A second job queued behind the failed one still runs.
      const next = enqueue(store, 'game-1', async () => 'kept moving');

      await expect(failed).rejects.toThrow('prior');
      await expect(next).resolves.toBe('kept moving');
    },
  );
});
