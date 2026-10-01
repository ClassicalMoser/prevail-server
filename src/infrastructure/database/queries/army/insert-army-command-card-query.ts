/**
 * Tagged SQL for owned armies and their unit and command-card join rows.
 * Display name and composition are columns. Domain mapping happens in `mappers/`.
 */

import type { ArmyCommandCardDb } from '@infrastructure/database/db-types';

import type { SqlClient } from '@infrastructure/database/sql-type';
import { querySql } from '@infrastructure/database/query-sql';

/**
 * Tagged SQL for owned armies and their unit and command-card join rows.
 * Display name and composition are columns. Domain mapping happens in `mappers/`.
 */

const insertArmyCommandCardQuery = async (
  client: SqlClient,
  row: ArmyCommandCardDb,
): Promise<void> => {
  const sql = querySql(client);
  await sql`
    INSERT INTO army_command_cards (army_id, command_card_id, quantity)
    VALUES (${row.army_id}, ${row.command_card_id}, ${row.quantity})
  `;
};

export { insertArmyCommandCardQuery };
