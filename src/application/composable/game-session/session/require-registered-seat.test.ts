import { gameSessionStore, seatConnection } from '@testing';
import { requireRegisteredSeat } from './require-registered-seat';

const meta = {
  gameMode: 'mini',
  humanSide: 'white',
  humanSubject: 'auth0|human',
  kind: 'vsBot',
} as const;

describe('requireRegisteredSeat function', () => {
  it('admits the human once the seat is registered', { timeout: 5000 }, () => {
    expect.hasAssertions();

    const { connection } = seatConnection({
      gameId: 'game-1',
      side: 'white',
      subject: 'auth0|human',
    });
    const store = gameSessionStore({
      connections: new Map([['game-1', new Set([connection])]]),
      metaByGameId: new Map([['game-1', { ...meta }]]),
    });

    expect(requireRegisteredSeat(store, connection)).toMatchObject({
      data: { kind: 'vsBot' },
      success: true,
    });
  });

  it(
    'refuses the human before registration with 400',
    { timeout: 5000 },
    () => {
      expect.hasAssertions();

      const { connection } = seatConnection({
        gameId: 'game-1',
        side: 'white',
        subject: 'auth0|human',
      });
      const store = gameSessionStore({
        metaByGameId: new Map([['game-1', { ...meta }]]),
      });

      expect(requireRegisteredSeat(store, connection)).toMatchObject({
        status: 400,
        success: false,
      });
    },
  );

  it(
    'refuses a stranger before looking at registration',
    { timeout: 5000 },
    () => {
      expect.hasAssertions();

      const { connection } = seatConnection({
        gameId: 'game-1',
        side: 'white',
        subject: 'auth0|other',
      });
      const store = gameSessionStore({
        metaByGameId: new Map([['game-1', { ...meta }]]),
      });

      expect(requireRegisteredSeat(store, connection)).toMatchObject({
        status: 403,
        success: false,
      });
    },
  );
});
