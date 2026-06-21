import type {
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
});

export { createCommandCardUseCases };
