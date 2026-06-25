import type { Card } from '@classicalmoser/prevail-rules/domain';
import type { CardListItem } from '@classicalmoser/prevail-contracts';
import type {
  DataErrorSignature,
  ErrorSignature,
  NoContentSignature,
} from '@ports/data-error-signature-port';

interface CertificationResults {
  certified: string[];
  uncertified: string[];
}

interface CommandCardUseCasesPort {
  getCurrentCommandCards: () => Promise<DataErrorSignature<Card[]>>;
  getAllCommandCards: () => Promise<DataErrorSignature<CardListItem[]>>;
  getCommandCardById: (id: string) => Promise<DataErrorSignature<Card>>;
  getCommandCardsByIds: (ids: string[]) => Promise<DataErrorSignature<Card[]>>;
  createEmptyCommandCard: () => Promise<DataErrorSignature<string>>;
  createCommandCardVersion: (card: Card) => Promise<DataErrorSignature<Card>>;
  deleteEmptyCommandCards: () => Promise<ErrorSignature | NoContentSignature>;
  updateCommandCardCertifications: () => Promise<
    DataErrorSignature<CertificationResults>
  >;
  previewCommandCard: (card: Card) => Promise<DataErrorSignature<string>>;
}

export type { CertificationResults, CommandCardUseCasesPort };
