import { getUnitName } from './get-unit-name';
import type { UnitIdToNameMap } from './unit-id-to-name-map';

/**
 * Replace every id in a restriction list with its display name, in order.
 *
 * @param unitIds - Unit type ids from a restriction.
 * @param unitIdToNameMap - Map from unit type id to display name.
 * @returns The names, in the same order as the ids.
 */
const replaceUnitIdsWithNames = (
  unitIds: string[],
  unitIdToNameMap: UnitIdToNameMap,
): string[] => {
  const names = unitIds.map((id) => getUnitName(unitIdToNameMap, id));
  return names;
};

export { replaceUnitIdsWithNames };
