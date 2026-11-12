import { recordedSql } from '@testing';
import { createEmptyUnitCardQuery } from './create-empty-unit-card-query';

describe('createEmptyUnitCardQuery function', () => {
  it(
    'inserts a unit card with database defaults and returns its id',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const produced = [{ unit_card_id: 'unit-1' }];
      // A recorded tag stands in for postgres; the test pins the statement
      // shape, not database behaviour.
      const recorded = recordedSql(produced);
      const rows = await createEmptyUnitCardQuery(recorded.sql);
      const call = recorded.calls[0];

      // A new card starts as an empty row; its id comes from the database
      // default and the first version is added afterwards.
      expect(call?.text).toContain('INSERT INTO unit_cards DEFAULT VALUES');
      // No values: the row is all defaults.
      expect(call?.values).toStrictEqual([]);
      expect(rows).toStrictEqual(produced);
    },
  );
});
