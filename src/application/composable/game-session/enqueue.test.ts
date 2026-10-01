import { gameSessionStore } from '@testing';
import { enqueue } from './enqueue';

describe('enqueue function', () => {
  it(
    'runs the next job after the previous job rejects',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const store = gameSessionStore();
      const failed = enqueue(store, 'game-1', async () => {
        throw new Error('prior');
      });
      const next = enqueue(store, 'game-1', async () => 'kept moving');

      await expect(failed).rejects.toThrow('prior');
      await expect(next).resolves.toBe('kept moving');
    },
  );
});
