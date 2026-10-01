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

const createArmyQuery = async (
  sql: Sql,
  params: {
    userId: string;
    armyName: string;
  },
): Promise<ArmyDb[]> =>
  await sql`
    INSERT INTO armies (user_id, army_name)
    VALUES (${params.userId}, ${params.armyName})
    RETURNING army_id, army_name, user_id, public, archived_at
  `;

export { createArmyQuery };
