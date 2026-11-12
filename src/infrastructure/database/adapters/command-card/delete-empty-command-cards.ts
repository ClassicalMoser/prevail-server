import type { DataErrorSignature } from '@ports';
import { deleteEmptyCommandCardsQuery } from '@infrastructure/database/queries';
import type { Sql } from '@infrastructure/database/sql-type';
import { voidSuccess } from '../void-success';

/**
 * Delete every command card that never received a version.
 *
 * Cleans up ids handed out by `createEmptyCommandCard` that were never filled in.
 *
 * @param sql - postgres.js client.
 * @returns An empty success.
 */
const deleteEmptyCommandCards = async (
  sql: Sql,
): Promise<DataErrorSignature<void>> => {
  await deleteEmptyCommandCardsQuery(sql);
  return voidSuccess();
};

export { deleteEmptyCommandCards };
