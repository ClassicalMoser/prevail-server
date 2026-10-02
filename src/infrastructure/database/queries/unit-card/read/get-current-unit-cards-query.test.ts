import { recordedSql } from '@testing';
import { getCurrentUnitCardsQuery } from './get-current-unit-cards-query';

describe('getCurrentUnitCardsQuery function', () => {
  it(
    'keeps unit cards certified against the highest rules version',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const produced = [{ unit_card_id: 'unit-1' }];
      const recorded = recordedSql(produced);
      const rows = await getCurrentUnitCardsQuery(recorded.sql);
      const call = recorded.calls[0];

      expect(call?.text).toContain('unit_card_certifications');
      expect(call?.values).toStrictEqual([]);
      expect(rows).toStrictEqual(produced);
    },
  );
});
