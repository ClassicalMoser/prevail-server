import type { ArmyDb } from '@infrastructure/database/db-types';
import { updateArmyQuery } from '@infrastructure/database/queries';
import type { SqlClient } from '@infrastructure/database/sql-type';

/** Who is renaming which army, and the display name to store. */
interface ArmyRename {
  userId: string;
  armyId: string;
  armyName: string;
}

/**
 * Rename a live owned army.
 *
 * An empty result means the army is missing, archived, or owned by someone
 * else. The caller stops before any join-row write.
 *
 * @param client - Connection or open transaction.
 * @param rename - Owner, army, and the display name to store.
 * @returns `true` when a live army row was updated.
 */
const renameOwnedArmy = async (
  client: SqlClient,
  rename: ArmyRename,
): Promise<boolean> => {
  const params = {
    armyId: rename.armyId,
    userId: rename.userId,
    armyName: rename.armyName,
  };
  const updatedRows: ArmyDb[] = await updateArmyQuery(client, params);
  const renamed = updatedRows.length > 0;
  return renamed;
};

export type { ArmyRename };
export { renameOwnedArmy };
