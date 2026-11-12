import type { UnitType } from '@classicalmoser/prevail-rules/domain';
import type { UnitCardVersionDb } from '@infrastructure/database/db-types';
import { unitCardVersionMapperToDomain } from '@infrastructure/database/mappers';
import { getUnitCardsByIdsQuery } from '@infrastructure/database/queries';
import type { Sql } from '@infrastructure/database/sql-type';

/**
 * Load the current definition of each unit card an army lists, by card id.
 *
 * An army row stores only card ids and counts. The unit's stats come from the
 * catalog, so a player's army always plays with the cards as published now.
 * An army with no units skips the query, because an empty id list is not a
 * valid `IN (...)`.
 *
 * @param sql - postgres.js client.
 * @param unitCardIds - Ids from the army's unit join rows.
 * @returns Each found unit type, keyed by its card id.
 */
const loadUnitTypesById = async (
  sql: Sql,
  unitCardIds: readonly string[],
): Promise<Map<string, UnitType>> => {
  const versions: UnitCardVersionDb[] =
    unitCardIds.length === 0
      ? []
      : await getUnitCardsByIdsQuery(sql, [...unitCardIds]);
  const entries = versions.map((version): [string, UnitType] => [
    version.unit_card_id,
    unitCardVersionMapperToDomain(version),
  ]);
  const unitTypesById = new Map<string, UnitType>(entries);
  return unitTypesById;
};

export { loadUnitTypesById };
