import type { Card } from '@classicalmoser/prevail-rules/domain';
import type { DataErrorSignature } from '@ports/data-error-signature-port';

interface CommandCardStorage {
  getCurrentCommandCards: () => Promise<DataErrorSignature<Card[]>>;
  getCommandCardById: (id: string) => Promise<DataErrorSignature<Card>>;
  createEmptyCommandCard: () => Promise<DataErrorSignature<string>>;
  createCommandCardVersion: (card: Card) => Promise<DataErrorSignature<Card>>;
  getLatestCommandCardVersions: () => Promise<DataErrorSignature<Card[]>>;
  certifyCommandCardVersion: (
    commandCardVersionId: string,
  ) => Promise<DataErrorSignature<void>>;
}

export type { CommandCardStorage };
