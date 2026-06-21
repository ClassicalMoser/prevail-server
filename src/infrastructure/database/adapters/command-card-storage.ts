import type {
  CommandCardStorage,
  DataErrorSignature,
  LoggerPort,
} from '@ports';
import {
  commandCardExistsQuery,
  createCommandCardVersionQuery,
  createEmptyCommandCardQuery,
  getCommandCardByIdQuery,
  getCurrentCommandCardsQuery,
  getLatestCommandCardVersionsQuery,
  getLatestRulesVersionIdQuery,
  insertCommandCardCertificationQuery,
} from '../queries';
import type {
  CommandCardVersionDb,
  WriteCommandCardVersionDb,
} from '../db-types';
import {
  commandCardVersionMapperToDomain,
  writeCommandCardVersionMapper,
} from '../mappers';
import type { Sql } from '../sql-type';
import type { Card } from '@classicalmoser/prevail-rules/domain';
import { handleError } from '@utils';

const mapCommandCardVersions = (
  versions: CommandCardVersionDb[],
): Card[] => versions.map((version) => commandCardVersionMapperToDomain(version));

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

  getLatestCommandCardVersions: async (): Promise<
    DataErrorSignature<Card[]>
  > => {
    try {
      const unparsedResult: CommandCardVersionDb[] =
        await getLatestCommandCardVersionsQuery(sql);
      return {
        success: true,
        data: mapCommandCardVersions(unparsedResult),
      };
    } catch (error) {
      return handleError({
        error,
        logger,
        context: 'getting latest command card versions from database',
        message: 'Failed to get latest command card versions from database',
        status: 500,
      });
    }
  },

  certifyCommandCardVersion: async (
    commandCardVersionId: string,
  ): Promise<DataErrorSignature<void>> => {
    try {
      const rulesVersionRows = await getLatestRulesVersionIdQuery(sql);
      if (rulesVersionRows.length === 0) {
        return {
          success: false,
          message: 'No rules version found',
          status: 500,
        };
      }

      await insertCommandCardCertificationQuery(
        sql,
        commandCardVersionId,
        rulesVersionRows[0].rules_version_id,
      );

      return { success: true, data: undefined };
    } catch (error) {
      return handleError({
        error,
        logger,
        context: 'certifying command card version in database',
        message: 'Failed to certify command card version in database',
        status: 500,
      });
    }
  },
});

export { createCommandCardStorage };
