/**
 * Command cards store unit type IDs in the domain model, but the print renderer
 * (Typst) displays human-readable unit names on the card face.
 *
 * Collect ids with {@link getCommandCardUnitIds}, build a map via
 * {@link buildUnitIdToNameMap}, then call this before render.
 */
import type {
  CommandCard,
  Restrictions,
  RoundEffect,
  UnitSupport,
} from '@classicalmoser/prevail-rules/domain';
import type { PrintCommandCard } from '@ports';
import type { UnitIdToNameMap } from './unit-id-to-name-map';

/**
 * Name for a unit type id, or throw when the map has no entry.
 *
 * A missing id means the caller looked up cards that are not on this card.
 * The throw aborts the render so the route boundary can report the failure.
 */
const getUnitName = (unitIdToNameMap: UnitIdToNameMap, id: string): string => {
  const name = unitIdToNameMap.get(id);
  if (name === undefined) {
    throw new Error(`Unit ID ${id} not found in name map`);
  }
  return name;
};

/** Replace every ID in a restriction array with its display name, preserving order. */
const replaceUnitIdsWithNames = (
  unitIds: string[],
  unitIdToNameMap: UnitIdToNameMap,
): string[] => {
  const names = unitIds.map((id) => getUnitName(unitIdToNameMap, id));
  return names;
};

/**
 * Replace the unitTypeId on unit support when the card supports a specific
 * unit type. Generic and trait-based support have no unit type ID to swap.
 */
const replaceUnitSupportIdWithName = (
  unitSupport: UnitSupport,
  unitIdToNameMap: UnitIdToNameMap,
): UnitSupport => {
  if (unitSupport.supportType !== 'unitType') {
    return unitSupport;
  }

  const unitTypeId = unitSupport.unitTypeId;
  const unitTypeName = getUnitName(unitIdToNameMap, unitTypeId);

  return {
    ...unitSupport,
    unitTypeId: unitTypeName,
  };
};

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

  const unitRestrictionIds = restrictions.unitRestrictions;
  const unitRestrictionNames = replaceUnitIdsWithNames(
    unitRestrictionIds,
    unitIdToNameMap,
  );
  const namedRestrictions: Restrictions = {
    inspirationRangeRestriction: restrictions.inspirationRangeRestriction,
    restrictionType: 'unitType',
    unitRestrictions: unitRestrictionNames,
  };
  return namedRestrictions;
};

/** Swap unit restriction IDs for display names on the round effect. */
const replaceRoundEffectUnitIds = (
  roundEffect: RoundEffect,
  unitIdToNameMap: UnitIdToNameMap,
): RoundEffect => {
  const restrictions = roundEffect.restrictions;
  const restrictionsWithNames = replaceRestrictionUnitIds(
    restrictions,
    unitIdToNameMap,
  );
  const roundEffectWithNames: RoundEffect = {
    ...roundEffect,
    restrictions: restrictionsWithNames,
  };
  return roundEffectWithNames;
};

/**
 * Produce a PrintCommandCard by replacing every unit type ID on the card
 * with its display name. Only a `unitType` restriction and unit-type support
 * carry those ids. Trait filters and open restrictions are left as they are.
 *
 * @param card - Domain command card with unit type ids.
 * @param unitIdToNameMap - Map from unit type id to display name.
 * @returns A print card whose restriction/support strings are names.
 */
const replaceCommandCardUnitIdsWithNames = (
  card: CommandCard,
  unitIdToNameMap: UnitIdToNameMap,
): PrintCommandCard => {
  const command = card.command;
  const commandRestrictions = command.restrictions;
  const commandRestrictionsWithNames = replaceRestrictionUnitIds(
    commandRestrictions,
    unitIdToNameMap,
  );
  const commandWithNames = {
    ...command,
    restrictions: commandRestrictionsWithNames,
  };

  const roundEffect = card.roundEffect;
  const roundEffectWithNames = replaceRoundEffectUnitIds(
    roundEffect,
    unitIdToNameMap,
  );

  const unitSupport = card.unitSupport;
  const unitSupportWithNames = replaceUnitSupportIdWithName(
    unitSupport,
    unitIdToNameMap,
  );

  const printCard: PrintCommandCard = {
    ...card,
    command: commandWithNames,
    roundEffect: roundEffectWithNames,
    unitSupport: unitSupportWithNames,
  };
  return printCard;
};

export { replaceCommandCardUnitIdsWithNames };
