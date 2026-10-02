import { gameSessionStore } from './game-session-store';

describe('gameSessionStore function', () => {
  it(
    'builds an empty store and keeps the patch this test set',
    { timeout: 5000 },
    () => {
      expect.hasAssertions();

      const connections = new Map();
      const store = gameSessionStore({ botTurnGapMs: 12, connections });

      expect(store.botTurnGapMs).toBe(12);
      expect(store.connections).toBe(connections);
      expect(store.metaByGameId.size).toBe(0);
    },
  );
});
