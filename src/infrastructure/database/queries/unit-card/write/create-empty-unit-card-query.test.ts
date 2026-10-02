import { recordedSql } from '@testing';
import { createEmptyUnitCardQuery } from './create-empty-unit-card-query';

describe('createEmptyUnitCardQuery function', () => {
  it(
    'inserts a unit card with database defaults and returns its id',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const produced = [{ unit_card_id: 'unit-1' }];
      const recorded = recordedSql(produced);
      const rows = await createEmptyUnitCardQuery(recorded.sql);
      const call = recorded.calls[0];

      expect(call?.text).toContain('INSERT INTO unit_cards DEFAULT VALUES');
      expect(call?.values).toStrictEqual([]);
      expect(rows).toStrictEqual(produced);
    },
  );
});
