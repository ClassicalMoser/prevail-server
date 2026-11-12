import { gameSessionStore } from '@testing';
import { getWatchers } from './get-watchers';

describe('getWatchers function', () => {
  it(
    'returns the same set on every lookup for a game',
    { timeout: 5000 },
    () => {
      expect.hasAssertions();

      const store = gameSessionStore();

      const first = getWatchers(store, 'game-1');
      const second = getWatchers(store, 'game-1');

      expect(second).toBe(first);
    },
  );
});
