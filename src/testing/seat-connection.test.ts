import { seatConnection } from './seat-connection';

describe('seatConnection function', () => {
  it('records what the seat is sent', { timeout: 5000 }, () => {
    expect.hasAssertions();

    // A white seat for auth0|human in game-1.
    const { connection, sent } = seatConnection({
      gameId: 'game-1',
      side: 'white',
      subject: 'auth0|human',
    });
    // The server sends the seat one message.
    connection.send({ payload: {}, type: 'gameEffect' });

    // The double stores it, so a test can see what the player would have
    // received.
    expect(sent).toStrictEqual([{ payload: {}, type: 'gameEffect' }]);
  });
});
