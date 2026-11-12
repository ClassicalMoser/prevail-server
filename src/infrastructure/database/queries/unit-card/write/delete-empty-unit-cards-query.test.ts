import { recordedSql } from '@testing';
import { deleteEmptyUnitCardsQuery } from './delete-empty-unit-cards-query';

describe('deleteEmptyUnitCardsQuery function', () => {
  it(
    'deletes unit cards that have no version row',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      // A recorded tag stands in for postgres; the test pins the statement
      // shape, not database behaviour.
      const recorded = recordedSql();
      await deleteEmptyUnitCardsQuery(recorded.sql);
      const call = recorded.calls[0];

      // Cleans up a card left with no versions, for example after its only
      // version was deleted.
      expect(call?.text).toContain('DELETE FROM unit_cards');
      // No values: the statement finds the empty cards itself.
      expect(call?.values).toStrictEqual([]);
    },
  );
});
