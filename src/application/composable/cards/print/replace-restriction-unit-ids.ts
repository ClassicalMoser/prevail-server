import type { Restrictions } from '@classicalmoser/prevail-rules/domain';
import { replaceUnitIdsWithNames } from './replace-unit-ids-with-names';
import type { UnitIdToNameMap } from './unit-id-to-name-map';

/**
 * Swap unit-type restriction ids for display names.
 *
 * Trait filters and open restrictions have no unit type ids. Those variants
 * are returned as they arrived so a spread cannot attach `unitRestrictions`
 * to a variant that does not carry them.
 *
 * @param restrictions - Command or round-effect restriction.
 * @param unitIdToNameMap - Map from unit type id to display name.
 * @returns The same restriction, with unit type ids replaced when present.
 */
const replaceRestrictionUnitIds = (
  restrictions: Restrictions,
  unitIdToNameMap: UnitIdToNameMap,
): Restrictions => {
  if (restrictions.restrictionType !== 'unitType') {
    return restrictions;
  }

  // Rebuild the variant by hand so only unit-type restrictions carry the names.
  const unitRestrictionNames = replaceUnitIdsWithNames(
    restrictions.unitRestrictions,
    unitIdToNameMap,
  );
  const namedRestrictions: Restrictions = {
    inspirationRangeRestriction: restrictions.inspirationRangeRestriction,
    restrictionType: 'unitType',
    unitRestrictions: unitRestrictionNames,
  };
  return namedRestrictions;
};

export { replaceRestrictionUnitIds };
