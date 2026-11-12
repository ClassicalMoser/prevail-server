import { recordedSql } from '@testing';
import { createEmptyCommandCardQuery } from './create-empty-command-card-query';

describe('createEmptyCommandCardQuery function', () => {
  it(
    'inserts a command card with database defaults and returns its id',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const produced = [{ command_card_id: 'card-1' }];
      // A recorded tag stands in for postgres; the test pins the statement
      // shape, not database behaviour.
      const recorded = recordedSql(produced);
      const rows = await createEmptyCommandCardQuery(recorded.sql);
      const call = recorded.calls[0];

      // A new card starts as an empty row; its id comes from the database
      // default and the first version is added afterwards.
      expect(call?.text).toContain('INSERT INTO command_cards DEFAULT VALUES');
      // No values: the row is all defaults.
      expect(call?.values).toStrictEqual([]);
      expect(rows).toStrictEqual(produced);
    },
  );
});
