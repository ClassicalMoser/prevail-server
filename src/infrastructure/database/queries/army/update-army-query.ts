/**
 * Tagged SQL for owned armies and their unit and command-card join rows.
 * Display name and composition are columns. Domain mapping happens in `mappers/`.
 */

import type { ArmyDb } from '@infrastructure/database/db-types';

import type { SqlClient } from '@infrastructure/database/sql-type';
import { querySql } from '@infrastructure/database/query-sql';

/**
 * Rename one live army owned by this user.
 *
 * The army update runs this first, inside the transaction. Zero rows means
 * the army is missing or archived, and the caller writes no join rows.
 *
 * @param client - Connection or open transaction.
 * @param params - Army id, owner id, and the new display name.
 * @returns The updated army row, or an empty list when none matched.
 */
const updateArmyQuery = async (
  client: SqlClient,
  params: {
    armyId: string;
    userId: string;
    armyName: string;
  },
): Promise<ArmyDb[]> => {
  const sql = querySql(client);
  const rows = await sql<ArmyDb[]>`
    UPDATE armies
    SET army_name = ${params.armyName}
    WHERE army_id = ${params.armyId}
      AND user_id = ${params.userId}
      AND archived_at IS NULL
    RETURNING army_id, army_name, user_id, public, archived_at
  `;
  return rows;
};

export { updateArmyQuery };
