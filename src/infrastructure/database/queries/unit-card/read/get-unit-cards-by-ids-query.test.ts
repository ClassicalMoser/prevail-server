import { recordedSql } from '@testing';
import { getUnitCardsByIdsQuery } from './get-unit-cards-by-ids-query';

describe('getUnitCardsByIdsQuery function', () => {
  it(
    'keeps the latest version of each requested unit card',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const produced = [{ unit_card_id: 'unit-1' }];
      const recorded = recordedSql(produced);
      const rows = await getUnitCardsByIdsQuery(recorded.sql, [
        'unit-1',
        'unit-2',
      ]);
      const call = recorded.calls[0];

      expect(call?.text).toContain('DISTINCT ON (ucv.unit_card_id)');
      expect(call?.values).toStrictEqual([['unit-1', 'unit-2']]);
      expect(rows).toStrictEqual(produced);
    },
  );
});
