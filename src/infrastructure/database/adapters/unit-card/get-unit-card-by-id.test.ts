import { recordedSql } from '@testing';
import { getUnitCardById } from './get-unit-card-by-id';

describe('getUnitCardById function', () => {
  it(
    'answers 404 when the unit card has no version',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      await expect(
        getUnitCardById(recordedSql([]).sql, 'missing'),
      ).resolves.toStrictEqual({
        message: 'Unit card not found',
        status: 404,
        success: false,
      });
    },
  );
});
