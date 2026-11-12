import { recordedSql } from '@testing';
import { getCommandCardsByIdsQuery } from './get-command-cards-by-ids-query';

describe('getCommandCardsByIdsQuery function', () => {
  it(
    'keeps the latest version of each requested command card',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const produced = [{ command_card_id: 'card-1' }];
      // A recorded tag stands in for postgres; the test pins the statement
      // shape, not database behaviour.
      const recorded = recordedSql(produced);
      // Two ids: an army names its command cards in one batch, not one query
      // each.
      const rows = await getCommandCardsByIdsQuery(recorded.sql, [
        'card-1',
        'card-2',
      ]);
      const call = recorded.calls[0];

      // DISTINCT ON keeps one row per card, so older versions of a card do not
      // appear.
      expect(call?.text).toContain('DISTINCT ON (ccv.command_card_id)');
      // The id list is bound as a single array parameter.
      expect(call?.values).toStrictEqual([['card-1', 'card-2']]);
      expect(rows).toStrictEqual(produced);
    },
  );
});
