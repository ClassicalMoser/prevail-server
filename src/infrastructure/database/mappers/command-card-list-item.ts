import type { CatalogCardListItem } from '@ports';
import type { CommandCardListItemDb } from '../db-types';
import { formatListItemVersion } from './format-list-item-version';

/**
 * Map a command-card list row into the catalog list item.
 *
 * @param row - List query row.
 * @returns Id, name, and formatted version.
 */
const commandCardListItemMapper = (
  row: CommandCardListItemDb,
): CatalogCardListItem => {
  const item: CatalogCardListItem = {
    id: row.command_card_id,
    name: row.command_card_name,
    version: formatListItemVersion(
      row.version_major,
      row.version_minor,
      row.version_patch,
    ),
  };
  return item;
};

export { commandCardListItemMapper };
