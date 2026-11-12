import type { UnitType } from '@classicalmoser/prevail-rules/domain';
import type { DataErrorSignature } from '@ports';
import { mapUnitCardVersions } from '@infrastructure/database/mappers';
import { getCurrentUnitCardsQuery } from '@infrastructure/database/queries';
import type { Sql } from '@infrastructure/database/sql-type';

/**
 * Load the latest certified version of every unit card in the catalog.
 *
 * This is the set a player may build an army from, so a version that has not
 * been certified against the current rules is not offered.
 *
 * @param sql - postgres.js client.
 * @returns The current unit cards.
 */
const getCurrentUnitCards = async (
  sql: Sql,
): Promise<DataErrorSignature<UnitType[]>> => {
  // The query already limits to versions certified against the latest rules.
  const versions = await getCurrentUnitCardsQuery(sql);
  const loaded: DataErrorSignature<UnitType[]> = {
    success: true,
    data: mapUnitCardVersions(versions),
  };
  return loaded;
};

export { getCurrentUnitCards };
