import { recordedSql } from '@testing';
import { getCurrentUnitCards } from './get-current-unit-cards';

describe('getCurrentUnitCards function', () => {
  it(
    'answers an empty catalog as an empty list',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      await expect(
        // No certified cards yet is an empty catalog, not an error.
        getCurrentUnitCards(recordedSql([]).sql),
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

      // Only the statement is under test here.
      const recorded = recordedSql([]);
      await getCurrentUnitCards(recorded.sql);

      // Players are offered certified versions only; the statement mentions
      // certification.
      expect(recorded.calls[0]?.text).toContain('certif');
    },
  );
});
