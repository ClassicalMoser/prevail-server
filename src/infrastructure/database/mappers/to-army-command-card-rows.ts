import type { CommandCard } from '@classicalmoser/prevail-rules/domain';
import type { ArmyCommandCardDb } from '../db-types';

/**
 * Expand army command cards into join rows.
 *
 * Each listed card is one copy. Quantity stays 1 because the domain army
 * stores cards by identity, not by a stack count.
 *
 * @param armyId - Army that owns the rows.
 * @param commandCards - Domain command cards on the army.
 * @returns One row per card.
 */
const toArmyCommandCardRows = (
  armyId: string,
  commandCards: readonly CommandCard[],
): ArmyCommandCardDb[] => {
  const rows = commandCards.map((card) => ({
    army_id: armyId,
    command_card_id: card.id,
    quantity: 1,
  }));
  return rows;
};

export { toArmyCommandCardRows };
