import { recordedSql } from '@testing';
import { deleteEmptyCommandCardsQuery } from './delete-empty-command-cards-query';

describe('deleteEmptyCommandCardsQuery function', () => {
  it(
    'deletes command cards that have no version row',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      // A recorded tag stands in for postgres; the test pins the statement
      // shape, not database behaviour.
      const recorded = recordedSql();
      await deleteEmptyCommandCardsQuery(recorded.sql);
      const call = recorded.calls[0];

      // Cleans up a card left with no versions, for example after its only
      // version was deleted.
      expect(call?.text).toContain('DELETE FROM command_cards');
      // No values: the statement finds the empty cards itself.
      expect(call?.values).toStrictEqual([]);
    },
  );
});
