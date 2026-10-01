/**
 * Tagged SQL for owned armies and their unit and command-card join rows.
 * Display name and composition are columns. Domain mapping happens in `mappers/`.
 */

import type {
  ArmyCommandCardDb,
} from '@infrastructure/database/db-types';

import type {
  Sql,
} from '@infrastructure/database/sql-type';

/**
 * Tagged SQL for owned armies and their unit and command-card join rows.
 * Display name and composition are columns. Domain mapping happens in `mappers/`.
 */

const getArmyCommandCardsQuery = async (
  sql: Sql,
  armyId: string,
): Promise<ArmyCommandCardDb[]> =>
  await sql`
    SELECT army_id, command_card_id, quantity
    FROM army_command_cards
    WHERE army_id = ${armyId}
  `;

export { getArmyCommandCardsQuery };
