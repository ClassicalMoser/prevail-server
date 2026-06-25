import type {
  CommandCardCertificationStatus,
  CommandCardStorage,
  DataErrorSignature,
  LoggerPort,
} from '@ports';
import {
  commandCardExistsQuery,
  createCommandCardVersionQuery,
  createEmptyCommandCardQuery,
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
  writeCommandCardVersionMapper,
} from '../mappers';
import type { Sql } from '../sql-type';
import type { Card } from '@classicalmoser/prevail-rules/domain';
import type { CardListItem } from '@classicalmoser/prevail-contracts';
import { handleError } from '@utils';

const mapCommandCardVersions = (versions: CommandCardVersionDb[]): Card[] =>
  versions.map((version) => commandCardVersionMapperToDomain(version));

const createCommandCardStorage = (
  logger: LoggerPort,
  sql: Sql,
): CommandCardStorage => ({
  getCurrentCommandCards: async (): Promise<DataErrorSignature<Card[]>> => {
    try {
      const unparsedResult: CommandCardVersionDb[] =
        await getCurrentCommandCardsQuery(sql);
      return {
        success: true,
        data: mapCommandCardVersions(unparsedResult),
      };
    } catch (error) {
      return handleError({
        error,
        logger,
        context: 'getting current command cards from database',
        message: 'Failed to get current command cards from database',
        status: 500,
      });
    }
  },

  getAllCommandCards: async (): Promise<DataErrorSignature<CardListItem[]>> => {
    try {
      const unparsedResult: CommandCardListItemDb[] =
        await getAllCommandCardsQuery(sql);
      return {
        success: true,
        data: unparsedResult.map((row) => commandCardListItemMapper(row)),
      };
    } catch (error) {
      return handleError({
        error,
        logger,
        context: 'getting all command cards from database',
        message: 'Failed to get all command cards from database',
        status: 500,
      });
    }
  },

  getCommandCardById: async (id: string): Promise<DataErrorSignature<Card>> => {
    try {
      const unparsedResult: CommandCardVersionDb[] =
        await getCommandCardByIdQuery(sql, id);
      if (unparsedResult.length === 0) {
        return {
          success: false,
          message: 'Command card not found',
          status: 404,
        };
      }

      return {
        success: true,
        data: commandCardVersionMapperToDomain(unparsedResult[0]),
      };
    } catch (error) {
      return handleError({
        error,
        logger,
        context: 'getting command card by id from database',
        message: 'Failed to get command card by id from database',
        status: 500,
      });
    }
  },

  getCommandCardsByIds: async (
    ids: string[],
  ): Promise<DataErrorSignature<Card[]>> => {
    try {
      if (ids.length === 0) {
        return { success: true, data: [] };
      }

      const unparsedResult: CommandCardVersionDb[] =
        await getCommandCardsByIdsQuery(sql, ids);
      return {
        success: true,
        data: mapCommandCardVersions(unparsedResult),
      };
    } catch (error) {
      return handleError({
        error,
        logger,
        context: 'getting command cards by ids from database',
        message: 'Failed to get command cards by ids from database',
        status: 500,
      });
    }
  },

  createEmptyCommandCard: async (): Promise<DataErrorSignature<string>> => {
    try {
      const unparsedResult: { command_card_id: string }[] =
        await createEmptyCommandCardQuery(sql);
      return {
        success: true,
        data: unparsedResult[0].command_card_id,
      };
    } catch (error) {
      return handleError({
        error,
        logger,
        context: 'creating empty command card in database',
        message: 'Failed to create empty command card in database',
        status: 500,
      });
    }
  },

  deleteEmptyCommandCards: async (): Promise<DataErrorSignature<void>> => {
    try {
      await deleteEmptyCommandCardsQuery(sql);
      return { success: true, data: undefined };
    } catch (error) {
      return handleError({
        error,
        logger,
        context: 'deleting empty command cards from database',
        message: 'Failed to delete empty command cards from database',
        status: 500,
      });
    }
  },

  createCommandCardVersion: async (
    card: Card,
  ): Promise<DataErrorSignature<Card>> => {
    try {
      const existingCard = await commandCardExistsQuery(sql, card.id);
      if (existingCard.length === 0) {
        return {
          success: false,
          message: 'Command card not found',
          status: 404,
        };
      }

      const writeVersion: WriteCommandCardVersionDb =
        writeCommandCardVersionMapper(card);
      const unparsedResult: CommandCardVersionDb[] =
        await createCommandCardVersionQuery(sql, writeVersion);

      return {
        success: true,
        data: commandCardVersionMapperToDomain(unparsedResult[0]),
      };
    } catch (error) {
      return handleError({
        error,
        logger,
        context: 'creating command card version in database',
        message: 'Failed to create command card version in database',
        status: 500,
      });
    }
  },

  getLatestCommandCardCertifications: async (): Promise<
    DataErrorSignature<CommandCardCertificationStatus[]>
  > => {
    try {
      const rows: CommandCardCertificationStatusDb[] =
        await getLatestCommandCardCertificationsQuery(sql);
      return {
        success: true,
        data: rows.map((row) => ({
          card: commandCardVersionMapperToDomain(row),
          certified: row.certified,
        })),
      };
    } catch (error) {
      return handleError({
        error,
        logger,
        context: 'getting latest command card certifications from database',
        message:
          'Failed to get latest command card certifications from database',
        status: 500,
      });
    }
  },

  certifyCommandCardVersions: async (
    commandCardIds: string[],
  ): Promise<DataErrorSignature<void>> => {
    try {
      if (commandCardIds.length === 0) {
        return { success: true, data: undefined };
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

      return { success: true, data: undefined };
    } catch (error) {
      return handleError({
        error,
        logger,
        context: 'certifying command card versions in database',
        message: 'Failed to certify command card versions in database',
        status: 500,
      });
    }
  },
});

export { createCommandCardStorage };
