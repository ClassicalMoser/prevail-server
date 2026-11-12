import { gameSessionStore, watcher } from '@testing';
import { requireRegisteredWatcher } from './require-registered-watcher';

const meta = {
  creatorSubject: 'auth0|human',
  gameMode: 'mini',
  kind: 'botVsBot',
  stuck: false,
} as const;

describe('requireRegisteredWatcher function', () => {
  it('admits the creator once registered', { timeout: 5000 }, () => {
    expect.hasAssertions();

    // The default watcher is the creator of the bot-vs-bot game in `meta`.
    const { connection } = watcher('game-1');
    // The socket is in the watcher set for the game, i.e. it passed registration.
    const store = gameSessionStore({
      metaByGameId: new Map([['game-1', { ...meta }]]),
      watchers: new Map([['game-1', new Set([connection])]]),
    });

    const access = requireRegisteredWatcher(store, connection);

    expect(access).toMatchObject({ data: { kind: 'botVsBot' }, success: true });
  });

  it('refuses the creator before registration', { timeout: 5000 }, () => {
    expect.hasAssertions();

    // The same creator, but this socket never registered as a watcher.
    const { connection } = watcher('game-1');
    // No watchers map: a message from an unregistered socket cannot skip the open-time check.
    const store = gameSessionStore({
      metaByGameId: new Map([['game-1', { ...meta }]]),
    });

    const access = requireRegisteredWatcher(store, connection);

    expect(access).toMatchObject({ status: 400, success: false });
  });
});
