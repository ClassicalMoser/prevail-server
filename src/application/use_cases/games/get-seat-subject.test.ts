import { gameSessionStore } from '@testing';
import { getSeatSubject } from './get-seat-subject';

describe('getSeatSubject function', () => {
  it(
    'returns undefined when this process is not hosting the game',
    { timeout: 5000 },
    () => {
      expect.hasAssertions();

      const store = gameSessionStore();

      expect(getSeatSubject(store, 'missing', 'white')).toBeUndefined();
    },
  );

  it(
    'returns the human subject for their side and the bot for the other',
    { timeout: 5000 },
    () => {
      expect.hasAssertions();

      const store = gameSessionStore();
      store.metaByGameId.set('game-1', {
        gameMode: 'mini',
        humanSide: 'white',
        humanSubject: 'auth0|human',
      });

      expect(getSeatSubject(store, 'game-1', 'white')).toBe('auth0|human');
      expect(getSeatSubject(store, 'game-1', 'black')).toBe('bot:prevail');
    },
  );
});
