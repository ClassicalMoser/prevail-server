import { buildUnitCounts } from './build-unit-counts';
import { tempUnits } from '@testing';

describe('buildUnitCounts function', () => {
  it(
    'keeps the quantity for a known unit and drops an unknown id',
    { timeout: 5000 },
    () => {
      expect.hasAssertions();

      // One catalog unit type from the sample set.
      const unitType = tempUnits[1];
      const counts = buildUnitCounts(
        [
          { army_id: 'army-1', unit_card_id: unitType.id, quantity: 2 },
          // A unit id that is not in the catalog map: it is dropped rather than
          // counted.
          { army_id: 'army-1', unit_card_id: 'missing', quantity: 9 },
        ],
        new Map([[unitType.id, unitType]]),
      );

      // The known unit keeps its count of 2; the unknown one's 9 does not
      // appear.
      expect(counts).toStrictEqual([{ unitType, count: 2 }]);
    },
  );
});
