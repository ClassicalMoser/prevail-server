import type {
  CommandCard,
  Restrictions,
} from '@classicalmoser/prevail-rules/domain';

/**
 * Unit type ids named by a restriction, when the filter is a unit-type list.
 *
 * A trait filter and an open restriction name no unit types. Callers collect
 * ids for a name lookup and must not read `unitRestrictions` off the other
 * variants.
 *
 * @param restrictions - Command or round-effect restriction.
 * @returns The unit type ids, or an empty list when this variant has none.
 */
const unitIdsFromRestrictions = (restrictions: Restrictions): string[] => {
  if (restrictions.restrictionType !== 'unitType') {
    const noUnitIds: string[] = [];
    return noUnitIds;
  }
  const unitIds = [...restrictions.unitRestrictions];
  return unitIds;
};

/**
 * Collect all unit type IDs referenced anywhere on a command card.
 *
 * A card can reference unit types in three places:
 *   - command restrictions, when `restrictionType` is `unitType`
 *   - round effect restrictions, on that same variant
 *   - unit support, when `supportType` is `unitType`
 *
 * Trait filters and open restrictions contribute nothing. The list is
 * deduplicated so one batch name lookup covers the card.
 *
 * @param card - Domain command card to scan.
 * @returns Unique unit type ids referenced on the card.
 */
const getCommandCardUnitIds = (card: CommandCard): string[] => {
  const commandUnitRestrictionIds = unitIdsFromRestrictions(
    card.command.restrictions,
  );
  const roundEffectUnitRestrictionIds = unitIdsFromRestrictions(
    card.roundEffect.restrictions,
  );
  const unitSupport = card.unitSupport;

  const unitIds = [
    ...commandUnitRestrictionIds,
    ...roundEffectUnitRestrictionIds,
  ];

  if (unitSupport.supportType === 'unitType') {
    unitIds.push(unitSupport.unitTypeId);
  }

  const uniqueIds = [...new Set(unitIds)];
  return uniqueIds;
};

export { getCommandCardUnitIds };
