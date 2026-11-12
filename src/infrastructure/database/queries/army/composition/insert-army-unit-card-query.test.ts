import { recordedSql } from '@testing';
import { connectionClient } from '@infrastructure/database/connection-client';
import { insertArmyUnitCardQuery } from './insert-army-unit-card-query';

describe('insertArmyUnitCardQuery function', () => {
  it(
    'inserts the unit card id and the count this test set',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const recorded = recordedSql();
      const client = connectionClient(recorded.sql);
      // Four copies of one unit: a unit row carries a count, so one insert
      // covers all of them.
      const row = { army_id: 'army-1', unit_card_id: 'unit-1', quantity: 4 };
      await insertArmyUnitCardQuery(client, row);
      const call = recorded.calls[0];

      // Each unit type is one join row with a quantity.
      expect(call?.text).toContain('INSERT INTO army_unit_cards');
      // Army id, unit id, quantity, in column order.
      expect(call?.values).toStrictEqual(['army-1', 'unit-1', 4]);
    },
  );
});
