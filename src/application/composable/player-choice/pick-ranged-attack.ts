import {
  PLAYER_CHOICE_EVENT_TYPE,
  getLegalRangedAttackTargets,
} from '@classicalmoser/prevail-rules/domain';
import type {
  GameState,
  LegalPlayerChoiceOptions,
  PlayerChoiceEvent,
  PlayerSide,
} from '@classicalmoser/prevail-rules/domain';
import type { RandomSource } from './random-source';
import { pickOne } from './pick-one';
import { shuffleCopy } from './shuffle-copy';

const pickRangedAttack = (input: {
  options: Extract<
    LegalPlayerChoiceOptions,
    { choiceType: 'performRangedAttack' }
  >;
  actingPlayer: PlayerSide;
  state: GameState;
  random: RandomSource;
}): PlayerChoiceEvent | undefined => {
  const { options, actingPlayer, state, random } = input;
  const { rangedAttackers } = options;
  if (rangedAttackers.player !== actingPlayer) {
    return undefined;
  }
  const match = shuffleCopy(rangedAttackers.attackers, random)
    .map((unit) => {
      const option = {
        targetUnit: pickOne(getLegalRangedAttackTargets(unit, state), random),
        unit,
      };
      return option;
    })
    .find((entry) => entry.targetUnit !== undefined);
  if (match?.targetUnit === undefined) {
    return undefined;
  }
  const choice: PlayerChoiceEvent = {
    choiceType: 'performRangedAttack',
    eventNumber: options.expectedEventNumber,
    eventType: PLAYER_CHOICE_EVENT_TYPE,
    player: actingPlayer,
    supportingUnits: [],
    targetUnit: match.targetUnit,
    unit: match.unit,
  };
  return choice;
};

export { pickRangedAttack };
