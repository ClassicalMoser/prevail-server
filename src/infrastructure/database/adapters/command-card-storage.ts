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
  mapCommandCardVersions,
  parseVersionTriple,
  writeCommandCardVersionMapper,
} from '../mappers';
import type { Sql } from '../sql-type';
import type { CommandCard } from '@classicalmoser/prevail-rules/domain';
import { notFound, storageOp, voidSuccess } from './storage-op';

/**
 * Postgres adapter for catalog command cards.
 *
 * Reads return domain cards or list items. Writes validate through the
 * command-card mapper before insert, so a schema failure throws out of
 * `storageOp` and becomes an error envelope. Certification stamps the latest
 * rules version onto the selected card versions.
 *
 * @param logger - Where unexpected database failures are recorded.
 * @param sql - postgres.js client.
 * @returns The {@link CommandCardStorage} port.
 */
const createCommandCardStorage = (
  logger: LoggerPort,
  sql: Sql,
): CommandCardStorage => ({
  getCurrentCommandCards: (): Promise<DataErrorSignature<CommandCard[]>> => {
    const stored = storageOp({
      logger,
      context: 'getting current command cards from database',
      message: 'Failed to get current command cards from database',
      run: async () => ({
        success: true,
        data: mapCommandCardVersions(await getCurrentCommandCardsQuery(sql)),
      }),
    });
    return stored;
  },

  getAllCommandCards: (): Promise<
    DataErrorSignature<CatalogCardListItem[]>
  > => {
    const stored = storageOp({
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
    });
    return stored;
  },

  getCommandCardById: (
    id: string,
  ): Promise<DataErrorSignature<CommandCard>> => {
    const stored = storageOp({
      logger,
      context: 'getting command card by id from database',
      message: 'Failed to get command card by id from database',
      run: async () => {
        const rows: CommandCardVersionDb[] = await getCommandCardByIdQuery(
          sql,
          id,
        );
        if (rows.length === 0) {
          const storedCall = notFound('Command card not found');
          return storedCall;
        }
        return {
          success: true,
          data: commandCardVersionMapperToDomain(rows[0]),
        };
      },
    });
    return stored;
  },

  getCommandCardsByIds: (
    ids: string[],
  ): Promise<DataErrorSignature<CommandCard[]>> => {
    const stored = storageOp({
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
    });
    return stored;
  },

  createEmptyCommandCard: (): Promise<DataErrorSignature<string>> => {
    const stored = storageOp({
      logger,
      context: 'creating empty command card in database',
      message: 'Failed to create empty command card in database',
      run: async () => {
        const rows: { command_card_id: string }[] =
          await createEmptyCommandCardQuery(sql);
        return { success: true, data: rows[0].command_card_id };
      },
    });
    return stored;
  },

  deleteEmptyCommandCards: (): Promise<DataErrorSignature<void>> => {
    const stored = storageOp({
      logger,
      context: 'deleting empty command cards from database',
      message: 'Failed to delete empty command cards from database',
      run: async () => {
        await deleteEmptyCommandCardsQuery(sql);
        const storedCall = voidSuccess();
        return storedCall;
      },
    });
    return stored;
  },

  createCommandCardVersion: (
    card: CommandCard,
  ): Promise<DataErrorSignature<CommandCard>> => {
    const stored = storageOp({
      logger,
      context: 'creating command card version in database',
      message: 'Failed to create command card version in database',
      run: async () => {
        const existingCard = await commandCardExistsQuery(sql, card.id);
        if (existingCard.length === 0) {
          const storedCall = notFound('Command card not found');
          return storedCall;
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
    });
    return stored;
  },

  deleteCommandCardVersion: (
    card: CommandCard,
  ): Promise<DataErrorSignature<void>> => {
    const stored = storageOp({
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
        const storedCall = voidSuccess();
        return storedCall;
      },
    });
    return stored;
  },

  getLatestCommandCardCertifications: (): Promise<
    DataErrorSignature<CommandCardCertificationStatus[]>
  > => {
    const stored = storageOp({
      logger,
      context: 'getting latest command card certifications from database',
      message: 'Failed to get latest command card certifications from database',
      run: async () => {
        const rows: CommandCardCertificationStatusDb[] =
          await getLatestCommandCardCertificationsQuery(sql);
        const statuses = rows.map((row) => ({
          card: commandCardVersionMapperToDomain(row),
          certified: row.certified,
        }));
        return {
          success: true,
          data: statuses.toSorted(
            (a, b) => a.card.initiative - b.card.initiative,
          ),
        };
      },
    });
    return stored;
  },

  certifyCommandCardVersions: (
    commandCardIds: string[],
  ): Promise<DataErrorSignature<void>> => {
    const stored = storageOp({
      logger,
      context: 'certifying command card versions in database',
      message: 'Failed to certify command card versions in database',
      run: async () => {
        if (commandCardIds.length === 0) {
          const storedCall = voidSuccess();
          return storedCall;
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
        const storedCall = voidSuccess();
        return storedCall;
      },
    });
    return stored;
  },
});

export { createCommandCardStorage };
