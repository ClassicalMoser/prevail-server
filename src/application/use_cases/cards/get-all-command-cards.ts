import type { CardListItem } from '@classicalmoser/prevail-contracts';
import type { DataErrorSignature } from '@ports';
import { toContractCardListItem } from '@application/composable';
import type { CommandCardUseCasesDeps } from './command-card-use-cases-deps';

/**
 * List every command card in the catalog for the client's catalog screen.
 *
 * Storage answers its own list-item shape; the contract's list item is what
 * the client reads, so the mapping happens here, not in the database adapter.
 *
 * @param deps - Command-card storage.
 * @returns Contract list items, or the storage failure.
 */
const getAllCommandCards = async (
  deps: CommandCardUseCasesDeps,
): Promise<DataErrorSignature<CardListItem[]>> => {
  const result = await deps.commandCardStorage.getAllCommandCards();
  if (!result.success) {
    return result;
  }
  const listed: DataErrorSignature<CardListItem[]> = {
    success: true,
    data: result.data.map(toContractCardListItem),
  };
  return listed;
};

export { getAllCommandCards };
