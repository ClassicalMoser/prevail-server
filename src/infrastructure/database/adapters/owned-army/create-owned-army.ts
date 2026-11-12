import type { DataErrorSignature, UserStorage } from '@ports';
import type { ArmyDb } from '@infrastructure/database/db-types';
import { createArmyQuery } from '@infrastructure/database/queries';
import type { Sql } from '@infrastructure/database/sql-type';

/**
 * Create an empty army for a subject, making their local user on first use.
 *
 * Players exist locally only once they build something: the Auth0 subject is
 * resolved to a user row here, creating it if this is their first army.
 *
 * @param sql - postgres.js client.
 * @param userStorage - Resolves or creates the owner from an auth subject.
 * @param ownerAuthSub - Auth subject of the owner.
 * @param armyName - Display name for the new army.
 * @returns The new army's id, or the user lookup's failure.
 */
const createOwnedArmy = async (
  sql: Sql,
  userStorage: UserStorage,
  ownerAuthSub: string,
  armyName: string,
): Promise<DataErrorSignature<string>> => {
  // armies.user_id is a local user id, not the Auth0 subject, so resolve it first.
  const user = await userStorage.ensureByAuthSub(ownerAuthSub);
  if (!user.success) {
    return user;
  }
  const rows: ArmyDb[] = await createArmyQuery(sql, {
    userId: user.data.userId,
    armyName,
  });
  const created: DataErrorSignature<string> = {
    success: true,
    data: rows[0].army_id,
  };
  return created;
};

export { createOwnedArmy };
