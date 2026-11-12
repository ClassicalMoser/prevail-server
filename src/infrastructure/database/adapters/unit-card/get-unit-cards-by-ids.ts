import type { UnitType } from '@classicalmoser/prevail-rules/domain';
import type { DataErrorSignature } from '@ports';
import { mapUnitCardVersions } from '@infrastructure/database/mappers';
import { getUnitCardsByIdsQuery } from '@infrastructure/database/queries';
import type { Sql } from '@infrastructure/database/sql-type';

/**
 * Load the latest version of each named unit card.
 *
 * An army lists cards by id, so this is how its cards are fetched. An empty
 * list skips the query, because an empty `ANY(...)` match is wasted work.
 *
 * @param sql - postgres.js client.
 * @param ids - Ids of the unit cards wanted.
 * @returns The unit cards found. A missing id is simply absent.
 */
const getUnitCardsByIds = async (
  sql: Sql,
  ids: string[],
): Promise<DataErrorSignature<UnitType[]>> => {
  if (ids.length === 0) {
    const none: DataErrorSignature<UnitType[]> = { success: true, data: [] };
    return none;
  }
  // Newest version per id, certified or not; the army builder filters by the
  // current-cards list, not here.
  const versions = await getUnitCardsByIdsQuery(sql, ids);
  const loaded: DataErrorSignature<UnitType[]> = {
    success: true,
    data: mapUnitCardVersions(versions),
  };
  return loaded;
};

export { getUnitCardsByIds };
