import type {
  CatalogCardListItem,
  CommandCardCertificationStatus,
  CommandCardStorage,
  DataErrorSignature,
  LoggerPort,
} from '@ports';
import {
  commandCardExistsQuery,
  createCommandCardVersionQuery,
  createEmptyCommandCardQuery,
  deleteCommandCardVersionQuery,
  deleteEmptyCommandCardsQuery,
  getAllCommandCardsQuery,
  getCommandCardByIdQuery,
  getCommandCardsByIdsQuery,
  getCurrentCommandCardsQuery,
  getLatestCommandCardCertificationsQuery,
  getLatestRulesVersionIdQuery,
  insertCommandCardCertificationsQuery,
} from '../queries';
import type {
  CommandCardCertificationStatusDb,
  CommandCardListItemDb,
  CommandCardVersionDb,
  WriteCommandCardVersionDb,
} from '../db-types';
import {
  commandCardListItemMapper,
  commandCardVersionMapperToDomain,
  parseVersionTriple,
  writeCommandCardVersionMapper,
} from '../mappers';
import type { Sql } from '../sql-type';
import type { CommandCard } from '@classicalmoser/prevail-rules/domain';
import { notFound, storageOp, voidSuccess } from './storage-op';

const mapCommandCardVersions = (
  versions: CommandCardVersionDb[],
): CommandCard[] =>
  versions.map((version) => commandCardVersionMapperToDomain(version));

const createCommandCardStorage = (
  logger: LoggerPort,
  sql: Sql,
): CommandCardStorage => ({
  getCurrentCommandCards: (): Promise<DataErrorSignature<CommandCard[]>> =>
    storageOp({
      logger,
      context: 'getting current command cards from database',
      message: 'Failed to get current command cards from database',
      run: async () => ({
        success: true,
        data: mapCommandCardVersions(await getCurrentCommandCardsQuery(sql)),
      }),
    }),

  getAllCommandCards: (): Promise<DataErrorSignature<CatalogCardListItem[]>> =>
    storageOp({
      logger,
      context: 'getting all command cards from database',
      message: 'Failed to get all command cards from database',
      run: async () => {
        const rows: CommandCardListItemDb[] =
          await getAllCommandCardsQuery(sql);
        return {
          success: true,
          data: rows.map((row) => commandCardListItemMapper(row)),
        };
      },
    }),

  getCommandCardById: (id: string): Promise<DataErrorSignature<CommandCard>> =>
    storageOp({
      logger,
      context: 'getting command card by id from database',
      message: 'Failed to get command card by id from database',
      run: async () => {
        const rows: CommandCardVersionDb[] = await getCommandCardByIdQuery(
          sql,
          id,
        );
        if (rows.length === 0) {
          return notFound('Command card not found');
        }
        return {
          success: true,
          data: commandCardVersionMapperToDomain(rows[0]),
        };
      },
    }),

  getCommandCardsByIds: (
    ids: string[],
  ): Promise<DataErrorSignature<CommandCard[]>> =>
    storageOp({
      logger,
      context: 'getting command cards by ids from database',
      message: 'Failed to get command cards by ids from database',
      run: async () => {
        if (ids.length === 0) {
          return { success: true, data: [] };
        }
        return {
          success: true,
          data: mapCommandCardVersions(
            await getCommandCardsByIdsQuery(sql, ids),
          ),
        };
      },
    }),

  createEmptyCommandCard: (): Promise<DataErrorSignature<string>> =>
    storageOp({
      logger,
      context: 'creating empty command card in database',
      message: 'Failed to create empty command card in database',
      run: async () => {
        const rows: { command_card_id: string }[] =
          await createEmptyCommandCardQuery(sql);
        return { success: true, data: rows[0].command_card_id };
      },
    }),

  deleteEmptyCommandCards: (): Promise<DataErrorSignature<void>> =>
    storageOp({
      logger,
      context: 'deleting empty command cards from database',
      message: 'Failed to delete empty command cards from database',
      run: async () => {
        await deleteEmptyCommandCardsQuery(sql);
        return voidSuccess();
      },
    }),

  createCommandCardVersion: (
    card: CommandCard,
  ): Promise<DataErrorSignature<CommandCard>> =>
    storageOp({
      logger,
      context: 'creating command card version in database',
      message: 'Failed to create command card version in database',
      run: async () => {
        const existingCard = await commandCardExistsQuery(sql, card.id);
        if (existingCard.length === 0) {
          return notFound('Command card not found');
        }

        const writeVersion: WriteCommandCardVersionDb =
          writeCommandCardVersionMapper(card);
        const rows: CommandCardVersionDb[] =
          await createCommandCardVersionQuery(sql, writeVersion);

        return {
          success: true,
          data: commandCardVersionMapperToDomain(rows[0]),
        };
      },
    }),

  deleteCommandCardVersion: (
    card: CommandCard,
  ): Promise<DataErrorSignature<void>> =>
    storageOp({
      logger,
      context: 'deleting command card version from database',
      message: 'Failed to delete command card version from database',
      run: async () => {
        const { major, minor, patch } = parseVersionTriple(card.version);
        await deleteCommandCardVersionQuery({
          sql,
          commandCardId: card.id,
          versionMajor: major,
          versionMinor: minor,
          versionPatch: patch,
        });
        return voidSuccess();
      },
    }),

  getLatestCommandCardCertifications: (): Promise<
    DataErrorSignature<CommandCardCertificationStatus[]>
  > =>
    storageOp({
      logger,
      context: 'getting latest command card certifications from database',
      message: 'Failed to get latest command card certifications from database',
      run: async () => {
        const rows: CommandCardCertificationStatusDb[] =
          await getLatestCommandCardCertificationsQuery(sql);
        return {
          success: true,
          data: rows.map((row) => ({
            card: commandCardVersionMapperToDomain(row),
            certified: row.certified,
          })),
        };
      },
    }),

  certifyCommandCardVersions: (
    commandCardIds: string[],
  ): Promise<DataErrorSignature<void>> =>
    storageOp({
      logger,
      context: 'certifying command card versions in database',
      message: 'Failed to certify command card versions in database',
      run: async () => {
        if (commandCardIds.length === 0) {
          return voidSuccess();
        }

        const rulesVersionRows = await getLatestRulesVersionIdQuery(sql);
        if (rulesVersionRows.length === 0) {
          return {
            success: false,
            message: 'No rules version found',
            status: 500,
          };
        }

        await insertCommandCardCertificationsQuery(
          sql,
          commandCardIds,
          rulesVersionRows[0].rules_version_id,
        );
        return voidSuccess();
      },
    }),
});

export { createCommandCardStorage };
