import type { LoggerPort } from '@ports';
import { recordedSql } from '@testing';
import { createUnitCardStorage } from './unit-card-storage';

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

describe('createUnitCardStorage function', () => {
  it(
    'returns 404 when getUnitCardById finds no version row',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const recorded = recordedSql([]);
      const storage = createUnitCardStorage(logger, recorded.sql);

      const result = await storage.getUnitCardById('missing');

      expect(result).toStrictEqual({
        message: 'Unit card not found',
        status: 404,
        success: false,
      });
    },
  );

  it(
    'returns the new id from createEmptyUnitCard',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const recorded = recordedSql([
        { unit_card_id: '550e8400-e29b-41d4-a716-446655440099' },
      ]);
      const storage = createUnitCardStorage(logger, recorded.sql);

      const result = await storage.createEmptyUnitCard();

      expect(result).toStrictEqual({
        data: '550e8400-e29b-41d4-a716-446655440099',
        success: true,
      });
    },
  );

  it(
    'returns an empty list for getUnitCardsByIds with no ids',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const recorded = recordedSql([]);
      const storage = createUnitCardStorage(logger, recorded.sql);

      const result = await storage.getUnitCardsByIds([]);

      expect(result).toStrictEqual({ data: [], success: true });
      expect(recorded.calls).toHaveLength(0);
    },
  );
});
