import { recordedSql } from '@testing';
import { getCurrentUnitCardsQuery } from './get-current-unit-cards-query';

describe('getCurrentUnitCardsQuery function', () => {
  it(
    'keeps unit cards certified against the highest rules version',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const produced = [{ unit_card_id: 'unit-1' }];
      // A recorded tag stands in for postgres; the test pins the statement
      // shape, not database behaviour.
      const recorded = recordedSql(produced);
      const rows = await getCurrentUnitCardsQuery(recorded.sql);
      const call = recorded.calls[0];

      // Only certified versions are offered to players, so a rules change hides
      // units until they are certified again.
      expect(call?.text).toContain('unit_card_certifications');
      // Nothing is bound: the latest rules version is found inside the
      // statement.
      expect(call?.values).toStrictEqual([]);
      expect(rows).toStrictEqual(produced);
    },
  );
});
