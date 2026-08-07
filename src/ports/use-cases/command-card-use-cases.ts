import type { CommandCard } from '@classicalmoser/prevail-rules/domain';
import type {
  CardListItem,
  CertificationResults,
} from '@classicalmoser/prevail-contracts';
import type {
  DataErrorSignature,
  ErrorSignature,
  NoContentSignature,
} from '@ports/data-error-signature-port';

interface CommandCardUseCasesPort {
  getCurrentCommandCards: () => Promise<DataErrorSignature<CommandCard[]>>;
  getAllCommandCards: () => Promise<DataErrorSignature<CardListItem[]>>;
  getCommandCardById: (id: string) => Promise<DataErrorSignature<CommandCard>>;
  getCommandCardsByIds: (ids: string[]) => Promise<DataErrorSignature<CommandCard[]>>;
  createEmptyCommandCard: () => Promise<DataErrorSignature<string>>;
  createCommandCardVersion: (card: CommandCard) => Promise<DataErrorSignature<CommandCard>>;
  deleteEmptyCommandCards: () => Promise<ErrorSignature | NoContentSignature>;
  updateCommandCardCertifications: () => Promise<
    DataErrorSignature<CertificationResults>
  >;
  previewCommandCard: (card: CommandCard) => Promise<DataErrorSignature<string>>;
}

export type { CommandCardUseCasesPort };
export type { CertificationResults } from '@classicalmoser/prevail-contracts';
