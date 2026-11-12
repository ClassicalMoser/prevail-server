import { gameSessionStore } from '@testing';
import { requireBotVsBotSession } from './require-bot-vs-bot-session';

describe('requireBotVsBotSession function', () => {
  it('returns 404 when the game is human-vs-bot', { timeout: 5000 }, () => {
    expect.hasAssertions();

    const store = gameSessionStore();
    store.metaByGameId.set('game-1', {
      gameMode: 'mini',
      humanSide: 'white',
      humanSubject: 'auth0|human',
      kind: 'vsBot',
    });

    const access = requireBotVsBotSession(store, 'auth0|human', 'game-1');

    expect(access).toStrictEqual({
      message: 'Game not found',
      status: 404,
      success: false,
    });
  });

  it(
    'returns the meta when the creator names a bot-vs-bot game',
    { timeout: 5000 },
    () => {
      expect.hasAssertions();

      const store = gameSessionStore();
      const meta = {
        creatorSubject: 'auth0|human',
        gameMode: 'standard' as const,
        kind: 'botVsBot' as const,
        stuck: false,
      };
      store.metaByGameId.set('game-1', meta);

      const access = requireBotVsBotSession(store, 'auth0|human', 'game-1');

      expect(access).toStrictEqual({ data: meta, success: true });
    },
  );
});
