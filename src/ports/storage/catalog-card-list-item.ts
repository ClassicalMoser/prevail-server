/** Catalog projection for listing cards — persistence-agnostic, not an HTTP DTO. */
interface CatalogCardListItem {
  id: string;
  name: string | null;
  version: string | null;
}

export type { CatalogCardListItem };
