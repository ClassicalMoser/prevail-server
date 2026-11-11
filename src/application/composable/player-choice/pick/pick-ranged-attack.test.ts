import assert from 'node:assert/strict';
import type { LegalPlayerChoiceOptions } from '@classicalmoser/prevail-rules/domain';
import { createUnitInstance } from '@classicalmoser/prevail-rules/domain';
import { pickChooseShooter, pickRangedAttack } from './pick-ranged-attack';
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
const enemy = {
  placement: { coordinate: 'E-6' as const, facing: 'south' as const },
  unit: createUnitInstance('black', unitType, 0),
};

const chooseOptions = (
  attackers: (typeof placed)[] = [placed],
): Extract<LegalPlayerChoiceOptions, { choiceType: 'chooseShooter' }> => ({
  choiceType: 'chooseShooter',
  playerSource: 'white',
  rangedAttackers: { attackers, player: 'white' },
});

const aimOptions = (
  targets: (typeof enemy)[] = [enemy],
): Extract<
  LegalPlayerChoiceOptions,
  { choiceType: 'performRangedAttack' }
> => ({
  choiceType: 'performRangedAttack',
  shooter: placed,
  playerSource: 'white',
  targets,
});

describe('pickChooseShooter function', () => {
  it(
    'returns undefined when attackers belong to the other player',
    { timeout: 5000 },
    () => {
      expect.hasAssertions();

      expect(
        pickChooseShooter(chooseOptions(), 'black', firstAlways),
      ).toBeUndefined();
    },
  );

  it('returns undefined when no unit may fire', { timeout: 5000 }, () => {
    expect.hasAssertions();

    expect(
      pickChooseShooter(chooseOptions([]), 'white', firstAlways),
    ).toBeUndefined();
  });

  it('names a unit that may fire', { timeout: 5000 }, () => {
    expect.hasAssertions();

    expect(
      pickChooseShooter(chooseOptions(), 'white', firstAlways),
    ).toStrictEqual({
      choiceType: 'chooseShooter',
      eventType: 'playerChoice',
      player: 'white',
      unit: placed,
    });
  });
});

describe('pickRangedAttack function', () => {
  it(
    'returns undefined when the seat is the other player',
    { timeout: 5000 },
    () => {
      expect.hasAssertions();

      expect(
        pickRangedAttack(aimOptions(), 'black', firstAlways),
      ).toBeUndefined();
    },
  );

  it('returns undefined when there is no target', { timeout: 5000 }, () => {
    expect.hasAssertions();

    expect(
      pickRangedAttack(aimOptions([]), 'white', firstAlways),
    ).toBeUndefined();
  });

  it('aims at a legal target with no supporters', { timeout: 5000 }, () => {
    expect.hasAssertions();

    expect(pickRangedAttack(aimOptions(), 'white', firstAlways)).toStrictEqual({
      choiceType: 'performRangedAttack',
      eventType: 'playerChoice',
      player: 'white',
      supportingUnits: [],
      targetUnit: enemy,
    });
  });
});
