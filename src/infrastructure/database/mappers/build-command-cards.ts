import type { CommandCard } from '@classicalmoser/prevail-rules/domain';
import type { ArmyCommandCardDb } from '../db-types';
import { sortCommandCardsByInitiative } from './sort-command-cards-by-initiative';

/**
 * Rebuild command cards from join rows, initiative ascending.
 *
 * A row whose card is missing from the lookup is dropped, same as unit rows.
 *
 * @param rows - Command-card join rows for one army.
 * @param cardsById - Current command cards keyed by id.
 * @returns Resolved cards in initiative order.
 */
const buildCommandCards = (
  rows: readonly ArmyCommandCardDb[],
  cardsById: ReadonlyMap<string, CommandCard>,
): CommandCard[] => {
  const resolved = rows.flatMap((row) => {
    const card = cardsById.get(row.command_card_id);
    if (card === undefined) {
      return [];
    }
    return [card];
  });
  const sorted = sortCommandCardsByInitiative(resolved);
  return sorted;
};

export { buildCommandCards };
