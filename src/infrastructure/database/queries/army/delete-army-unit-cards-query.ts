/**
 * Tagged SQL for owned armies and their unit and command-card join rows.
 * Display name and composition are columns. Domain mapping happens in `mappers/`.
 */

import type { SqlClient } from '@infrastructure/database/sql-type';
import { querySql } from '@infrastructure/database/query-sql';

/**
 * Delete every unit-card join row for one army.
 *
 * The army update clears these rows, then inserts the new quantities. The
 * caller runs this on the same transaction as the rename and the inserts, so
 * a later failure restores the previous composition.
 *
 * @param client - Connection or open transaction.
 * @param armyId - Army whose unit rows are removed.
 */
const deleteArmyUnitCardsQuery = async (
  client: SqlClient,
  armyId: string,
): Promise<void> => {
  const sql = querySql(client);
  await sql`DELETE FROM army_unit_cards WHERE army_id = ${armyId}`;
};

export { deleteArmyUnitCardsQuery };
