import assert from 'node:assert/strict';
import type { LegalPlayerChoiceOptions } from '@classicalmoser/prevail-rules/domain';
import { tempUnits } from '@classicalmoser/prevail-rules/domain';
import { pickAssignUnitSupport } from './pick-assign-unit-support';

const firstAlways = {
  nextFloat: (): number => 0,
};

const unitType = tempUnits[0];
assert.ok(unitType !== undefined);

const unit = {
  instanceNumber: 0,
  playerSide: 'white' as const,
  unitType,
};

const options = (
  overrides: Partial<
    Extract<
      LegalPlayerChoiceOptions,
      { choiceType: 'assignUnitSupport' }
    >['assignUnitSupport']
  > = {},
): Extract<LegalPlayerChoiceOptions, { choiceType: 'assignUnitSupport' }> => ({
  choiceType: 'assignUnitSupport',
  expectedEventNumber: 6,
  playerSource: 'white',
  assignUnitSupport: {
    categories: [
      {
        eligibleUnits: [unit],
        unitSupport: { count: 1, supportType: 'generic' },
      },
    ],
    player: 'white',
    ...overrides,
  },
});

describe('pickAssignUnitSupport function', () => {
  it(
    'returns undefined when support belongs to the other player',
    { timeout: 5000 },
    () => {
      expect.hasAssertions();

      const choice = pickAssignUnitSupport(
        options({ player: 'black' }),
        'white',
        firstAlways,
      );

      expect(choice).toBeUndefined();
    },
  );

  it(
    'assigns an eligible unit into the first category',
    { timeout: 5000 },
    () => {
      expect.hasAssertions();

      const choice = pickAssignUnitSupport(options(), 'white', firstAlways);

      expect(choice).toMatchObject({
        assignments: [
          {
            unitSupport: { count: 1, supportType: 'generic' },
            units: [unit],
          },
        ],
        choiceType: 'assignUnitSupport',
        eventNumber: 6,
        player: 'white',
      });
    },
  );
});
