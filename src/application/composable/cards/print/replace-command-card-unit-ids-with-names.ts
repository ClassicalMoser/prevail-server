/**
 * Command cards store unit type IDs in the domain model, but the print renderer
 * (Typst) displays human-readable unit names on the card face.
 *
 * Collect ids with {@link getCommandCardUnitIds}, build a map via
 * {@link buildUnitIdToNameMap}, then call this before render.
 */
import type { CommandCard } from '@classicalmoser/prevail-rules/domain';
import type { PrintCommandCard } from '@ports';
import { replaceRestrictionUnitIds } from './replace-restriction-unit-ids';
import { replaceRoundEffectUnitIds } from './replace-round-effect-unit-ids';
import { replaceUnitSupportIdWithName } from './replace-unit-support-id-with-name';
import type { UnitIdToNameMap } from './unit-id-to-name-map';

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
