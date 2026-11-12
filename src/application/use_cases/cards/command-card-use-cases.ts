import type { CommandCard } from '@classicalmoser/prevail-rules/domain';
import type {
  CommandCardUseCasesPort,
  DataErrorSignature,
  ErrorSignature,
  NoContentSignature,
} from '@ports';
import { mapVoidToNoContent } from '@ports';
import { createCommandCardVersion } from './create-command-card-version';
import { getAllCommandCards } from './get-all-command-cards';
import { previewCommandCard } from './preview-command-card';
import { updateCommandCardCertifications } from './update-command-card-certifications';
import type { CommandCardUseCasesDeps } from './command-card-use-cases-deps';

/**
 * Catalog and preview use cases for command cards.
 *
 * Each use case with its own policy is its own file; this builds the port from
 * them. A method that only hands the call to storage stays here as one line.
 *
 * @param deps - Storage, renderer, and asset ports.
 * @returns The command-card use-case port.
 */
const createCommandCardUseCases = (
  deps: CommandCardUseCasesDeps,
): CommandCardUseCasesPort => ({
  getCurrentCommandCards: async (): Promise<
    DataErrorSignature<CommandCard[]>
  > => deps.commandCardStorage.getCurrentCommandCards(),
  getAllCommandCards: () => getAllCommandCards(deps),
  getCommandCardById: async (
    id: string,
  ): Promise<DataErrorSignature<CommandCard>> =>
    deps.commandCardStorage.getCommandCardById(id),
  getCommandCardsByIds: async (
    ids: string[],
  ): Promise<DataErrorSignature<CommandCard[]>> =>
    deps.commandCardStorage.getCommandCardsByIds(ids),
  createEmptyCommandCard: async (): Promise<DataErrorSignature<string>> =>
    deps.commandCardStorage.createEmptyCommandCard(),
  createCommandCardVersion: (card) => createCommandCardVersion(deps, card),
  deleteEmptyCommandCards: async (): Promise<
    ErrorSignature | NoContentSignature
  > =>
    mapVoidToNoContent(await deps.commandCardStorage.deleteEmptyCommandCards()),
  updateCommandCardCertifications: () => updateCommandCardCertifications(deps),
  previewCommandCard: (card) => previewCommandCard(deps, card),
});

export type { CommandCardUseCasesDeps };
export { createCommandCardUseCases };
