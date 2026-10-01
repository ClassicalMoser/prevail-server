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

const archiveArmyQuery = async (
  sql: Sql,
  authSub: string,
  armyId: string,
): Promise<{ army_id: string }[]> =>
  await sql`
    UPDATE armies a
    SET archived_at = now()
    FROM users u
    WHERE a.army_id = ${armyId}
      AND a.user_id = u.user_id
      AND u.user_auth_sub = ${authSub}
      AND a.archived_at IS NULL
    RETURNING a.army_id
  `;

export { archiveArmyQuery };
