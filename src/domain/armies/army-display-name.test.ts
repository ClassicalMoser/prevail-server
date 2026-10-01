import { tempUnits } from '@classicalmoser/prevail-rules/domain';
import { UNTITLED_ARMY_NAME, armyDisplayName } from './army-display-name';

describe('armyDisplayName function', () => {
  /** The label uses the first unit only. Later units do not rename the list. */
  it('names the list from the first unit type', { timeout: 5000 }, () => {
    expect.hasAssertions();

    const first = tempUnits[0];
    const second = tempUnits[1];
    const name = armyDisplayName([
      { unitType: first, count: 2 },
      { unitType: second, count: 1 },
    ]);

    expect(name).toBe(`${first.name} list`);
  });

  it(
    'uses the untitled name when the unit list is empty',
    { timeout: 5000 },
    () => {
      expect.hasAssertions();

      const name = armyDisplayName([]);

      expect(name).toBe(UNTITLED_ARMY_NAME);
    },
  );
});
