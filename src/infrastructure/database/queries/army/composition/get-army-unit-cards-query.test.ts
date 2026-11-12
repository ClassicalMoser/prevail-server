import { recordedSql } from '@testing';
import { getArmyUnitCardsQuery } from './get-army-unit-cards-query';

describe('getArmyUnitCardsQuery function', () => {
  it(
    'reads unit quantities for the army this test named',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      // One unit-card join row, as the table would hold it.
      const produced = [
        { army_id: 'army-1', unit_card_id: 'unit-1', quantity: 2 },
      ];
      const recorded = recordedSql(produced);
      const rows = await getArmyUnitCardsQuery(recorded.sql, 'army-1');
      const call = recorded.calls[0];

      // The army's units are read from the join table, with a count per unit.
      expect(call?.text).toContain('FROM army_unit_cards');
      // Scoped to one army id.
      expect(call?.values).toStrictEqual(['army-1']);
      expect(rows).toStrictEqual(produced);
    },
  );
});
