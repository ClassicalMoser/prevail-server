import { recordedSql } from '@testing';
import { getAllCommandCardsQuery } from './get-all-command-cards-query';

describe('getAllCommandCardsQuery function', () => {
  it(
    'lists every command card with its latest version fields',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const produced = [{ command_card_id: 'card-1' }];
      // A recorded tag stands in for postgres; the test pins the statement
      // shape, not database behaviour.
      const recorded = recordedSql(produced);
      const rows = await getAllCommandCardsQuery(recorded.sql);
      const call = recorded.calls[0];

      expect(call?.text).toContain('FROM command_cards');
      // No filter: an author sees every card, certified or not, so nothing is
      // bound.
      expect(call?.values).toStrictEqual([]);
      expect(rows).toStrictEqual(produced);
    },
  );
});
