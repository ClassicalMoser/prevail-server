import type { CatalogCardListItem, DataErrorSignature } from '@ports';
import type { UnitCardListItemDb } from '@infrastructure/database/db-types';
import { unitCardListItemMapper } from '@infrastructure/database/mappers';
import { getAllUnitCardsQuery } from '@infrastructure/database/queries';
import type { Sql } from '@infrastructure/database/sql-type';

/**
 * List every unit card in the catalog, certified or not, for the catalog screens.
 *
 * Items are summaries (name and version), not full cards.
 *
 * @param sql - postgres.js client.
 * @returns One list item per unit card.
 */
const getAllUnitCards = async (
  sql: Sql,
): Promise<DataErrorSignature<CatalogCardListItem[]>> => {
  // Includes cards with no version yet, so authors can see ids they reserved.
  const rows: UnitCardListItemDb[] = await getAllUnitCardsQuery(sql);
  const loaded: DataErrorSignature<CatalogCardListItem[]> = {
    success: true,
    data: rows.map((row) => unitCardListItemMapper(row)),
  };
  return loaded;
};

export { getAllUnitCards };
