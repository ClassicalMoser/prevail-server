import assert from 'node:assert/strict';
import type { LegalPlayerChoiceOptions } from '@classicalmoser/prevail-rules/domain';
import { createUnitInstance } from '@classicalmoser/prevail-rules/domain';
import { pickChooseMovingUnit, pickMoveUnit } from './pick-move-unit';
import { tempUnits } from '@testing';

const firstAlways = {
  nextFloat: (): number => 0,
};

const unitType = tempUnits[0];
assert.ok(unitType !== undefined);

const placed = {
  placement: { coordinate: 'E-5' as const, facing: 'north' as const },
  unit: createUnitInstance('white', unitType, 0),
};

const chooseOptions = (
  units: (typeof placed)[] = [placed],
): Extract<LegalPlayerChoiceOptions, { choiceType: 'chooseMovingUnit' }> => ({
  choiceType: 'chooseMovingUnit',
  moveUnits: { player: 'white', units },
  playerSource: 'white',
});

const moveOptions = (
  moves: Extract<
    LegalPlayerChoiceOptions,
    { choiceType: 'moveUnit' }
  >['moves'] = [
    {
      flexibilityUsed: 0,
      path: [],
      placement: placed.placement,
      speedUsed: 0,
    },
  ],
): Extract<LegalPlayerChoiceOptions, { choiceType: 'moveUnit' }> => ({
  choiceType: 'moveUnit',
  movingUnit: placed,
  moves,
  playerSource: 'white',
});

describe('pickChooseMovingUnit function', () => {
  it(
    'returns undefined when units belong to the other player',
    { timeout: 5000 },
    () => {
      expect.hasAssertions();

      expect(
        pickChooseMovingUnit(chooseOptions(), 'black', firstAlways),
      ).toBeUndefined();
    },
  );

  it('returns undefined when no unit may move', { timeout: 5000 }, () => {
    expect.hasAssertions();

    expect(
      pickChooseMovingUnit(chooseOptions([]), 'white', firstAlways),
    ).toBeUndefined();
  });

  it('names a unit that may move', { timeout: 5000 }, () => {
    expect.hasAssertions();

    expect(
      pickChooseMovingUnit(chooseOptions(), 'white', firstAlways),
    ).toStrictEqual({
      choiceType: 'chooseMovingUnit',
      eventType: 'playerChoice',
      player: 'white',
      unit: placed,
    });
  });
});

describe('pickMoveUnit function', () => {
  it(
    'returns undefined when the seat is the other player',
    { timeout: 5000 },
    () => {
      expect.hasAssertions();

      expect(pickMoveUnit(moveOptions(), 'black', firstAlways)).toBeUndefined();
    },
  );

  it('returns undefined when no move is legal', { timeout: 5000 }, () => {
    expect.hasAssertions();

    expect(pickMoveUnit(moveOptions([]), 'white', firstAlways)).toBeUndefined();
  });

  it('sends the path of a legal move', { timeout: 5000 }, () => {
    expect.hasAssertions();

    expect(pickMoveUnit(moveOptions(), 'white', firstAlways)).toStrictEqual({
      choiceType: 'moveUnit',
      eventType: 'playerChoice',
      moveCommander: false,
      path: [],
      player: 'white',
    });
  });
});
