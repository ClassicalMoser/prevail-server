import { gameSessionStore } from './game-session-store';

describe('gameSessionStore function', () => {
  it(
    'builds an empty store and keeps the patch this test set',
    { timeout: 5000 },
    () => {
      expect.hasAssertions();

      // A connections map the test owns, so it can check the store keeps that
      // same map.
      const connections = new Map();
      // Only the bot gap is overridden; everything else starts from defaults.
      const store = gameSessionStore({ botTurnGapMs: 12, connections });

      // The override is kept.
      expect(store.botTurnGapMs).toBe(12);
      // The supplied map is used, not a copy.
      expect(store.connections).toBe(connections);
      // A new store starts with no games.
      expect(store.metaByGameId.size).toBe(0);
    },
  );
});
