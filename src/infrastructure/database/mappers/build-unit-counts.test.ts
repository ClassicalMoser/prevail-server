import { tempUnits } from '@classicalmoser/prevail-rules/domain';
import { buildUnitCounts } from './build-unit-counts';

describe('buildUnitCounts function', () => {
  it(
    'keeps the quantity for a known unit and drops an unknown id',
    { timeout: 5000 },
    () => {
      expect.hasAssertions();

      const unitType = tempUnits[1];
      const counts = buildUnitCounts(
        [
          { army_id: 'army-1', unit_card_id: unitType.id, quantity: 2 },
          { army_id: 'army-1', unit_card_id: 'missing', quantity: 9 },
        ],
        new Map([[unitType.id, unitType]]),
      );

      expect(counts).toStrictEqual([{ unitType, count: 2 }]);
    },
  );
});
