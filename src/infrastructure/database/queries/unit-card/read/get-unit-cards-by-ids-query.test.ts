import { recordedSql } from '@testing';
import { getUnitCardsByIdsQuery } from './get-unit-cards-by-ids-query';

describe('getUnitCardsByIdsQuery function', () => {
  it(
    'keeps the latest version of each requested unit card',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const produced = [{ unit_card_id: 'unit-1' }];
      // A recorded tag stands in for postgres; the test pins the statement
      // shape, not database behaviour.
      const recorded = recordedSql(produced);
      // Two ids: an army names its unit cards in one batch, not one query each.
      const rows = await getUnitCardsByIdsQuery(recorded.sql, [
        'unit-1',
        'unit-2',
      ]);
      const call = recorded.calls[0];

      // DISTINCT ON keeps one row per card, so older versions of a unit do not
      // appear.
      expect(call?.text).toContain('DISTINCT ON (ucv.unit_card_id)');
      // The id list is bound as a single array parameter.
      expect(call?.values).toStrictEqual([['unit-1', 'unit-2']]);
      expect(rows).toStrictEqual(produced);
    },
  );
});
