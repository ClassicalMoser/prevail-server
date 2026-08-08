import type { CardListItem } from '@classicalmoser/prevail-contracts';
import type { CatalogCardListItem } from '@ports';

const toContractCardListItem = (item: CatalogCardListItem): CardListItem => ({
  id: item.id,
  name: item.name,
  version: item.version,
});

export { toContractCardListItem };
