import type { CommandCard } from '@classicalmoser/prevail-rules/domain';
import { tempCommandCards } from '@classicalmoser/prevail-rules/sampleValues';

/**
 * A command card that names unit types.
 *
 * Printing resolves unit names, so a test that previews, stores or certifies a
 * card needs one that actually names units. The first sample card whose unit
 * support is by unit type does.
 */
const commandCardNamingUnits: CommandCard = (() => {
  const found = tempCommandCards.find(
    (card) => card.unitSupport.supportType === 'unitType',
  );
  if (found === undefined) {
    throw new Error('No sample command card names unit types');
  }
  return found;
})();

/** A second valid command card, distinct from {@link commandCardNamingUnits}. */
const otherValidCommandCard: CommandCard = tempCommandCards[5];

/**
 * One card with its certified flag, as storage reports certification status.
 *
 * @param card - A command card or a unit type.
 * @param certified - Whether its latest version is certified.
 * @returns The status entry a certification read answers with.
 */
const certificationStatus = <TCard>(
  card: TCard,
  certified: boolean,
): { card: TCard; certified: boolean } => ({ card, certified });

export { certificationStatus, commandCardNamingUnits, otherValidCommandCard };
