/**
 * Tagged SQL for owned armies and their unit and command-card join rows.
 * Display name and composition are columns. Domain mapping happens in `mappers/`.
 */

import type { ArmyListItemDb } from '@infrastructure/database/db-types';

import type { Sql } from '@infrastructure/database/sql-type';

/**
 * Tagged SQL for owned armies and their unit and command-card join rows.
 * Display name and composition are columns. Domain mapping happens in `mappers/`.
 */

const getOwnedArmiesQuery = async (
  sql: Sql,
  authSub: string,
): Promise<ArmyListItemDb[]> =>
  await sql`
    SELECT a.army_id, a.army_name
    FROM armies a
    JOIN users u ON u.user_id = a.user_id
    WHERE u.user_auth_sub = ${authSub}
      AND a.archived_at IS NULL
    ORDER BY a.created_at DESC
  `;

export { getOwnedArmiesQuery };
