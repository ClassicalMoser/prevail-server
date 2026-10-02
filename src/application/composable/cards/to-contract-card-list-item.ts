import type { CardListItem } from '@classicalmoser/prevail-contracts';
import type { CatalogCardListItem } from '@ports';

/**
 * Strip catalog-only fields before a card list item leaves on the wire.
 *
 * The HTTP contract only exposes id, name, and version. Certification state
 * stays inside the server.
 *
 * @param item - Catalog list row from storage.
 * @returns The contract list item shape.
 */
const toContractCardListItem = (item: CatalogCardListItem): CardListItem => {
  const listItem: CardListItem = {
    id: item.id,
    name: item.name,
    version: item.version,
  };
  return listItem;
};

export { toContractCardListItem };
