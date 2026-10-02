import type { CommandCard } from '@classicalmoser/prevail-rules/domain';

/**
 * Collect all unit type IDs referenced anywhere on a command card.
 *
 * A card can reference unit types in three places:
 *   - command restrictions  (which units may execute the command)
 *   - round effect restrictions  (which units the round effect applies to)
 *   - unit support  (which unit type the card supports, when supportType is 'unitType')
 *
 * Returns a deduplicated list suitable for a single batch name lookup.
 *
 * @param card - Domain command card to scan.
 * @returns Unique unit type ids referenced on the card.
 */
const getCommandCardUnitIds = (card: CommandCard): string[] => {
  const commandUnitRestrictionIds = card.command.restrictions.unitRestrictions;
  const roundEffectUnitRestrictionIds =
    card.roundEffect?.restrictions.unitRestrictions ?? [];
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
