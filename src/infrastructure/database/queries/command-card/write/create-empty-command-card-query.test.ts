import { recordedSql } from '@testing';
import { createEmptyCommandCardQuery } from './create-empty-command-card-query';

describe('createEmptyCommandCardQuery function', () => {
  it(
    'inserts a command card with database defaults and returns its id',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const produced = [{ command_card_id: 'card-1' }];
      const recorded = recordedSql(produced);
      const rows = await createEmptyCommandCardQuery(recorded.sql);
      const call = recorded.calls[0];

      expect(call?.text).toContain('INSERT INTO command_cards DEFAULT VALUES');
      expect(call?.values).toStrictEqual([]);
      expect(rows).toStrictEqual(produced);
    },
  );
});
