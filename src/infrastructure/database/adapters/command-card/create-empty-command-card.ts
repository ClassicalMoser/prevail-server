import type { DataErrorSignature } from '@ports';
import { createEmptyCommandCardQuery } from '@infrastructure/database/queries';
import type { Sql } from '@infrastructure/database/sql-type';

/**
 * Create a command card with no versions yet, and answer its id.
 *
 * An author gets an id first and writes versions under it, so a command card exists
 * before its first definition does.
 *
 * @param sql - postgres.js client.
 * @returns The new command card's id.
 */
const createEmptyCommandCard = async (
  sql: Sql,
): Promise<DataErrorSignature<string>> => {
  const rows: { command_card_id: string }[] =
    await createEmptyCommandCardQuery(sql);
  const created: DataErrorSignature<string> = {
    success: true,
    data: rows[0].command_card_id,
  };
  return created;
};

export { createEmptyCommandCard };
