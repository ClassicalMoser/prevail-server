import type { Card } from '@classicalmoser/prevail-rules/domain';
import type { DataErrorSignature } from '@ports/data-error-signature-port';

interface CertificationResults {
  succeeded: string[];
  failed: string[];
}

interface CommandCardUseCasesPort {
  getCurrentCommandCards: () => Promise<DataErrorSignature<Card[]>>;
  getCommandCardById: (id: string) => Promise<DataErrorSignature<Card>>;
  createEmptyCommandCard: () => Promise<DataErrorSignature<string>>;
  createCommandCardVersion: (card: Card) => Promise<DataErrorSignature<Card>>;
  certifyLatestCommandCardVersions: () => Promise<
    DataErrorSignature<CertificationResults>
  >;
  previewCommandCard: (card: Card) => Promise<DataErrorSignature<string>>;
}

export type { CertificationResults, CommandCardUseCasesPort };
