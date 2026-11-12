import type { DataErrorSignature, OwnedArmyWrite, UserStorage } from '@ports';
import type { Sql } from '@infrastructure/database/sql-type';
import { notFound } from '../not-found';
import { voidSuccess } from '../void-success';
import { saveOwnedArmy } from './save-owned-army';
import type { OwnedArmySave } from './save-owned-army';

/**
 * Replace an owned army's name and composition.
 *
 * A subject with no local user has no armies, so the lookup is the same one
 * create uses. An army that is missing, archived, or someone else's is 404.
 *
 * @param sql - postgres.js client.
 * @param userStorage - Resolves the owner from an auth subject.
 * @param ownerAuthSub - Auth subject of the owner.
 * @param armyId - Army to replace.
 * @param write - New name, units and command cards.
 * @returns An empty success, or a 404 or user-lookup failure envelope.
 */
const updateOwnedArmy = async (
  sql: Sql,
  userStorage: UserStorage,
  ownerAuthSub: string,
  armyId: string,
  write: OwnedArmyWrite,
): Promise<DataErrorSignature<void>> => {
  // The save is keyed by local user id; the ownership check lives in the update query.
  const user = await userStorage.ensureByAuthSub(ownerAuthSub);
  if (!user.success) {
    return user;
  }
  const save: OwnedArmySave = { userId: user.data.userId, armyId, write };
  const wrote = await saveOwnedArmy(sql, save);
  if (!wrote) {
    return notFound('Army not found');
  }
  return voidSuccess();
};

export { updateOwnedArmy };
