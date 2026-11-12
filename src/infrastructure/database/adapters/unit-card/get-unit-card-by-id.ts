import type { UnitType } from '@classicalmoser/prevail-rules/domain';
import type { DataErrorSignature } from '@ports';
import type { UnitCardVersionDb } from '@infrastructure/database/db-types';
import { unitCardVersionMapperToDomain } from '@infrastructure/database/mappers';
import { getUnitCardByIdQuery } from '@infrastructure/database/queries';
import type { Sql } from '@infrastructure/database/sql-type';
import { notFound } from '../not-found';

/**
 * Load the latest version of one unit card.
 *
 * @param sql - postgres.js client.
 * @param id - The unit card's id.
 * @returns The unit card, or a 404 envelope when no version exists.
 */
const getUnitCardById = async (
  sql: Sql,
  id: string,
): Promise<DataErrorSignature<UnitType>> => {
  // Newest version of the card, so display and authoring see the latest edit.
  const rows: UnitCardVersionDb[] = await getUnitCardByIdQuery(sql, id);
  if (rows.length === 0) {
    return notFound('Unit card not found');
  }
  const loaded: DataErrorSignature<UnitType> = {
    success: true,
    data: unitCardVersionMapperToDomain(rows[0]),
  };
  return loaded;
};

export { getUnitCardById };
