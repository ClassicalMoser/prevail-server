import type { UnitSupport } from '@classicalmoser/prevail-rules/domain';
import { getUnitName } from './get-unit-name';
import type { UnitIdToNameMap } from './unit-id-to-name-map';

/**
 * Replace the unit type id on unit support with the unit's name, when the
 * card supports a specific unit type.
 *
 * Generic and trait-based support name no unit type, so they print as they are.
 *
 * @param unitSupport - The card's unit support.
 * @param unitIdToNameMap - Map from unit type id to display name.
 * @returns The same support, with the unit type shown by name when it has one.
 */
const replaceUnitSupportIdWithName = (
  unitSupport: UnitSupport,
  unitIdToNameMap: UnitIdToNameMap,
): UnitSupport => {
  if (unitSupport.supportType !== 'unitType') {
    return unitSupport;
  }

  const unitTypeName = getUnitName(unitIdToNameMap, unitSupport.unitTypeId);
  const namedSupport: UnitSupport = {
    ...unitSupport,
    unitTypeId: unitTypeName,
  };
  return namedSupport;
};

export { replaceUnitSupportIdWithName };
