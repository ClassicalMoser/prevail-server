import type { UnitCount } from '@classicalmoser/prevail-rules/domain';
import type { ArmyUnitCardDb } from '../db-types';

/**
 * Expand army units into join rows.
 *
 * Quantity is the domain count. The unit card id is the unit type id.
 *
 * @param armyId - Army that owns the rows.
 * @param units - Domain unit counts, in write order.
 * @returns One row per unit type.
 */
const toArmyUnitCardRows = (
  armyId: string,
  units: readonly UnitCount[],
): ArmyUnitCardDb[] => {
  const rows = units.map((unit) => ({
    army_id: armyId,
    unit_card_id: unit.unitType.id,
    quantity: unit.count,
  }));
  return rows;
};

export { toArmyUnitCardRows };
