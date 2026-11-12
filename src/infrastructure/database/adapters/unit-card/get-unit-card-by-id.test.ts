import { recordedSql } from '@testing';
import { getUnitCardById } from './get-unit-card-by-id';

describe('getUnitCardById function', () => {
  it(
    'answers 404 when the unit card has no version',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      await expect(
        // A card with no version row cannot be played, so it is a 404.
        getUnitCardById(recordedSql([]).sql, 'missing'),
      ).resolves.toStrictEqual({
        message: 'Unit card not found',
        status: 404,
        success: false,
      });
    },
  );
});
