import type { GameSeatConnection, GameSessionOutbound } from '@ports';
import { gameSessionStore } from '@testing';
import { sendToSeat } from './send-to-seat';

describe('sendToSeat function', () => {
  it('sends only to sockets on the named side', { timeout: 5000 }, () => {
    expect.hasAssertions();

    const whiteMessages: GameSessionOutbound[] = [];
    const blackMessages: GameSessionOutbound[] = [];
    const white: GameSeatConnection = {
      gameId: 'game-1',
      send: (message) => {
        whiteMessages.push(message);
      },
      side: 'white',
      subject: 'human',
    };
    const black: GameSeatConnection = {
      gameId: 'game-1',
      send: (message) => {
        blackMessages.push(message);
      },
      side: 'black',
      subject: 'bot',
    };
    const store = gameSessionStore({
      connections: new Map([['game-1', new Set([white, black])]]),
    });
    const message: GameSessionOutbound = {
      payload: { id: 'snap' },
      type: 'gameSnapshot',
    };

    sendToSeat({ gameId: 'game-1', message, side: 'white', store });

    expect(whiteMessages).toStrictEqual([message]);
    expect(blackMessages).toStrictEqual([]);
  });
});
