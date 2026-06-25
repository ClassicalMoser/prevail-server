/**
 * Command cards store unit type IDs in the domain model, but the print renderer
 * (Typst) displays human-readable unit names on the card face.
 *
 * This module bridges that gap with a two-step pipeline:
 *   1. getCommandCardUnitIds  — collect every unit type ID referenced on a card
 *   2. replaceUnitIdsWithNames — swap those IDs for display names before render
 *
 * The caller is responsible for building the ID→name map (typically a single
 * batch query against unit storage). See buildPlaceholderUnitIdToNameMap for
 * a stand-in until that query exists.
 */
import type {
  Card,
  RoundEffect,
  UnitSupport,
} from '@classicalmoser/prevail-rules/domain';
import type { PrintCommandCard } from '@ports';

/** Lookup table produced by a batch unit-name query. Keys are unit type IDs. */
type UnitIdToNameMap = ReadonlyMap<string, string>;

/**
 * Stand-in map builder for development and testing.
 * Replace with a real storage query once unit name lookup is wired up.
 */
const buildPlaceholderUnitIdToNameMap = (unitIds: string[]): UnitIdToNameMap =>
  new Map(unitIds.map((id) => [id, `NAME_${id.slice(0, 5)}...`]));

/** Get the name of a unit type from the lookup table. */
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
): string[] => unitIds.map((id) => getUnitName(unitIdToNameMap, id));

/**
 * Collect all unit type IDs referenced anywhere on a command card.
 *
 * A card can reference unit types in three places:
 *   - command restrictions  (which units may execute the command)
 *   - round effect restrictions  (which units the round effect applies to)
 *   - unit support  (which unit type the card supports, when supportType is 'unitType')
 *
 * Returns a deduplicated list suitable for a single batch name lookup.
 */
const getCommandCardUnitIds = (card: Card): string[] => {
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

  return [...new Set(unitIds)];
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

/** Swap unit restriction IDs for display names on the round effect, if present. */
const replaceRoundEffectUnitIds = (
  roundEffect: RoundEffect,
  unitIdToNameMap: UnitIdToNameMap,
): RoundEffect => {
  const restrictions = roundEffect.restrictions;
  const unitRestrictionIds = restrictions.unitRestrictions;
  const unitRestrictionNames = replaceUnitIdsWithNames(
    unitRestrictionIds,
    unitIdToNameMap,
  );

  return {
    ...roundEffect,
    restrictions: {
      ...restrictions,
      unitRestrictions: unitRestrictionNames,
    },
  };
};

/**
 * Produce a PrintCommandCard by replacing every unit type ID on the card
 * with its display name. The card shape is unchanged — only the string
 * values in restriction and support fields differ.
 */
const replaceCommandCardUnitIdsWithNames = (
  card: Card,
  unitIdToNameMap: UnitIdToNameMap,
): PrintCommandCard => {
  const command = card.command;
  const commandRestrictions = command.restrictions;
  const commandUnitRestrictionIds = commandRestrictions.unitRestrictions;
  const commandUnitRestrictionNames = replaceUnitIdsWithNames(
    commandUnitRestrictionIds,
    unitIdToNameMap,
  );

  const commandWithNames = {
    ...command,
    restrictions: {
      ...commandRestrictions,
      unitRestrictions: commandUnitRestrictionNames,
    },
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

  return {
    ...card,
    command: commandWithNames,
    roundEffect: roundEffectWithNames,
    unitSupport: unitSupportWithNames,
  };
};

export type { UnitIdToNameMap };
export {
  buildPlaceholderUnitIdToNameMap,
  getCommandCardUnitIds,
  replaceCommandCardUnitIdsWithNames,
};
