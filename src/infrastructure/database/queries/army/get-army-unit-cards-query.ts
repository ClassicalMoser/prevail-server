/**
 * Tagged SQL for owned armies and their unit and command-card join rows.
 * Display name and composition are columns. Domain mapping happens in `mappers/`.
 */

import type {
  ArmyUnitCardDb,
} from '@infrastructure/database/db-types';

import type {
  Sql,
} from '@infrastructure/database/sql-type';

/**
 * Tagged SQL for owned armies and their unit and command-card join rows.
 * Display name and composition are columns. Domain mapping happens in `mappers/`.
 */

const getArmyUnitCardsQuery = async (
  sql: Sql,
  armyId: string,
): Promise<ArmyUnitCardDb[]> =>
  await sql`
    SELECT army_id, unit_card_id, quantity
    FROM army_unit_cards
    WHERE army_id = ${armyId}
  `;

export { getArmyUnitCardsQuery };
