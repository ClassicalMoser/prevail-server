import { recordedSql, tempUnits } from '@testing';
import { createUnitCardVersion } from './create-unit-card-version';

describe('createUnitCardVersion function', () => {
  it(
    'answers 404 and inserts nothing when the unit card is unknown',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const recorded = recordedSql([]);

      await expect(
        createUnitCardVersion(recorded.sql, tempUnits[0]),
      ).resolves.toStrictEqual({
        message: 'Unit card not found',
        status: 404,
        success: false,
      });
      // Only the existence check ran; no version was written.
      expect(recorded.calls).toHaveLength(1);
    },
  );
});
