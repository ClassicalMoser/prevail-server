import type { LoggerPort } from '@ports';
import { recordedSql } from '@testing';
import { createCommandCardStorage } from './command-card-storage';

const logger: LoggerPort = {
  error: (): void => {
    /* database failures; this suite asserts the envelope */
  },
  info: (): void => {
    /* unused */
  },
  warn: (): void => {
    /* unused */
  },
};

describe('createCommandCardStorage function', () => {
  it(
    'returns 404 when getCommandCardById finds no version row',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const recorded = recordedSql([]);
      const storage = createCommandCardStorage(logger, recorded.sql);

      const result = await storage.getCommandCardById('missing');

      expect(result).toStrictEqual({
        message: 'Command card not found',
        status: 404,
        success: false,
      });
    },
  );

  it(
    'returns the new id from createEmptyCommandCard',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const recorded = recordedSql([
        { command_card_id: '550e8400-e29b-41d4-a716-446655440099' },
      ]);
      const storage = createCommandCardStorage(logger, recorded.sql);

      const result = await storage.createEmptyCommandCard();

      expect(result).toStrictEqual({
        data: '550e8400-e29b-41d4-a716-446655440099',
        success: true,
      });
    },
  );

  it(
    'returns an empty list for getCommandCardsByIds with no ids',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const recorded = recordedSql([]);
      const storage = createCommandCardStorage(logger, recorded.sql);

      const result = await storage.getCommandCardsByIds([]);

      expect(result).toStrictEqual({ data: [], success: true });
      expect(recorded.calls).toHaveLength(0);
    },
  );
});
