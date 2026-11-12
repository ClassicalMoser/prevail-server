import { seatConnection } from './seat-connection';

describe('seatConnection function', () => {
  it('records what the seat is sent', { timeout: 5000 }, () => {
    expect.hasAssertions();

    const { connection, sent } = seatConnection({
      gameId: 'game-1',
      side: 'white',
      subject: 'auth0|human',
    });
    connection.send({ payload: {}, type: 'gameEffect' });

    expect(sent).toStrictEqual([{ payload: {}, type: 'gameEffect' }]);
  });
});
