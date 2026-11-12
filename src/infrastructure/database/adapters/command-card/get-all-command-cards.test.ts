import { recordedSql } from '@testing';
import { getAllCommandCards } from './get-all-command-cards';

describe('getAllCommandCards function', () => {
  it(
    'answers an empty catalog as an empty list',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      await expect(
        // With no rows, the catalog is an empty list, not a failure.
        getAllCommandCards(recordedSql([]).sql),
      ).resolves.toStrictEqual({
        data: [],
        success: true,
      });
    },
  );
});
