import assert from 'node:assert/strict';
import type { LegalPlayerChoiceOptions } from '@classicalmoser/prevail-rules/domain';
import { tempUnits } from '@classicalmoser/prevail-rules/domain';
import { pickSetupUnits } from './pick-setup-units';

const firstAlways = {
  nextFloat: (): number => 0,
};

const unitType = tempUnits[0];
assert.ok(unitType !== undefined);

const options = (
  overrides: Partial<
    Extract<
      LegalPlayerChoiceOptions,
      { choiceType: 'setupUnits' }
    >['setupUnits']
  > = {},
): Extract<LegalPlayerChoiceOptions, { choiceType: 'setupUnits' }> => ({
  choiceType: 'setupUnits',
  expectedEventNumber: 1,
  playerSource: 'white',
  setupUnits: {
    coordinates: ['E-5', 'E-6', 'E-7'],
    player: 'white',
    units: [
      {
        instanceNumber: 0,
        playerSide: 'white',
        unitType,
      },
      {
        instanceNumber: 1,
        playerSide: 'white',
        unitType,
      },
    ],
    ...overrides,
  },
});

describe('pickSetupUnits function', () => {
  it(
    'returns undefined when setup belongs to the other player',
    { timeout: 5000 },
    () => {
      expect.hasAssertions();

      const choice = pickSetupUnits(
        options({ player: 'black' }),
        'white',
        firstAlways,
      );

      expect(choice).toBeUndefined();
    },
  );

  it(
    'returns undefined when there are fewer coordinates than units',
    { timeout: 5000 },
    () => {
      expect.hasAssertions();

      const choice = pickSetupUnits(
        options({ coordinates: ['E-5'] }),
        'white',
        firstAlways,
      );

      expect(choice).toBeUndefined();
    },
  );

  it(
    'places white units facing south with the first placement as commander',
    { timeout: 5000 },
    () => {
      expect.hasAssertions();

      const choice = pickSetupUnits(options(), 'white', firstAlways);

      assert.ok(choice !== undefined);
      assert.ok(choice.choiceType === 'setupUnits');
      expect(choice.commanderCoordinate).toBe(
        choice.unitPlacements[0]?.placement.coordinate,
      );
      expect(choice.unitPlacements).toHaveLength(2);
      expect(choice.unitPlacements[0]?.placement.facing).toBe('south');
    },
  );
});
