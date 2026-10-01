import type { CardListItem } from '@classicalmoser/prevail-contracts';
import type { CatalogCardListItem } from '@ports';

const toContractCardListItem = (item: CatalogCardListItem): CardListItem => {
  const listItem: CardListItem = {
    id: item.id,
    name: item.name,
    version: item.version,
  };
  return listItem;
};

export { toContractCardListItem };
