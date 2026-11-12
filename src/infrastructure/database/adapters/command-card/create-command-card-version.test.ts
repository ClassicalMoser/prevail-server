import { recordedSql, tempCommandCards } from '@testing';
import { createCommandCardVersion } from './create-command-card-version';

describe('createCommandCardVersion function', () => {
  it(
    'answers 404 and inserts nothing when the command card is unknown',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      // The existence check finds no card, so this id is unknown.
      const recorded = recordedSql([]);

      await expect(
        // A catalog card from the sample set, offered as a new version of a
        // card the database does not have.
        createCommandCardVersion(recorded.sql, tempCommandCards[0]),
      ).resolves.toStrictEqual({
        message: 'Command card not found',
        status: 404,
        success: false,
      });
      // Only the existence check ran; no version was written.
      expect(recorded.calls).toHaveLength(1);
    },
  );
});
