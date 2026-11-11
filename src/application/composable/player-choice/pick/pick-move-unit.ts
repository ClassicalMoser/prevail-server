import { PLAYER_CHOICE_EVENT_TYPE } from '@classicalmoser/prevail-rules/domain';
import type {
  LegalPlayerChoiceOptions,
  PlayerChoiceEvent,
  PlayerSide,
} from '@classicalmoser/prevail-rules/domain';
import type { RandomSource } from '../random-source';
import { pickOne } from '../pick-one';

/**
 * Name which ordered unit moves next (`chooseMovingUnit`).
 *
 * @param options - Legal options listing the units that may move.
 * @param actingPlayer - Side choosing.
 * @param random - Source of the uniform draw.
 * @returns A choose-moving-unit event, or undefined when the seat is not ours or no unit may move.
 */
const pickChooseMovingUnit = (
  options: Extract<
    LegalPlayerChoiceOptions,
    { choiceType: 'chooseMovingUnit' }
  >,
  actingPlayer: PlayerSide,
  random: RandomSource,
): PlayerChoiceEvent | undefined => {
  const { moveUnits } = options;
  if (moveUnits.player !== actingPlayer) {
    return undefined;
  }
  const unit = pickOne(moveUnits.units, random);
  if (unit === undefined) {
    return undefined;
  }
  const choice: PlayerChoiceEvent = {
    choiceType: 'chooseMovingUnit',
    eventType: PLAYER_CHOICE_EVENT_TYPE,
    player: actingPlayer,
    unit,
  };
  return choice;
};

/**
 * Write the move for the unit already named: one random legal ending, sent
 * as the path the rules supplied for it. The commander stays put.
 *
 * @param options - Legal options listing every legal move with its path.
 * @param actingPlayer - Side moving.
 * @param random - Source of the uniform draw.
 * @returns A move-unit event, or undefined when no move is legal.
 */
const pickMoveUnit = (
  options: Extract<LegalPlayerChoiceOptions, { choiceType: 'moveUnit' }>,
  actingPlayer: PlayerSide,
  random: RandomSource,
): PlayerChoiceEvent | undefined => {
  if (options.playerSource !== actingPlayer) {
    return undefined;
  }
  const move = pickOne(options.moves, random);
  if (move === undefined) {
    return undefined;
  }
  const choice: PlayerChoiceEvent = {
    choiceType: 'moveUnit',
    eventType: PLAYER_CHOICE_EVENT_TYPE,
    moveCommander: false,
    path: [...move.path],
    player: actingPlayer,
  };
  return choice;
};

export { pickChooseMovingUnit, pickMoveUnit };
