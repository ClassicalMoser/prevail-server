import type { Card } from '@classicalmoser/prevail-rules/domain';
import type { DataErrorSignature } from '@ports/data-error-signature-port';

interface CommandCardUseCasesPort {
  getCurrentCommandCards: () => Promise<DataErrorSignature<Card[]>>;
  getCommandCardById: (id: string) => Promise<DataErrorSignature<Card>>;
}

export type { CommandCardUseCasesPort };
