import type { OwnedArmyWrite } from '@ports';
import type { Sql } from '@infrastructure/database/sql-type';
import { transactionClient } from '@infrastructure/database/transaction-client';
import { renameOwnedArmy } from './rename-owned-army';
import type { ArmyRename } from './rename-owned-army';
import { replaceArmyComposition } from './replace-army-composition';

/** Who owns the army, which army, and what to store. */
interface OwnedArmySave {
  userId: string;
  armyId: string;
  write: OwnedArmyWrite;
}

/**
 * Rename an owned army and replace its composition on one transaction.
 *
 * postgres.js commits when the callback returns and rolls back when it
 * throws. A missing army returns before any join write, so that commit
 * stores nothing. A later insert failure throws, and the rename plus the
 * deletes are undone.
 *
 * @param sql - postgres.js client. `begin` supplies the transaction handle.
 * @param save - Owner, army, and the name plus composition to store.
 * @returns `true` when the army row was updated.
 */
const saveOwnedArmy = async (
  sql: Sql,
  save: OwnedArmySave,
): Promise<boolean> => {
  const saved = await sql.begin(async (tx) => {
    const client = transactionClient(tx);

    // The rename doubles as the ownership check: it matches only a live army
    // this user owns, so nobody can overwrite another player's list.
    const rename: ArmyRename = {
      userId: save.userId,
      armyId: save.armyId,
      armyName: save.write.armyName,
    };
    const renamed = await renameOwnedArmy(client, rename);
    if (!renamed) {
      const missing = false;
      return missing;
    }

    // Same transaction: a failed insert undoes the rename and the deletes, so
    // a player never loses their old list to a half-written new one.
    await replaceArmyComposition(client, save.armyId, save.write);
    const wrote = true;
    return wrote;
  });
  return saved;
};

export type { OwnedArmySave };
export { saveOwnedArmy };
