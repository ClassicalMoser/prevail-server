import { recordedSql, tempUnits } from '@testing';
import { deleteUnitCardVersion } from './delete-unit-card-version';

describe('deleteUnitCardVersion function', () => {
  it(
    'deletes the row named by the unit card id and its version',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const recorded = recordedSql([]);
      // The unit's version is the string '1.2.3'; the delete must split it into
      // major, minor, patch columns.
      const unitType = { ...tempUnits[0], version: '1.2.3' };

      await expect(
        deleteUnitCardVersion(recorded.sql, unitType),
      ).resolves.toStrictEqual({
        data: undefined,
        success: true,
      });
      // Unit id, then 1, 2, 3: only that one version is removed.
      expect(recorded.calls[0]?.values).toStrictEqual([unitType.id, 1, 2, 3]);
    },
  );
});
