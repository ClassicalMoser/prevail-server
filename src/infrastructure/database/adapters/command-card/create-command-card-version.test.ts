import { recordedSql, tempCommandCards } from '@testing';
import { createCommandCardVersion } from './create-command-card-version';

describe('createCommandCardVersion function', () => {
  it(
    'answers 404 and inserts nothing when the command card is unknown',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const recorded = recordedSql([]);

      await expect(
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
