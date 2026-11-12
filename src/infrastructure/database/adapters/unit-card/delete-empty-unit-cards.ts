import type { DataErrorSignature } from '@ports';
import { deleteEmptyUnitCardsQuery } from '@infrastructure/database/queries';
import type { Sql } from '@infrastructure/database/sql-type';
import { voidSuccess } from '../void-success';

/**
 * Delete every unit card that never received a version.
 *
 * Cleans up ids handed out by `createEmptyUnitCard` that were never filled in.
 *
 * @param sql - postgres.js client.
 * @returns An empty success.
 */
const deleteEmptyUnitCards = async (
  sql: Sql,
): Promise<DataErrorSignature<void>> => {
  await deleteEmptyUnitCardsQuery(sql);
  return voidSuccess();
};

export { deleteEmptyUnitCards };
