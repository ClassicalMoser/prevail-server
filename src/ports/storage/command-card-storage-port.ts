import type { CommandCard } from '@classicalmoser/prevail-rules/domain';
import type { CardListItem } from '@classicalmoser/prevail-contracts';
import type { DataErrorSignature } from '@ports/data-error-signature-port';

/** The latest version of a command card and whether it is certified for the
 * latest rules version. Keyed on the stable command card (entity) id. */
interface CommandCardCertificationStatus {
  card: CommandCard;
  certified: boolean;
}

interface CommandCardStorage {
  getCurrentCommandCards: () => Promise<DataErrorSignature<CommandCard[]>>;
  getAllCommandCards: () => Promise<DataErrorSignature<CardListItem[]>>;
  getCommandCardById: (id: string) => Promise<DataErrorSignature<CommandCard>>;
  getCommandCardsByIds: (ids: string[]) => Promise<DataErrorSignature<CommandCard[]>>;
  createEmptyCommandCard: () => Promise<DataErrorSignature<string>>;
  createCommandCardVersion: (card: CommandCard) => Promise<DataErrorSignature<CommandCard>>;
  deleteCommandCardVersion: (card: CommandCard) => Promise<DataErrorSignature<void>>;
  deleteEmptyCommandCards: () => Promise<DataErrorSignature<void>>;
  getLatestCommandCardCertifications: () => Promise<
    DataErrorSignature<CommandCardCertificationStatus[]>
  >;
  certifyCommandCardVersions: (
    commandCardIds: string[],
  ) => Promise<DataErrorSignature<void>>;
}

export type { CommandCardStorage, CommandCardCertificationStatus };
