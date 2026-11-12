import type { CommandCard } from '@classicalmoser/prevail-rules/domain';
import type { DataErrorSignature } from '@ports';
import { mapCommandCardVersions } from '@infrastructure/database/mappers';
import { getCommandCardsByIdsQuery } from '@infrastructure/database/queries';
import type { Sql } from '@infrastructure/database/sql-type';

/**
 * Load the latest version of each named command card.
 *
 * An army lists cards by id, so this is how its cards are fetched. An empty
 * list skips the query, because an empty `ANY(...)` match is wasted work.
 *
 * @param sql - postgres.js client.
 * @param ids - Ids of the command cards wanted.
 * @returns The command cards found. A missing id is simply absent.
 */
const getCommandCardsByIds = async (
  sql: Sql,
  ids: string[],
): Promise<DataErrorSignature<CommandCard[]>> => {
  if (ids.length === 0) {
    const none: DataErrorSignature<CommandCard[]> = { success: true, data: [] };
    return none;
  }
  const versions = await getCommandCardsByIdsQuery(sql, ids);
  const loaded: DataErrorSignature<CommandCard[]> = {
    success: true,
    data: mapCommandCardVersions(versions),
  };
  return loaded;
};

export { getCommandCardsByIds };
