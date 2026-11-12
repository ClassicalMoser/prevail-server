import { recordedSql } from '@testing';
import { getAllUnitCards } from './get-all-unit-cards';

describe('getAllUnitCards function', () => {
  it(
    'answers an empty catalog as an empty list',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      await expect(getAllUnitCards(recordedSql([]).sql)).resolves.toStrictEqual(
        {
          data: [],
          success: true,
        },
      );
    },
  );
});
