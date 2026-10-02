import { recordedSql } from '@testing';
import { getCurrentCommandCardsQuery } from './get-current-command-cards-query';

describe('getCurrentCommandCardsQuery function', () => {
  it(
    'orders certified command cards by initiative',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const produced = [{ command_card_id: 'card-1' }];
      const recorded = recordedSql(produced);
      const rows = await getCurrentCommandCardsQuery(recorded.sql);
      const call = recorded.calls[0];

      expect(call?.text).toContain(
        "(command_card_definition->>'initiative')::int ASC",
      );
      expect(call?.values).toStrictEqual([]);
      expect(rows).toStrictEqual(produced);
    },
  );
});
