import type {
  CommandCardStorage,
  DataErrorSignature,
  LoggerPort,
} from '@ports';
import {
  getCurrentCommandCardVersionsByRulesVersionQuery,
  createEmptyCommandCardQuery,
  writeCommandCardVersionQuery,
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
import { handleError } from '@utils/handle-error';

const createCommandCardStorage = (
  logger: LoggerPort,
  sql: Sql,
): CommandCardStorage => ({
  getCurrentCommandCardVersionsByRulesVersion: async (
    rulesVersion: string,
  ): Promise<DataErrorSignature<Card[]>> => {
    try {
      const unparsedResult: CommandCardVersionDb[] =
        await getCurrentCommandCardVersionsByRulesVersionQuery(
          sql,
          rulesVersion,
        );
      const mappedResult: Card[] = unparsedResult.map((version) =>
        commandCardVersionMapperToDomain(version),
      );
      return {
        success: true,
        data: mappedResult,
      };
    } catch (error) {
      return handleError({
        error,
        logger,
        context:
          'getting current command card versions by rules version from database',
        message:
          'Failed to get current command card versions by rules version from database',
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
        context: 'creating empty command card to database',
        message: 'Failed to create empty command card to database',
        status: 500,
      });
    }
  },

  writeCommandCardVersion: async (
    card: Card,
  ): Promise<DataErrorSignature<Card>> => {
    try {
      const writeVersion: WriteCommandCardVersionDb =
        writeCommandCardVersionMapper(card);
      const unparsedResult: CommandCardVersionDb[] =
        await writeCommandCardVersionQuery(sql, writeVersion);
      const mappedResult: Card[] = unparsedResult.map((version) =>
        commandCardVersionMapperToDomain(version),
      );
      return {
        success: true,
        data: mappedResult[0],
      };
    } catch (error) {
      return handleError({
        error,
        logger,
        context: 'writing command card version to database',
        message: 'Failed to write command card version to database',
        status: 500,
      });
    }
  },
});

export { createCommandCardStorage };
