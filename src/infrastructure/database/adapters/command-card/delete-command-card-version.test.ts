import { recordedSql, tempCommandCards } from '@testing';
import { deleteCommandCardVersion } from './delete-command-card-version';

describe('deleteCommandCardVersion function', () => {
  it(
    'deletes the row named by the command card id and its version',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const recorded = recordedSql([]);
      // The card's version is the string '1.2.3'; the delete must split it into
      // major, minor, patch columns.
      const card = { ...tempCommandCards[0], version: '1.2.3' };

      await expect(
        deleteCommandCardVersion(recorded.sql, card),
      ).resolves.toStrictEqual({
        data: undefined,
        success: true,
      });
      // Card id, then 1, 2, 3: only that one version is removed.
      expect(recorded.calls[0]?.values).toStrictEqual([card.id, 1, 2, 3]);
    },
  );
});
