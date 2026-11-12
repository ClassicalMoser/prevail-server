import { recordedSql } from '@testing';
import { getCurrentCommandCardsQuery } from './get-current-command-cards-query';

describe('getCurrentCommandCardsQuery function', () => {
  it(
    'orders certified command cards by initiative',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const produced = [{ command_card_id: 'card-1' }];
      // A recorded tag stands in for postgres; the test pins the statement
      // shape, not database behaviour.
      const recorded = recordedSql(produced);
      const rows = await getCurrentCommandCardsQuery(recorded.sql);
      const call = recorded.calls[0];

      // Command cards reach the player in initiative order, the order they act
      // in.
      expect(call?.text).toContain(
        "(command_card_definition->>'initiative')::int ASC",
      );
      // Nothing is bound: the latest rules version is found inside the
      // statement.
      expect(call?.values).toStrictEqual([]);
      expect(rows).toStrictEqual(produced);
    },
  );
});
