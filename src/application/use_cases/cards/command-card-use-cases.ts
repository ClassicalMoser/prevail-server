import { cardSchema } from '@classicalmoser/prevail-rules/domain';
import type {
  CertificationResults,
  CommandCardStorage,
  CommandCardUseCasesPort,
  DataErrorSignature,
} from '@ports';
import type { Card } from '@classicalmoser/prevail-rules/domain';

const createCommandCardUseCases = (
  commandCardStorage: CommandCardStorage,
): CommandCardUseCasesPort => ({
  getCurrentCommandCards: async (): Promise<DataErrorSignature<Card[]>> =>
    commandCardStorage.getCurrentCommandCards(),
  getCommandCardById: async (id: string): Promise<DataErrorSignature<Card>> =>
    commandCardStorage.getCommandCardById(id),
  createEmptyCommandCard: async (): Promise<DataErrorSignature<string>> =>
    commandCardStorage.createEmptyCommandCard(),
  createCommandCardVersion: async (
    card: Card,
  ): Promise<DataErrorSignature<Card>> =>
    commandCardStorage.createCommandCardVersion(card),
  certifyLatestCommandCardVersions: async (): Promise<
    DataErrorSignature<CertificationResults>
  > => {
    const latestVersionsResult =
      await commandCardStorage.getLatestCommandCardVersions();
    if (!latestVersionsResult.success) {
      return latestVersionsResult;
    }

    const certificationAttempts = await Promise.all(
      latestVersionsResult.data.map(async (card) => {
        const validation = cardSchema.safeParse(card);
        if (!validation.success) {
          return { id: card.id, certified: false };
        }

        const certificationResult =
          await commandCardStorage.certifyCommandCardVersion(card.id);
        return { id: card.id, certified: certificationResult.success };
      }),
    );

    const succeeded = certificationAttempts
      .filter((attempt) => attempt.certified)
      .map((attempt) => attempt.id);
    const failed = certificationAttempts
      .filter((attempt) => !attempt.certified)
      .map((attempt) => attempt.id);

    return {
      success: true,
      data: { succeeded, failed },
    };
  },
});

export { createCommandCardUseCases };
