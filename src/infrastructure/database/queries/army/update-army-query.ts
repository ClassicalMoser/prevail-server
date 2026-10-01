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

const updateArmyQuery = async (
  sql: Sql,
  params: {
    armyId: string;
    userId: string;
    armyName: string;
  },
): Promise<ArmyDb[]> =>
  await sql`
    UPDATE armies
    SET army_name = ${params.armyName}
    WHERE army_id = ${params.armyId}
      AND user_id = ${params.userId}
      AND archived_at IS NULL
    RETURNING army_id, army_name, user_id, public, archived_at
  `;

export { updateArmyQuery };
