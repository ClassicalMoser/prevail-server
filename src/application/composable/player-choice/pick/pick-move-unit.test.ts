import assert from 'node:assert/strict';
import type { LegalPlayerChoiceOptions } from '@classicalmoser/prevail-rules/domain';
import {
  createEmptyGameState,
  createUnitInstance,
  tempUnits,
} from '@classicalmoser/prevail-rules/domain';
import { pickMoveUnit } from './pick-move-unit';

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
    Extract<LegalPlayerChoiceOptions, { choiceType: 'moveUnit' }>['moveUnits']
  > = {},
): Extract<LegalPlayerChoiceOptions, { choiceType: 'moveUnit' }> => ({
  choiceType: 'moveUnit',
  expectedEventNumber: 8,
  moveUnits: {
    player: 'white',
    units: [placed],
    ...overrides,
  },
  playerSource: 'white',
});

describe('pickMoveUnit function', () => {
  it(
    'returns undefined when move units belong to the other player',
    { timeout: 5000 },
    () => {
      expect.hasAssertions();

      const choice = pickMoveUnit({
        actingPlayer: 'black',
        options: options(),
        random: firstAlways,
        state: createEmptyGameState('mini'),
      });

      expect(choice).toBeUndefined();
    },
  );

  it(
    'returns undefined when no unit yields a legal destination',
    { timeout: 5000 },
    () => {
      expect.hasAssertions();

      const choice = pickMoveUnit({
        actingPlayer: 'white',
        options: options(),
        random: firstAlways,
        state: createEmptyGameState('mini'),
      });

      expect(choice).toBeUndefined();
    },
  );
});
