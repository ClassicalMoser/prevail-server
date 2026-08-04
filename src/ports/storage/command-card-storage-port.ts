import type { Card } from '@classicalmoser/prevail-rules/domain';
import type { CardListItem } from '@classicalmoser/prevail-contracts';
import type { DataErrorSignature } from '@ports/data-error-signature-port';

/** The latest version of a command card and whether it is certified for the
 * latest rules version. Keyed on the stable command card (entity) id. */
interface CommandCardCertificationStatus {
  card: Card;
  certified: boolean;
}

interface CommandCardStorage {
  getCurrentCommandCards: () => Promise<DataErrorSignature<Card[]>>;
  getAllCommandCards: () => Promise<DataErrorSignature<CardListItem[]>>;
  getCommandCardById: (id: string) => Promise<DataErrorSignature<Card>>;
  getCommandCardsByIds: (ids: string[]) => Promise<DataErrorSignature<Card[]>>;
  createEmptyCommandCard: () => Promise<DataErrorSignature<string>>;
  createCommandCardVersion: (card: Card) => Promise<DataErrorSignature<Card>>;
  deleteCommandCardVersion: (card: Card) => Promise<DataErrorSignature<void>>;
  deleteEmptyCommandCards: () => Promise<DataErrorSignature<void>>;
  getLatestCommandCardCertifications: () => Promise<
    DataErrorSignature<CommandCardCertificationStatus[]>
  >;
  certifyCommandCardVersions: (
    commandCardIds: string[],
  ) => Promise<DataErrorSignature<void>>;
}

export type { CommandCardStorage, CommandCardCertificationStatus };
