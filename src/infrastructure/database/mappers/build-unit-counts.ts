import type { UnitCount, UnitType } from '@classicalmoser/prevail-rules/domain';
import type { ArmyUnitCardDb } from '../db-types';

/**
 * Rebuild unit counts from join rows.
 *
 * A row whose unit card is missing from the lookup is dropped. The army read
 * still returns the rows it can resolve instead of failing the whole army.
 *
 * @param rows - Unit join rows for one army.
 * @param unitTypesById - Current unit cards keyed by id.
 * @returns Domain counts for the rows that resolved.
 */
const buildUnitCounts = (
  rows: readonly ArmyUnitCardDb[],
  unitTypesById: ReadonlyMap<string, UnitType>,
): UnitCount[] => {
  const counts = rows.flatMap((row) => {
    const unitType = unitTypesById.get(row.unit_card_id);
    if (unitType === undefined) {
      return [];
    }
    const count: UnitCount = { unitType, count: row.quantity };
    return [count];
  });
  return counts;
};

export { buildUnitCounts };
