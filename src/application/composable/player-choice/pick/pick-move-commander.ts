import { PLAYER_CHOICE_EVENT_TYPE } from '@classicalmoser/prevail-rules/domain';
import type {
  LegalPlayerChoiceOptions,
  PlayerChoiceEvent,
  PlayerSide,
} from '@classicalmoser/prevail-rules/domain';
import type { RandomSource } from '../random-source';
import { pickOne } from '../pick-one';

/**
 * Build a move-commander choice by drawing one legal destination.
 *
 * Returns undefined when the commander has no starting coordinate or the
 * destination list is empty so the caller can fall through to another pick.
 *
 * @param options - Legal move-commander options from the rules kernel.
 * @param actingPlayer - Side making the choice.
 * @param random - Source of the destination draw.
 * @returns A move-commander player-choice event, or undefined when unpickable.
 */
const pickMoveCommander = (
  options: Extract<LegalPlayerChoiceOptions, { choiceType: 'moveCommander' }>,
  actingPlayer: PlayerSide,
  random: RandomSource,
): PlayerChoiceEvent | undefined => {
  const { startingCoordinate, destinations } = options;
  if (startingCoordinate === null) {
    return undefined;
  }
  const to = pickOne(destinations, random);
  if (to === undefined) {
    return undefined;
  }
  const choice: PlayerChoiceEvent = {
    choiceType: 'moveCommander',
    eventNumber: options.expectedEventNumber,
    eventType: PLAYER_CHOICE_EVENT_TYPE,
    from: startingCoordinate,
    player: actingPlayer,
    to,
  };
  return choice;
};

export { pickMoveCommander };
