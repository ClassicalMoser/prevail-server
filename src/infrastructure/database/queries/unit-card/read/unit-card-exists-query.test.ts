import { recordedSql } from '@testing';
import { unitCardExistsQuery } from './unit-card-exists-query';

describe('unitCardExistsQuery function', () => {
  it(
    'looks up the unit card id this test named',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const produced = [{ unit_card_id: 'unit-1' }];
      // A recorded tag stands in for postgres; the test pins the statement
      // shape, not database behaviour.
      const recorded = recordedSql(produced);
      const rows = await unitCardExistsQuery(recorded.sql, 'unit-1');
      const call = recorded.calls[0];

      // Existence is checked against the card table itself, not a particular
      // version.
      expect(call?.text).toContain('FROM unit_cards');
      // The card id is bound as a parameter.
      expect(call?.values).toStrictEqual(['unit-1']);
      expect(rows).toStrictEqual(produced);
    },
  );
});
