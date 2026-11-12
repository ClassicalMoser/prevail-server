import { toArmy } from './to-army';
import { tempCommandCards, tempUnits } from '@testing';

describe('toArmy function', () => {
  it(
    'keeps the id, name, units, and command cards this test assembled',
    { timeout: 5000 },
    () => {
      expect.hasAssertions();

      // An army with one unit type and one command card from the sample
      // catalog.
      const units = [{ unitType: tempUnits[0], count: 1 }];
      const commandCards = [tempCommandCards[4]];
      const army = toArmy({
        armyId: 'army-1',
        armyName: 'Legion',
        units,
        commandCards,
      });

      // The same units and cards come through; only the id and name are renamed
      // to domain fields.
      expect(army).toStrictEqual({
        commandCards,
        id: 'army-1',
        name: 'Legion',
        units,
      });
    },
  );
});
