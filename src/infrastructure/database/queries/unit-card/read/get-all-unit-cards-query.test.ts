import { recordedSql } from '@testing';
import { getAllUnitCardsQuery } from './get-all-unit-cards-query';

describe('getAllUnitCardsQuery function', () => {
  it(
    'lists every unit card with its latest version fields',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const produced = [{ unit_card_id: 'unit-1' }];
      const recorded = recordedSql(produced);
      const rows = await getAllUnitCardsQuery(recorded.sql);
      const call = recorded.calls[0];

      expect(call?.text).toContain('FROM unit_cards');
      expect(call?.values).toStrictEqual([]);
      expect(rows).toStrictEqual(produced);
    },
  );
});
