import { recordedSql } from '@testing';
import { loadUnitTypesById } from './load-unit-types-by-id';

describe('loadUnitTypesById function', () => {
  it(
    'asks the catalog for the ids it was given',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const recorded = recordedSql();
      const found = await loadUnitTypesById(recorded.sql, ['unit-1', 'unit-2']);

      expect(recorded.calls[0]?.values).toStrictEqual([['unit-1', 'unit-2']]);
      expect(found.size).toBe(0);
    },
  );

  it(
    'skips the catalog for an army with no units',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const recorded = recordedSql();
      await loadUnitTypesById(recorded.sql, []);

      expect(recorded.calls).toStrictEqual([]);
    },
  );
});
