import type { CommandCard } from '@classicalmoser/prevail-rules/domain';
import type { DataErrorSignature } from '@ports';
import { mapCommandCardVersions } from '@infrastructure/database/mappers';
import { getCurrentCommandCardsQuery } from '@infrastructure/database/queries';
import type { Sql } from '@infrastructure/database/sql-type';

/**
 * Load the latest certified version of every command card in the catalog.
 *
 * This is the set a player may build an army from, so a version that has not
 * been certified against the current rules is not offered.
 *
 * @param sql - postgres.js client.
 * @returns The current command cards.
 */
const getCurrentCommandCards = async (
  sql: Sql,
): Promise<DataErrorSignature<CommandCard[]>> => {
  const versions = await getCurrentCommandCardsQuery(sql);
  const loaded: DataErrorSignature<CommandCard[]> = {
    success: true,
    data: mapCommandCardVersions(versions),
  };
  return loaded;
};

export { getCurrentCommandCards };
