import assert from 'node:assert/strict';
import type { UnitCardStorage } from '@ports';
import { buildUnitIdToNameMap } from './build-unit-id-to-name-map';
import { tempUnits } from '@testing';

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

      // No ids means no lookup is needed, so the map comes back empty and successful.
      const result = await buildUnitIdToNameMap(storage([]), []);

      expect(result).toStrictEqual({ data: new Map(), success: true });
    },
  );

  it(
    'fails when a requested unit id is missing from storage',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      // Storage holds only one of the two ids asked for; a card naming a unit that does not exist cannot be printed.
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

      // The stored unit is asked for by id; its name is what a printed command card shows.
      const result = await buildUnitIdToNameMap(storage([unit]), [unit.id]);

      expect(result).toStrictEqual({
        data: new Map([[unit.id, unit.name]]),
        success: true,
      });
    },
  );
});
