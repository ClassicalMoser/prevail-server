import type { RoundEffect } from '@classicalmoser/prevail-rules/domain';
import { replaceRestrictionUnitIds } from './replace-restriction-unit-ids';
import type { UnitIdToNameMap } from './unit-id-to-name-map';

/**
 * Swap unit restriction ids for display names on a card's round effect.
 *
 * @param roundEffect - The card's round effect.
 * @param unitIdToNameMap - Map from unit type id to display name.
 * @returns The round effect with its restriction shown by name.
 */
const replaceRoundEffectUnitIds = (
  roundEffect: RoundEffect,
  unitIdToNameMap: UnitIdToNameMap,
): RoundEffect => {
  const restrictionsWithNames = replaceRestrictionUnitIds(
    roundEffect.restrictions,
    unitIdToNameMap,
  );
  const roundEffectWithNames: RoundEffect = {
    ...roundEffect,
    restrictions: restrictionsWithNames,
  };
  return roundEffectWithNames;
};

export { replaceRoundEffectUnitIds };
