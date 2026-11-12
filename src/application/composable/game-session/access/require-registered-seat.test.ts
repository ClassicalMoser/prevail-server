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

    // The human's own socket on their own side: ownership is satisfied.
    const { connection } = seatConnection({
      gameId: 'game-1',
      side: 'white',
      subject: 'auth0|human',
    });
    // The socket is in the registered set, so only registration is under test.
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

      // Owner subject, but the socket never registered.
      const { connection } = seatConnection({
        gameId: 'game-1',
        side: 'white',
        subject: 'auth0|human',
      });
      // No connections map: the socket is absent from the registered set, so a message cannot skip the open-time check.
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

      // A subject other than the human who owns the white seat.
      const { connection } = seatConnection({
        gameId: 'game-1',
        side: 'white',
        subject: 'auth0|other',
      });
      // The stranger's socket is also unregistered; 403 (not 400) shows ownership is checked first.
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
