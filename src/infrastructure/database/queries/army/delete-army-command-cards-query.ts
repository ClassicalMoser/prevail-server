/**
 * Tagged SQL for owned armies and their unit and command-card join rows.
 * Display name and composition are columns. Domain mapping happens in `mappers/`.
 */

import type {
  Sql,
} from '@infrastructure/database/sql-type';

/**
 * Tagged SQL for owned armies and their unit and command-card join rows.
 * Display name and composition are columns. Domain mapping happens in `mappers/`.
 */

const deleteArmyCommandCardsQuery = async (
  sql: Sql,
  armyId: string,
): Promise<void> => {
  await sql`DELETE FROM army_command_cards WHERE army_id = ${armyId}`;
};

export { deleteArmyCommandCardsQuery };
