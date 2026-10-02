/**
 * Tagged SQL for owned armies and their unit and command-card join rows.
 * Display name and composition are columns. Domain mapping happens in `mappers/`.
 */

import type { SqlClient } from '@infrastructure/database/sql-type';
import { querySql } from '@infrastructure/database/query-sql';

/**
 * Tagged SQL for owned armies and their unit and command-card join rows.
 * Display name and composition are columns. Domain mapping happens in `mappers/`.
 */

const deleteArmyCommandCardsQuery = async (
  client: SqlClient,
  armyId: string,
): Promise<void> => {
  const sql = querySql(client);
  await sql`DELETE FROM army_command_cards WHERE army_id = ${armyId}`;
};

export { deleteArmyCommandCardsQuery };
