import { recordedSql } from '@testing';
import { getCurrentCommandCards } from './get-current-command-cards';

describe('getCurrentCommandCards function', () => {
  it(
    'answers an empty catalog as an empty list',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      await expect(
        getCurrentCommandCards(recordedSql([]).sql),
      ).resolves.toStrictEqual({
        data: [],
        success: true,
      });
    },
  );

  it(
    'reads only the latest certified versions',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const recorded = recordedSql([]);
      await getCurrentCommandCards(recorded.sql);

      expect(recorded.calls[0]?.text).toContain('certif');
    },
  );
});
