import type {
  CommandCardStorage,
  CommandCardUseCasesPort,
  DataErrorSignature,
} from '@ports';
import type { Card } from '@classicalmoser/prevail-rules/domain';

const createCommandCardUseCases = (
  commandCardStorage: CommandCardStorage,
): CommandCardUseCasesPort => ({
  getAllCommandCardVersions: async (): Promise<DataErrorSignature<Card[]>> =>
    commandCardStorage.getAllCommandCardVersions(),
  getCurrentCommandCardVersionsByRulesVersion: async (
    rulesVersion: string,
  ): Promise<DataErrorSignature<Card[]>> =>
    commandCardStorage.getCurrentCommandCardVersionsByRulesVersion(
      rulesVersion,
    ),
  createEmptyCommandCard: async (): Promise<DataErrorSignature<string>> =>
    commandCardStorage.createEmptyCommandCard(),
  writeCommandCardVersion: async (
    card: Card,
  ): Promise<DataErrorSignature<Card>> =>
    commandCardStorage.writeCommandCardVersion(card),
});

export { createCommandCardUseCases };
