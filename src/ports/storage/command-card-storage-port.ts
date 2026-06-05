import type { Card } from '@classicalmoser/prevail-rules/domain';
import type { DataErrorSignature } from '@ports/data-error-signature-port';

interface CommandCardStorage {
  getCurrentCommandCardVersionsByRulesVersion: (
    rulesVersion: string,
  ) => Promise<DataErrorSignature<Card[]>>;
  createEmptyCommandCard: () => Promise<DataErrorSignature<string>>;
  writeCommandCardVersion: (card: Card) => Promise<DataErrorSignature<Card>>;
}

export type { CommandCardStorage };
