import { gameSessionStore } from '@testing';
import { playBotVsBotChoice } from './play-bot-vs-bot-choice';

describe('playBotVsBotChoice function', () => {
  it(
    'reports missing when the game is not bot-vs-bot',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      // An empty store has no session meta, so the game is not a bot-vs-bot game.
      const store = gameSessionStore();
      const played = await playBotVsBotChoice(store, 'missing');

      expect(played).toBe('missing');
    },
  );

  it('plays nothing once the game is stuck', { timeout: 5000 }, async () => {
    expect.hasAssertions();

    // A bot-vs-bot game already marked stuck after an earlier bot or engine failure.
    const store = gameSessionStore();
    store.metaByGameId.set('game-1', {
      creatorSubject: 'auth0|human',
      gameMode: 'mini',
      kind: 'botVsBot',
      stuck: true,
    });

    const played = await playBotVsBotChoice(store, 'game-1');

    expect(played).toBe('stuck');
    // A stuck game stays stopped: the engine is never asked to take another choice.
    expect(store.runner.handlePlayerChoiceSubmission).not.toHaveBeenCalled();
  });
});
