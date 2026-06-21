import type {
  CommandCardStorage,
  DataErrorSignature,
  LoggerPort,
} from '@ports';
import {
  getCommandCardByIdQuery,
  getCurrentCommandCardsQuery,
} from '../queries';
import type { CommandCardVersionDb } from '../db-types';
import { commandCardVersionMapperToDomain } from '../mappers';
import type { Sql } from '../sql-type';
import type { Card } from '@classicalmoser/prevail-rules/domain';
import { handleError } from '@utils';

const createCommandCardStorage = (
  logger: LoggerPort,
  sql: Sql,
): CommandCardStorage => ({
  getCurrentCommandCards: async (): Promise<DataErrorSignature<Card[]>> => {
    try {
      const unparsedResult: CommandCardVersionDb[] =
        await getCurrentCommandCardsQuery(sql);
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
});

export { createCommandCardStorage };
