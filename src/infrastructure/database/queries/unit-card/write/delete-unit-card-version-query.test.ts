import { recordedSql } from '@testing';
import { deleteUnitCardVersionQuery } from './delete-unit-card-version-query';

describe('deleteUnitCardVersionQuery function', () => {
  it(
    'deletes the unit card version triple this test named',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const recorded = recordedSql();
      await deleteUnitCardVersionQuery({
        sql: recorded.sql,
        unitCardId: 'unit-1',
        versionMajor: 1,
        versionMinor: 2,
        versionPatch: 3,
      });
      const call = recorded.calls[0];

      expect(call?.text).toContain('DELETE FROM unit_card_versions');
      expect(call?.values).toStrictEqual(['unit-1', 1, 2, 3]);
    },
  );
});
