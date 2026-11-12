import { recordedSql } from '@testing';
import { getCommandCardById } from './get-command-card-by-id';

describe('getCommandCardById function', () => {
  it(
    'answers 404 when the command card has no version',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      await expect(
        getCommandCardById(recordedSql([]).sql, 'missing'),
      ).resolves.toStrictEqual({
        message: 'Command card not found',
        status: 404,
        success: false,
      });
    },
  );
});
