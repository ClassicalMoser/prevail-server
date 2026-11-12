import { recordedSql } from '@testing';
import { getCurrentUnitCards } from './get-current-unit-cards';

describe('getCurrentUnitCards function', () => {
  it(
    'answers an empty catalog as an empty list',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      await expect(
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

      const recorded = recordedSql([]);
      await getCurrentUnitCards(recorded.sql);

      expect(recorded.calls[0]?.text).toContain('certif');
    },
  );
});
