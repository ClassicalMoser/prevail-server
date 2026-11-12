import { gameSessionStore } from '@testing';
import { requireVsBotSeat } from './require-vs-bot-seat';

const vsBotMeta = {
  gameMode: 'mini',
  humanSide: 'white',
  humanSubject: 'auth0|human',
  kind: 'vsBot',
} as const;

const botVsBotMeta = {
  creatorSubject: 'auth0|human',
  gameMode: 'mini',
  kind: 'botVsBot',
  stuck: false,
} as const;

describe('requireVsBotSeat function', () => {
  it('admits the human to their own seat', { timeout: 5000 }, () => {
    expect.hasAssertions();

    // A human-vs-bot game where the human plays white.
    const store = gameSessionStore({
      metaByGameId: new Map([['game-1', { ...vsBotMeta }]]),
    });

    expect(
      requireVsBotSeat(store, {
        gameId: 'game-1',
        side: 'white',
        subject: 'auth0|human',
      }),
    ).toMatchObject({ data: { kind: 'vsBot' }, success: true });
  });

  it("refuses the human the bot's seat with 403", { timeout: 5000 }, () => {
    expect.hasAssertions();

    // The human holds white, so black is the bot's seat; a human may not speak for it.
    const store = gameSessionStore({
      metaByGameId: new Map([['game-1', { ...vsBotMeta }]]),
    });

    expect(
      requireVsBotSeat(store, {
        gameId: 'game-1',
        side: 'black',
        subject: 'auth0|human',
      }),
    ).toMatchObject({ status: 403, success: false });
  });

  it(
    'answers 404 for a game this process does not host',
    { timeout: 5000 },
    () => {
      expect.hasAssertions();

      expect(
        // An empty store: this process hosts no such game, so the answer is not-found.
        requireVsBotSeat(gameSessionStore(), {
          gameId: 'nope',
          side: 'white',
          subject: 'auth0|human',
        }),
      ).toMatchObject({ status: 404, success: false });
    },
  );

  it(
    'answers 404 for a bot-vs-bot game, which has no seats',
    { timeout: 5000 },
    () => {
      expect.hasAssertions();

      // A bot-vs-bot game has only watchers, so asking for a seat in it finds nothing.
      const store = gameSessionStore({
        metaByGameId: new Map([['game-1', { ...botVsBotMeta }]]),
      });

      expect(
        requireVsBotSeat(store, {
          gameId: 'game-1',
          side: 'white',
          subject: 'auth0|human',
        }),
      ).toMatchObject({ status: 404, success: false });
    },
  );
});
