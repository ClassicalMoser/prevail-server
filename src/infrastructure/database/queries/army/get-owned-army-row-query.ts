/**
 * Tagged SQL for owned armies and their unit and command-card join rows.
 * Display name and composition are columns. Domain mapping happens in `mappers/`.
 */

import type {
  ArmyDb,
} from '@infrastructure/database/db-types';

import type {
  Sql,
} from '@infrastructure/database/sql-type';

/**
 * Tagged SQL for owned armies and their unit and command-card join rows.
 * Display name and composition are columns. Domain mapping happens in `mappers/`.
 */

const getOwnedArmyRowQuery = async (
  sql: Sql,
  authSub: string,
  armyId: string,
): Promise<ArmyDb[]> =>
  await sql`
    SELECT a.army_id, a.army_name, a.user_id, a.public, a.archived_at
    FROM armies a
    JOIN users u ON u.user_id = a.user_id
    WHERE a.army_id = ${armyId}
      AND u.user_auth_sub = ${authSub}
      AND a.archived_at IS NULL
    LIMIT 1
  `;

export { getOwnedArmyRowQuery };
