import type { GameSeatConnection } from '@ports';
import { gameSessionStore } from '@testing';
import { unregisterSeatConnection } from './unregister-seat-connection';

describe('unregisterSeatConnection function', () => {
  it('removes the closed socket from the game set', { timeout: 5000 }, () => {
    expect.hasAssertions();

    const store = gameSessionStore();
    const connection: GameSeatConnection = {
      gameId: 'game-1',
      send: vi.fn<(message: unknown) => void>(),
      side: 'white',
      subject: 'human',
    };
    store.connections.set('game-1', new Set([connection]));

    unregisterSeatConnection(store, connection);

    expect(store.connections.get('game-1')?.has(connection)).toBe(false);
  });
});
