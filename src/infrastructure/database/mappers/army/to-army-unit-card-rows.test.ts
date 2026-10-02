import { tempUnits } from '@classicalmoser/prevail-rules/domain';
import { toArmyUnitCardRows } from './to-army-unit-card-rows';

describe('toArmyUnitCardRows function', () => {
  it(
    'writes the unit type id and the count this test set',
    { timeout: 5000 },
    () => {
      expect.hasAssertions();

      const unitType = tempUnits[0];
      const rows = toArmyUnitCardRows('army-1', [{ unitType, count: 3 }]);

      expect(rows).toStrictEqual([
        {
          army_id: 'army-1',
          unit_card_id: unitType.id,
          quantity: 3,
        },
      ]);
    },
  );
});
