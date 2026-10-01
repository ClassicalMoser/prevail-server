import { BOT_SUBJECT } from './bot-subject';

describe('bOT_SUBJECT constant', () => {
  it(
    'is the seat-auth subject the bot socket presents',
    { timeout: 5000 },
    () => {
      expect.hasAssertions();

      expect(BOT_SUBJECT).toBe('bot:prevail');
    },
  );
});
