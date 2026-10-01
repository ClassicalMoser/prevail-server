import type { GameSeatConnection } from '@ports';
import { gameSessionStore } from '@testing';
import { getConnections } from './get-connections';

describe('getConnections function', () => {
  it(
    'creates the set on first lookup and returns that same set later',
    { timeout: 5000 },
    () => {
      expect.hasAssertions();

      const store = gameSessionStore();
      const connection: GameSeatConnection = {
        gameId: 'game-1',
        send: vi.fn<(message: unknown) => void>(),
        side: 'white',
        subject: 'human',
      };

      const created = getConnections(store, 'game-1');
      created.add(connection);
      const again = getConnections(store, 'game-1');

      expect(again.has(connection)).toBe(true);
      expect(again).toBe(created);
    },
  );
});
