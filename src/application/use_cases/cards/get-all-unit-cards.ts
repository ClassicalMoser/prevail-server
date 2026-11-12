import type { CardListItem } from '@classicalmoser/prevail-contracts';
import type { DataErrorSignature } from '@ports';
import { toContractCardListItem } from '@application/composable';
import type { UnitCardUseCasesDeps } from './unit-card-use-cases-deps';

/**
 * List every unit card in the catalog for the client's catalog screen.
 *
 * Storage answers its own list-item shape; the contract's list item is what
 * the client reads, so the mapping happens here, not in the database adapter.
 *
 * @param deps - Unit-card storage.
 * @returns Contract list items, or the storage failure.
 */
const getAllUnitCards = async (
  deps: UnitCardUseCasesDeps,
): Promise<DataErrorSignature<CardListItem[]>> => {
  const result = await deps.unitCardStorage.getAllUnitCards();
  if (!result.success) {
    return result;
  }
  const listed: DataErrorSignature<CardListItem[]> = {
    success: true,
    data: result.data.map(toContractCardListItem),
  };
  return listed;
};

export { getAllUnitCards };
