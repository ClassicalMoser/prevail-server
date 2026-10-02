import assert from 'node:assert/strict';
import { tempUnits } from '@classicalmoser/prevail-rules/domain';
import type { UnitCardStorage } from '@ports';
import { buildUnitIdToNameMap } from './build-unit-id-to-name-map';

const unit = tempUnits[0];
assert.ok(unit !== undefined);

const storage = (units: (typeof unit)[]): UnitCardStorage =>
  ({
    getUnitCardsByIds: async (ids) => ({
      data: units.filter((entry) => ids.includes(entry.id)),
      success: true,
    }),
  }) as UnitCardStorage; // partial double; only getUnitCardsByIds is exercised

describe('buildUnitIdToNameMap function', () => {
  it(
    'returns an empty map when no ids are requested',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const result = await buildUnitIdToNameMap(storage([]), []);

      expect(result).toStrictEqual({ data: new Map(), success: true });
    },
  );

  it(
    'fails when a requested unit id is missing from storage',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const result = await buildUnitIdToNameMap(storage([unit]), [
        unit.id,
        'missing-unit',
      ]);

      expect(result).toStrictEqual({
        message: 'Unit card not found: missing-unit',
        status: 404,
        success: false,
      });
    },
  );

  it(
    'maps each requested unit id to its stored name',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const result = await buildUnitIdToNameMap(storage([unit]), [unit.id]);

      expect(result).toStrictEqual({
        data: new Map([[unit.id, unit.name]]),
        success: true,
      });
    },
  );
});
