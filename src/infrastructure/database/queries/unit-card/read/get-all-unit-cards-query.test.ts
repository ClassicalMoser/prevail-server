import { recordedSql } from '@testing';
import { getAllUnitCardsQuery } from './get-all-unit-cards-query';

describe('getAllUnitCardsQuery function', () => {
  it(
    'lists every unit card with its latest version fields',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const produced = [{ unit_card_id: 'unit-1' }];
      // A recorded tag stands in for postgres; the test pins the statement
      // shape, not database behaviour.
      const recorded = recordedSql(produced);
      const rows = await getAllUnitCardsQuery(recorded.sql);
      const call = recorded.calls[0];

      // Every unit card is listed with its latest version.
      expect(call?.text).toContain('FROM unit_cards');
      // No filter: an author sees every card, certified or not, so nothing is
      // bound.
      expect(call?.values).toStrictEqual([]);
      expect(rows).toStrictEqual(produced);
    },
  );
});
