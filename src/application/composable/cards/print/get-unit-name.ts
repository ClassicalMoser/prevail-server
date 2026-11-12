import type { UnitIdToNameMap } from './unit-id-to-name-map';

/**
 * Name for a unit type id, or throw when the map has no entry.
 *
 * A missing id means the caller looked up cards that are not on this card.
 * The throw aborts the render so the route boundary can report the failure.
 *
 * @param unitIdToNameMap - Map from unit type id to display name.
 * @param id - Unit type id printed on the card.
 * @returns The unit's display name.
 */
const getUnitName = (unitIdToNameMap: UnitIdToNameMap, id: string): string => {
  const name = unitIdToNameMap.get(id);
  if (name === undefined) {
    throw new Error(`Unit ID ${id} not found in name map`);
  }
  return name;
};

export { getUnitName };
