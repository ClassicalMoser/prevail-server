import type { DataErrorSignature, StoragePort, UseCasesPort } from '@ports';
import type { Card } from '@classicalmoser/prevail-rules/domain';

const createUseCasesRoot = (storagePort: StoragePort): UseCasesPort => ({
  commandCardUseCases: {
    getCurrentCommandCardVersionsByRulesVersion: async (
      rulesVersion: string,
    ): Promise<DataErrorSignature<Card[]>> =>
      storagePort.commandCardStorage.getCurrentCommandCardVersionsByRulesVersion(
        rulesVersion,
      ),
    createEmptyCommandCard: async (): Promise<DataErrorSignature<string>> =>
      storagePort.commandCardStorage.createEmptyCommandCard(),
    writeCommandCardVersion: async (
      card: Card,
    ): Promise<DataErrorSignature<Card>> =>
      storagePort.commandCardStorage.writeCommandCardVersion(card),
  },
});

export { createUseCasesRoot };
