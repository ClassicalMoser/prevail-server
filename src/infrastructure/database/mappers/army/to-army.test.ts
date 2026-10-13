import {
  tempCommandCards,
  tempUnits,
} from '@classicalmoser/prevail-rules/domain';
import { toArmy } from './to-army';

describe('toArmy function', () => {
  it(
    'keeps the id, name, units, and command cards this test assembled',
    { timeout: 5000 },
    () => {
      expect.hasAssertions();

      const units = [{ unitType: tempUnits[0], count: 1 }];
      const commandCards = [tempCommandCards[4]];
      const army = toArmy({
        armyId: 'army-1',
        armyName: 'Legion',
        units,
        commandCards,
      });

      expect(army).toStrictEqual({
        commandCards,
        id: 'army-1',
        name: 'Legion',
        units,
      });
    },
  );
});
