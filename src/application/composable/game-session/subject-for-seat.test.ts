import { BOT_SUBJECT } from './bot-subject';
import { subjectForSeat } from './subject-for-seat';

describe('subjectForSeat function', () => {
  it(
    'gives the human subject their side and the bot subject the other',
    { timeout: 5000 },
    () => {
      expect.hasAssertions();

      const meta = {
        gameMode: 'mini' as const,
        humanSide: 'white' as const,
        humanSubject: 'auth0|human',
      };

      expect(subjectForSeat(meta, 'white')).toBe('auth0|human');
      expect(subjectForSeat(meta, 'black')).toBe(BOT_SUBJECT);
    },
  );
});
