import type { Game } from '@classicalmoser/prevail-rules/domain';
import { createEmptyGameState } from '@classicalmoser/prevail-rules/domain';
import type { GameSeatConnection, GameSessionOutbound } from '@ports';
import { sendGameSnapshotToConnection } from './send-game-snapshot-to-connection';

// An empty army is enough: the test only reads which projection a seat gets, not the armies.
const placeholderArmy = {
  commandCards: [],
  id: '550e8400-e29b-41d4-a716-446655440099',
  name: 'Test Army',
  units: [],
};

const sampleGame = (): Game => ({
  blackArmy: placeholderArmy,
  blackPlayer: 'black',
  gameMode: 'mini',
  gameState: createEmptyGameState('mini'),
  id: '550e8400-e29b-41d4-a716-446655440010',
  whiteArmy: placeholderArmy,
  whitePlayer: 'white',
});

describe('sendGameSnapshotToConnection function', () => {
  it('sends a whiteSeen projection to a white seat', { timeout: 5000 }, () => {
    expect.hasAssertions();

    const messages: GameSessionOutbound[] = [];
    const connection: GameSeatConnection = {
      gameId: 'game-1',
      send: (message): void => {
        messages.push(message);
      },
      side: 'white',
      subject: 'human',
    };

    // An empty mini game state stands in for the stored authoritative game.
    const authoritative = sampleGame();
    sendGameSnapshotToConnection(connection, authoritative);

    expect(messages).toStrictEqual([
      expect.objectContaining({
        payload: expect.objectContaining({ visibility: 'whiteSeen' }),
        type: 'gameSnapshot',
      }),
    ]);
  });

  it('sends a blackSeen projection to a black seat', { timeout: 5000 }, () => {
    expect.hasAssertions();

    const messages: GameSessionOutbound[] = [];
    const connection: GameSeatConnection = {
      gameId: 'game-1',
      send: (message): void => {
        messages.push(message);
      },
      side: 'black',
      subject: 'bot',
    };
    // Same stand-in game, now sent to the black seat.
    const authoritative = sampleGame();

    sendGameSnapshotToConnection(connection, authoritative);

    expect(messages).toHaveLength(1);
    expect(messages[0]).toMatchObject({
      payload: { visibility: 'blackSeen' },
      type: 'gameSnapshot',
    });
  });
});
