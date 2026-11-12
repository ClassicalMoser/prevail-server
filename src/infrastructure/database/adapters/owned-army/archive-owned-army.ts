import type { DataErrorSignature } from '@ports';
import { archiveArmyQuery } from '@infrastructure/database/queries';
import type { Sql } from '@infrastructure/database/sql-type';
import { notFound } from '../not-found';
import { voidSuccess } from '../void-success';

/**
 * Archive an owned army so it leaves the player's list.
 *
 * Archiving sets `archived_at`; the composition is kept, so history is not
 * lost. An army that is missing, already archived, or someone else's is 404.
 *
 * @param sql - postgres.js client.
 * @param ownerAuthSub - Auth subject of the owner.
 * @param armyId - Army to archive.
 * @returns An empty success, or a 404 envelope.
 */
const archiveOwnedArmy = async (
  sql: Sql,
  ownerAuthSub: string,
  armyId: string,
): Promise<DataErrorSignature<void>> => {
  // The query matches only the caller's live army, so no row means missing,
  // already archived, or not theirs; all three look the same to the caller.
  const rows = await archiveArmyQuery(sql, ownerAuthSub, armyId);
  if (rows.length === 0) {
    return notFound('Army not found');
  }
  return voidSuccess();
};

export { archiveOwnedArmy };
