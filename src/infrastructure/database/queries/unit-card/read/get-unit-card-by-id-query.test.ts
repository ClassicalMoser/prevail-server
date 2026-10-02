import { recordedSql } from '@testing';
import { getUnitCardByIdQuery } from './get-unit-card-by-id-query';

describe('getUnitCardByIdQuery function', () => {
  it(
    'reads the latest version of the unit card this test named',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const produced = [{ unit_card_id: 'unit-1' }];
      const recorded = recordedSql(produced);
      const rows = await getUnitCardByIdQuery(recorded.sql, 'unit-1');
      const call = recorded.calls[0];

      expect(call?.text).toContain('unit_card_id');
      expect(call?.values).toStrictEqual(['unit-1']);
      expect(rows).toStrictEqual(produced);
    },
  );
});
