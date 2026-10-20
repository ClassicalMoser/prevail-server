import { gameSessionStore } from '@testing';
import { playBotVsBotChoice } from './play-bot-vs-bot-choice';

describe('playBotVsBotChoice function', () => {
  it(
    'returns undefined when the game is not bot-vs-bot',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const store = gameSessionStore();
      const played = await playBotVsBotChoice(store, 'missing');

      expect(played).toBeUndefined();
    },
  );
});
