import { recordedSql, recordingLogger } from '@testing';
import { createCommandCardStorage } from './create-command-card-storage';

const logger = recordingLogger();

describe('createCommandCardStorage function', () => {
  it(
    'returns 404 when getCommandCardById finds no version row',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      // The tag answers with no rows, so the card has no version.
      const recorded = recordedSql([]);
      const storage = createCommandCardStorage(logger, recorded.sql);

      const result = await storage.getCommandCardById('missing');

      // A card with no version is a 404, not an empty success.
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

      // The insert of an empty card returns the id the database assigned.
      const recorded = recordedSql([
        { command_card_id: '550e8400-e29b-41d4-a716-446655440099' },
      ]);
      const storage = createCommandCardStorage(logger, recorded.sql);

      const result = await storage.createEmptyCommandCard();

      // The caller gets the new id as the data.
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

      // No rows needed: an empty id list is answered without asking the
      // database.
      const recorded = recordedSql([]);
      const storage = createCommandCardStorage(logger, recorded.sql);

      const result = await storage.getCommandCardsByIds([]);

      expect(result).toStrictEqual({ data: [], success: true });
      // No statement ran for an empty list.
      expect(recorded.calls).toHaveLength(0);
    },
  );
});
