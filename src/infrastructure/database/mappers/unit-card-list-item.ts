import type { CatalogCardListItem } from '@ports';
import type { UnitCardListItemDb } from '../db-types';
import { formatListItemVersion } from './format-list-item-version';

/**
 * Map a unit-card list row into the catalog list item.
 *
 * @param row - List query row.
 * @returns Id, name, and formatted version.
 */
const unitCardListItemMapper = (
  row: UnitCardListItemDb,
): CatalogCardListItem => {
  const item: CatalogCardListItem = {
    id: row.unit_card_id,
    name: row.unit_card_name,
    version: formatListItemVersion(
      row.version_major,
      row.version_minor,
      row.version_patch,
    ),
  };
  return item;
};

export { unitCardListItemMapper };
