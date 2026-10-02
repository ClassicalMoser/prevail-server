import assert from 'node:assert/strict';
import type { LegalPlayerChoiceOptions } from '@classicalmoser/prevail-rules/domain';
import {
  createEmptyGameState,
  createUnitInstance,
  tempUnits,
} from '@classicalmoser/prevail-rules/domain';
import { pickRangedAttack } from './pick-ranged-attack';

const firstAlways = {
  nextFloat: (): number => 0,
};

const unitType = tempUnits[0];
assert.ok(unitType !== undefined);

const placed = {
  placement: { coordinate: 'E-5' as const, facing: 'north' as const },
  unit: createUnitInstance('white', unitType, 0),
};

const options = (
  overrides: Partial<
    Extract<
      LegalPlayerChoiceOptions,
      { choiceType: 'performRangedAttack' }
    >['rangedAttackers']
  > = {},
): Extract<
  LegalPlayerChoiceOptions,
  { choiceType: 'performRangedAttack' }
> => ({
  choiceType: 'performRangedAttack',
  expectedEventNumber: 9,
  playerSource: 'white',
  rangedAttackers: {
    attackers: [placed],
    player: 'white',
    ...overrides,
  },
});

describe('pickRangedAttack function', () => {
  it(
    'returns undefined when ranged attackers belong to the other player',
    { timeout: 5000 },
    () => {
      expect.hasAssertions();

      const choice = pickRangedAttack({
        actingPlayer: 'black',
        options: options(),
        random: firstAlways,
        state: createEmptyGameState('mini'),
      });

      expect(choice).toBeUndefined();
    },
  );

  it(
    'returns undefined when the attacker list is empty',
    { timeout: 5000 },
    () => {
      expect.hasAssertions();

      const choice = pickRangedAttack({
        actingPlayer: 'white',
        options: options({ attackers: [] }),
        random: firstAlways,
        state: createEmptyGameState('mini'),
      });

      expect(choice).toBeUndefined();
    },
  );
});
