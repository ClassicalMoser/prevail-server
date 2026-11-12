import type { DataErrorSignature } from '@ports';
import { createEmptyUnitCardQuery } from '@infrastructure/database/queries';
import type { Sql } from '@infrastructure/database/sql-type';

/**
 * Create a unit card with no versions yet, and answer its id.
 *
 * An author gets an id first and writes versions under it, so a unit card exists
 * before its first definition does.
 *
 * @param sql - postgres.js client.
 * @returns The new unit card's id.
 */
const createEmptyUnitCard = async (
  sql: Sql,
): Promise<DataErrorSignature<string>> => {
  const rows: { unit_card_id: string }[] = await createEmptyUnitCardQuery(sql);
  const created: DataErrorSignature<string> = {
    success: true,
    data: rows[0].unit_card_id,
  };
  return created;
};

export { createEmptyUnitCard };
