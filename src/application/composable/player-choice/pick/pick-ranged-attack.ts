import { PLAYER_CHOICE_EVENT_TYPE } from '@classicalmoser/prevail-rules/domain';
import type {
  LegalPlayerChoiceOptions,
  PlayerChoiceEvent,
  PlayerSide,
} from '@classicalmoser/prevail-rules/domain';
import type { RandomSource } from '../random-source';
import { pickOne } from '../pick-one';

/**
 * Name which ordered unit fires next (`chooseFiringUnit`).
 *
 * @param options - Legal options listing the units that may fire.
 * @param actingPlayer - Side choosing.
 * @param random - Source of the uniform draw.
 * @returns A choose-firing-unit event, or undefined when the seat is not ours or no unit may fire.
 */
const pickChooseFiringUnit = (
  options: Extract<
    LegalPlayerChoiceOptions,
    { choiceType: 'chooseFiringUnit' }
  >,
  actingPlayer: PlayerSide,
  random: RandomSource,
): PlayerChoiceEvent | undefined => {
  const { rangedAttackers } = options;
  if (rangedAttackers.player !== actingPlayer) {
    return undefined;
  }
  const unit = pickOne(rangedAttackers.attackers, random);
  if (unit === undefined) {
    return undefined;
  }
  const choice: PlayerChoiceEvent = {
    choiceType: 'chooseFiringUnit',
    eventNumber: options.expectedEventNumber,
    eventType: PLAYER_CHOICE_EVENT_TYPE,
    player: actingPlayer,
    unit,
  };
  return choice;
};

/**
 * Aim the shot of the unit already named at one random legal target.
 * Supporting units stay empty; the auto-picker only commits a primary shot.
 *
 * @param options - Legal options listing the targets.
 * @param actingPlayer - Side shooting.
 * @param random - Source of the uniform draw.
 * @returns A perform-ranged-attack event, or undefined when no target is legal.
 */
const pickRangedAttack = (
  options: Extract<
    LegalPlayerChoiceOptions,
    { choiceType: 'performRangedAttack' }
  >,
  actingPlayer: PlayerSide,
  random: RandomSource,
): PlayerChoiceEvent | undefined => {
  if (options.playerSource !== actingPlayer) {
    return undefined;
  }
  const targetUnit = pickOne(options.targets, random);
  if (targetUnit === undefined) {
    return undefined;
  }
  const choice: PlayerChoiceEvent = {
    choiceType: 'performRangedAttack',
    eventNumber: options.expectedEventNumber,
    eventType: PLAYER_CHOICE_EVENT_TYPE,
    player: actingPlayer,
    supportingUnits: [],
    targetUnit,
  };
  return choice;
};

export { pickChooseFiringUnit, pickRangedAttack };
