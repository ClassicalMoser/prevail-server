import type { CatalogCardListItem, DataErrorSignature } from '@ports';
import type { CommandCardListItemDb } from '@infrastructure/database/db-types';
import { commandCardListItemMapper } from '@infrastructure/database/mappers';
import { getAllCommandCardsQuery } from '@infrastructure/database/queries';
import type { Sql } from '@infrastructure/database/sql-type';

/**
 * List every command card in the catalog, certified or not, for the catalog screens.
 *
 * Items are summaries (name and version), not full cards.
 *
 * @param sql - postgres.js client.
 * @returns One list item per command card.
 */
const getAllCommandCards = async (
  sql: Sql,
): Promise<DataErrorSignature<CatalogCardListItem[]>> => {
  const rows: CommandCardListItemDb[] = await getAllCommandCardsQuery(sql);
  const loaded: DataErrorSignature<CatalogCardListItem[]> = {
    success: true,
    data: rows.map((row) => commandCardListItemMapper(row)),
  };
  return loaded;
};

export { getAllCommandCards };
