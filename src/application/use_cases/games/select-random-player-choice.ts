import type {
  GameState,
  LegalPlayerChoiceOptions,
  PlayerChoiceEvent,
  PlayerSide,
} from '@classicalmoser/prevail-rules/domain';
import { pickAssignUnitSupport } from './choice/pick-assign-unit-support';
import { pickEventForPlayer } from './choice/pick-event-for-player';
import { pickIssueCommand } from './choice/pick-issue-command';
import { pickMoveCommander } from './choice/pick-move-commander';
import { pickMoveUnit } from './choice/pick-move-unit';
import { pickRangedAttack } from './choice/pick-ranged-attack';
import { pickRoutDiscard } from './choice/pick-rout-discard';
import { pickSetupUnits } from './choice/pick-setup-units';
import { defaultRandom } from './choice/random-source';
import type { RandomSource } from './choice/random-source';

interface SelectRandomPlayerChoiceInput {
  options: LegalPlayerChoiceOptions;
  state: GameState;
  actingPlayer: PlayerSide;
  random?: RandomSource;
}

/**
 * Pure random selection of one legal player choice for `actingPlayer`.
 *
 * Returns `undefined` when that seat has no sampleable option. Legality still
 * comes from prevail-rules. This function only samples among the options the
 * rules already enumerated.
 *
 * @param input - Expected choice payload, current state, acting seat, and an optional random source.
 * @returns One player-choice event, or `undefined` when nothing can be sampled.
 */
const selectRandomPlayerChoice = (
  input: SelectRandomPlayerChoiceInput,
): PlayerChoiceEvent | undefined => {
  const { options, state, actingPlayer } = input;
  const random = input.random ?? defaultRandom;
  switch (options.choiceType) {
    case 'assignUnitSupport': {
      const choice = pickAssignUnitSupport(options, actingPlayer, random);
      return choice;
    }
    case 'chooseCard': {
      const choice = pickEventForPlayer(options.events, actingPlayer, random);
      return choice;
    }
    case 'chooseMeleeResolution': {
      const choice = pickEventForPlayer(options.events, actingPlayer, random);
      return choice;
    }
    case 'chooseRally': {
      const choice = pickEventForPlayer(options.events, actingPlayer, random);
      return choice;
    }
    case 'chooseRetreatOption': {
      const choice = pickEventForPlayer(options.events, actingPlayer, random);
      return choice;
    }
    case 'chooseWhetherToRetreat': {
      const choice = pickEventForPlayer(options.events, actingPlayer, random);
      return choice;
    }
    case 'commitToMelee': {
      const choice = pickEventForPlayer(options.events, actingPlayer, random);
      return choice;
    }
    case 'commitToMovement': {
      const choice = pickEventForPlayer(options.events, actingPlayer, random);
      return choice;
    }
    case 'commitToRangedAttack': {
      const choice = pickEventForPlayer(options.events, actingPlayer, random);
      return choice;
    }
    case 'doneIssuingCommands': {
      const choice = pickEventForPlayer(options.events, actingPlayer, random);
      return choice;
    }
    case 'chooseRoutDiscard': {
      const choice = pickRoutDiscard(options, actingPlayer, random);
      return choice;
    }
    case 'moveCommander': {
      const choice = pickMoveCommander(options, actingPlayer, random);
      return choice;
    }
    case 'moveUnit': {
      const choice = pickMoveUnit({ actingPlayer, options, random, state });
      return choice;
    }
    case 'issueCommand': {
      const choice = pickIssueCommand({ actingPlayer, options, random, state });
      return choice;
    }
    case 'performRangedAttack': {
      const choice = pickRangedAttack({ actingPlayer, options, random, state });
      return choice;
    }
    case 'setupUnits': {
      const choice = pickSetupUnits(options, actingPlayer, random);
      return choice;
    }
    default: {
      const _exhaustive: never = options;
      return _exhaustive;
    }
  }
};

export type { SelectRandomPlayerChoiceInput };
export { selectRandomPlayerChoice };
